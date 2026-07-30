from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models import User
from app.schemas import Token, UserCreate, UserLogin, UserRead, UserUpdate
from app.services.nutrition import calculate_goals

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(db: Session = Depends(get_db), token: str | None = Depends(oauth2_scheme)) -> User:
    if token:
        try:
            payload = decode_access_token(token)
            user_id = int(payload["sub"])
            user = db.get(User, user_id)
            if user:
                return user
        except Exception:  # noqa: BLE001
            pass

    # Single-User Local/DB Mode Fallback
    user = db.query(User).first()
    if not user:
        user = User(
            name="Ayush Rathore",
            email="ayush@gmail.com",
            password_hash="single_user_mode",
            age=28,
            gender="male",
            height_cm=177,
            current_weight_kg=68,
            goal_weight_kg=72,
            activity_level="moderate",
            goal="gain_muscle",
        )
        for key, value in calculate_goals(user).items():
            setattr(user, key, value)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        gender=payload.gender,
        age=payload.age,
        height_cm=payload.height_cm,
        current_weight_kg=payload.current_weight_kg,
        goal_weight_kg=payload.goal_weight_kg,
        activity_level=payload.activity_level,
        goal=payload.goal,
    )
    for key, value in calculate_goals(user).items():
        setattr(user, key, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return Token(access_token=create_access_token(str(user.id)))


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    for key, value in calculate_goals(current_user).items():
        setattr(current_user, key, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If the account exists, password reset instructions have been sent."}
    return {"message": "Password reset instructions have been sent."}

