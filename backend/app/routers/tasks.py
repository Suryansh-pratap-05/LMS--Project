from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..database import get_db
from ..models.models import Task, Course, Progress
from ..schemas.schemas import TaskCreate, TaskUpdate, TaskResponse
from ..routers.auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    course_id: int = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task).join(Course).filter(Course.user_id == current_user.id)
    
    if course_id:
        query = query.filter(Task.course_id == course_id)
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.all()
    return tasks

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify course belongs to user
    course = db.query(Course).filter(Course.id == task.course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    new_task = Task(
        course_id=task.course_id,
        title=task.title,
        description=task.description,
        deadline=task.deadline,
        estimated_hours=task.estimated_hours,
        priority=task.priority,
        status="pending"
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).join(Course).filter(Task.id == task_id, Course.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).join(Course).filter(Task.id == task_id, Course.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.deadline is not None:
        task.deadline = task_update.deadline
    if task_update.estimated_hours is not None:
        task.estimated_hours = task_update.estimated_hours
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.priority is not None:
        task.priority = task_update.priority
    
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).join(Course).filter(Task.id == task_id, Course.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).join(Course).filter(Task.id == task_id, Course.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update progress
    progress = db.query(Progress).filter(Progress.task_id == task_id).first()
    if progress:
        progress.completion_percentage = 100
    
    db.delete(task)
    db.commit()
    return None