from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import date, timedelta
from ..database import get_db
from ..models.models import Course, Task, StudyPlan, Progress
from ..schemas.schemas import AnalyticsOverview, CourseProgress, WeeklyStudy
from ..routers.auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Total courses
    total_courses = db.query(Course).filter(Course.user_id == current_user.id).count()
    
    # Total tasks
    total_tasks = db.query(Task).join(Course).filter(Course.user_id == current_user.id).count()
    
    # Completed tasks
    completed_tasks = db.query(Task).join(Course).filter(
        Course.user_id == current_user.id,
        Task.status == "completed"
    ).count()
    
    # Pending tasks
    pending_tasks = db.query(Task).join(Course).filter(
        Course.user_id == current_user.id,
        Task.status == "pending"
    ).count()
    
    # Total study hours (from study plans)
    total_study_hours = db.query(StudyPlan).filter(
        StudyPlan.user_id == current_user.id,
        StudyPlan.start_time != None,
        StudyPlan.end_time != None
    ).all()
    
    total_hours = 0
    for plan in total_study_hours:
        if plan.start_time and plan.end_time:
            start_hours = plan.start_time.hour + plan.start_time.minute / 60
            end_hours = plan.end_time.hour + plan.end_time.minute / 60
            total_hours += (end_hours - start_hours)
    
    # Upcoming deadlines (next 7 days)
    end_date = date.today() + timedelta(days=7)
    upcoming_deadlines = db.query(Task).join(Course).filter(
        Course.user_id == current_user.id,
        Task.deadline != None,
        Task.deadline <= end_date,
        Task.status != "completed"
    ).count()
    
    return AnalyticsOverview(
        total_courses=total_courses,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        total_study_hours=round(total_hours, 2),
        upcoming_deadlines=upcoming_deadlines
    )

@router.get("/progress", response_model=List[CourseProgress])
def get_course_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    
    progress_list = []
    for course in courses:
        tasks_total = db.query(Task).filter(Task.course_id == course.id).count()
        tasks_completed = db.query(Task).filter(
            Task.course_id == course.id,
            Task.status == "completed"
        ).count()
        
        completion_percentage = (tasks_completed / tasks_total * 100) if tasks_total > 0 else 0
        
        progress_list.append(CourseProgress(
            course_id=course.id,
            course_title=course.title,
            completion_percentage=round(completion_percentage, 2),
            tasks_total=tasks_total,
            tasks_completed=tasks_completed
        ))
    
    return progress_list

@router.get("/weekly", response_model=List[WeeklyStudy])
def get_weekly_study_hours(
    weeks: int = 4,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get study hours for the past N weeks"""
    result = []
    
    for i in range(weeks):
        week_end = date.today() - timedelta(days=i * 7)
        week_start = week_end - timedelta(days=6)
        
        plans = db.query(StudyPlan).filter(
            StudyPlan.user_id == current_user.id,
            StudyPlan.scheduled_date >= week_start,
            StudyPlan.scheduled_date <= week_end,
            StudyPlan.start_time != None,
            StudyPlan.end_time != None
        ).all()
        
        total_hours = 0
        for plan in plans:
            if plan.start_time and plan.end_time:
                start_hours = plan.start_time.hour + plan.start_time.minute / 60
                end_hours = plan.end_time.hour + plan.end_time.minute / 60
                total_hours += (end_hours - start_hours)
        
        result.append(WeeklyStudy(
            date=week_start,
            study_hours=round(total_hours, 2)
        ))
    
    return result