from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, time

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Course Schemas
class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

class CourseResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    category: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Task Schemas
class TaskCreate(BaseModel):
    course_id: int
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    estimated_hours: Optional[float] = None
    priority: Optional[str] = "medium"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    estimated_hours: Optional[float] = None
    status: Optional[str] = None
    priority: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    deadline: Optional[date]
    estimated_hours: Optional[float]
    status: str
    priority: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Study Plan Schemas
class StudyPlanCreate(BaseModel):
    task_id: int
    scheduled_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class StudyPlanUpdate(BaseModel):
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    completed: Optional[bool] = None

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    scheduled_date: date
    start_time: Optional[time]
    end_time: Optional[time]
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Progress Schemas
class ProgressUpdate(BaseModel):
    completion_percentage: float

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    course_id: int
    task_id: Optional[int]
    completion_percentage: float
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsOverview(BaseModel):
    total_courses: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    total_study_hours: float
    upcoming_deadlines: int

class CourseProgress(BaseModel):
    course_id: int
    course_title: str
    completion_percentage: float
    tasks_total: int
    tasks_completed: int

class WeeklyStudy(BaseModel):
    date: date
    study_hours: float