from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Course, Task, Progress
from ..schemas.schemas import CourseCreate, CourseUpdate, CourseResponse
from ..routers.auth import get_current_user
from ..models.models import User

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    courses = db.query(Course).filter(Course.user_id == current_user.id).all()
    return courses

@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_course = Course(
        user_id=current_user.id,
        title=course.title,
        description=course.description,
        category=course.category
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    
    # Create initial progress entry
    progress = Progress(
        user_id=current_user.id,
        course_id=new_course.id,
        completion_percentage=0
    )
    db.add(progress)
    db.commit()
    
    return new_course

@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseResponse)
def update_course(course_id: int, course_update: CourseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course_update.title is not None:
        course.title = course_update.title
    if course_update.description is not None:
        course.description = course_update.description
    if course_update.category is not None:
        course.category = course_update.category
    
    db.commit()
    db.refresh(course)
    return course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == current_user.id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete related tasks and progress
    db.query(Task).filter(Task.course_id == course_id).delete()
    db.query(Progress).filter(Progress.course_id == course_id).delete()
    db.delete(course)
    db.commit()
    return None