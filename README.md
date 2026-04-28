# Learning Management System with Smart Study Planner

A full-stack student productivity platform for managing courses, tasks, study plans, and progress analytics from one place.

## Submission Contents

This repository is prepared for project submission and includes:

- Complete frontend and backend source code
- Project report inside the `Document/` folder
- Demo folder for the project walkthrough video

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: FastAPI, SQLAlchemy
- Database: PostgreSQL
- Authentication: JWT

## Repository Structure

```text
lms-project/
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |-- routers/
|   |   |-- schemas/
|   |   |-- utils/
|   |   |-- database.py
|   |   `-- main.py
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|-- Document/
|   |-- LMS_Project_Report.md
|   `-- README.md
|-- Demo/
|   `-- README.md
|-- .gitignore
`-- README.md
```

## Main Features

- User signup and login with JWT authentication
- Course creation, update, listing, and deletion
- Task creation with deadline, priority, and estimated hours
- One-click task completion
- Smart study plan generation
- Dashboard overview for academic workload
- Analytics charts for progress visibility

## Backend Modules

- `auth.py`: login, signup, current user handling
- `courses.py`: course CRUD operations
- `tasks.py`: task CRUD and completion flow
- `planner.py`: study plan generation and planner views
- `analytics.py`: dashboard and progress endpoints

## Frontend Pages

- `Landing.jsx`: entry page
- `Login.jsx` and `Signup.jsx`: authentication
- `Dashboard.jsx`: overview cards and progress
- `Courses.jsx`: course management
- `Tasks.jsx`: task management
- `Planner.jsx`: study session planning
- `Analytics.jsx`: charts and reports

## Setup Instructions

### Prerequisites

- Python 3.9 or later
- Node.js 18 or later
- PostgreSQL

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env` with your PostgreSQL database credentials.

Create the database:

```sql
CREATE DATABASE lms_db;
```

Run the backend server:

```bash
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Overview

- `POST /api/signup`
- `POST /api/login`
- `GET /api/courses`
- `POST /api/courses`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{task_id}/complete`
- `POST /api/planner/generate`
- `GET /api/analytics/overview`

## Submission Notes

- Put the final project report PDF in `Document/`
- Put the demo video in `Demo/`
- Do not upload `node_modules`, virtual environments, or secret `.env` files
