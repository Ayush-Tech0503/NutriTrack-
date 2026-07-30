# NutriTrack

NutriTrack is a premium diet tracking web application built with Next.js 15, FastAPI, PostgreSQL, SQLAlchemy, JWT auth, bcrypt, Tailwind CSS, shadcn-style UI primitives, and Recharts.

## What is included

- Marketing landing page
- Login, register, and forgot-password screens
- Authenticated dashboard
- Meal tracker
- Food database backed by the attached `Protein-List.pdf`
- Water tracker
- Weight tracker
- Analytics and reports
- Profile, settings, and admin views
- FastAPI backend with PostgreSQL models
- PDF nutrition seeder

## Repository layout

- `frontend/` Next.js application
- `backend/` FastAPI application and database models

## Local setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.scripts.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

### Backend

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_ORIGIN`
- `PROTEIN_PDF_PATH`

### Frontend

- `NEXT_PUBLIC_API_URL`

## Deployment

- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL

Set the backend `DATABASE_URL` to your managed PostgreSQL instance and point `PROTEIN_PDF_PATH` at the nutrition PDF during seeding.

