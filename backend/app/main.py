from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from .database import engine, Base
from .routers import auth, courses, tasks, planner, analytics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LMS with Smart Study Planner",
    description="A Learning Management System with intelligent study planning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "LMS API is running", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)
