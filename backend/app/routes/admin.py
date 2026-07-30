from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import FoodCustom, FoodDefault, User
from app.routes.auth import get_current_user
from app.schemas import FoodCreate
from app.schemas import UserRead

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users", response_model=list[UserRead])
def users(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/foods")
def foods(db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    return {
        "default": db.query(FoodDefault).count(),
        "custom": db.query(FoodCustom).count(),
    }


@router.post("/foods/import")
def import_status(current_user: User = Depends(require_admin)):
    return {"message": "Use backend/app/scripts/seed.py to import the nutrition database from the PDF."}
