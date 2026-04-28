from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta, time
from ..database import get_db
from ..models.models import StudyPlan, Task, Course
from ..schemas.schemas import StudyPlanCreate, StudyPlanUpdate, StudyPlanResponse
from ..routers.auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/planner", tags=["Study Planner"])

@router.get("", response_model=List[StudyPlanResponse])
def get_study_plans(
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(StudyPlan).filter(StudyPlan.user_id == current_user.id)
    
    if start_date:
        query = query.filter(StudyPlan.scheduled_date >= start_date)
    if end_date:
        query = query.filter(StudyPlan.scheduled_date <= end_date)
    
    plans = query.order_by(StudyPlan.scheduled_date).all()
    return plans

@router.post("", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_study_plan(
    plan: StudyPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify task belongs to user
    task = db.query(Task).join(Course).filter(Task.id == plan.task_id, Course.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    new_plan = StudyPlan(
        user_id=current_user.id,
        task_id=plan.task_id,
        scheduled_date=plan.scheduled_date,
        start_time=plan.start_time,
        end_time=plan.end_time
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.post("/generate", response_model=List[StudyPlanResponse])
def generate_study_plan(
    days_ahead: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Auto-generate study schedule based on task deadlines and estimated hours"""
    # Get pending tasks with deadlines
    tasks = db.query(Task).join(Course).filter(
        Course.user_id == current_user.id,
        Task.status == "pending",
        Task.deadline != None
    ).all()
    
    if not tasks:
        return []
    
    # Calculate study hours per day (assuming 4 hours max per day)
    max_hours_per_day = 4
    study_plans = []
    
    # Get existing plans to avoid conflicts
    start_date = date.today()
    end_date = start_date + timedelta(days=days_ahead)
    
    existing_plans = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.scheduled_date >= start_date,
        StudyPlan.scheduled_date <= end_date
    ).all()
    
    # Create a schedule map
    schedule_map = {}
    for plan in existing_plans:
        day_key = plan.scheduled_date.isoformat()
        if day_key not in schedule_map:
            schedule_map[day_key] = 0
        if plan.start_time and plan.end_time:
            start_hours = plan.start_time.hour + plan.start_time.minute / 60
            end_hours = plan.end_time.hour + plan.end_time.minute / 60
            schedule_map[day_key] += (end_hours - start_hours)
    
    # Sort tasks by deadline (earliest first) and priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    tasks.sort(key=lambda t: (t.deadline, priority_order.get(t.priority, 1)))
    
    current_date = start_date
    
    for task in tasks:
        if task.deadline and task.deadline < start_date:
            continue  # Skip overdue tasks
        
        remaining_hours = float(task.estimated_hours or 2)
        
        while remaining_hours > 0:
            # Find next available day
            while current_date <= (task.deadline or (start_date + timedelta(days=days_ahead))):
                day_key = current_date.isoformat()
                used_hours = schedule_map.get(day_key, 0)
                available_hours = max_hours_per_day - used_hours
                
                if available_hours > 0.5:  # At least 30 minutes
                    # Calculate time slot
                    start_hour = 9 + int(used_hours)
                    end_hour = min(start_hour + int(remaining_hours), 18)
                    
                    if end_hour > start_hour:
                        plan = StudyPlan(
                            user_id=current_user.id,
                            task_id=task.id,
                            scheduled_date=current_date,
                            start_time=time(start_hour, 0),
                            end_time=time(end_hour, 0)
                        )
                        db.add(plan)
                        study_plans.append(plan)
                        
                        # Update schedule map
                        schedule_map[day_key] = start_hour + (end_hour - start_hour)
                        remaining_hours -= (end_hour - start_hour)
                        
                        if remaining_hours <= 0:
                            break
                
                current_date += timedelta(days=1)
                break
            else:
                break  # No more days available before deadline
    
    db.commit()
    for plan in study_plans:
        db.refresh(plan)
    
    return study_plans

@router.get("/deadlines", response_model=List[dict])
def get_upcoming_deadlines(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get upcoming task deadlines"""
    end_date = date.today() + timedelta(days=days)
    
    tasks = db.query(Task).join(Course).filter(
        Course.user_id == current_user.id,
        Task.deadline != None,
        Task.deadline <= end_date,
        Task.status != "completed"
    ).order_by(Task.deadline).all()
    
    return [
        {
            "task_id": task.id,
            "task_title": task.title,
            "course_id": task.course_id,
            "deadline": task.deadline,
            "priority": task.priority,
            "days_left": (task.deadline - date.today()).days
        }
        for task in tasks
    ]

@router.put("/{plan_id}", response_model=StudyPlanResponse)
def update_study_plan(
    plan_id: int,
    plan_update: StudyPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    if plan_update.scheduled_date is not None:
        plan.scheduled_date = plan_update.scheduled_date
    if plan_update.start_time is not None:
        plan.start_time = plan_update.start_time
    if plan_update.end_time is not None:
        plan.end_time = plan_update.end_time
    if plan_update.completed is not None:
        plan.completed = plan_update.completed
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_plan(plan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    db.delete(plan)
    db.commit()
    return None