from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, WaterLog, WeightLog
from app.routes.auth import get_current_user
from app.schemas import WaterCreate, WeightCreate, WaterRead, WeightRead

router = APIRouter(prefix="/api", tags=["tracker"])


@router.post("/water")
def log_water(payload: WaterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = WaterLog(user_id=current_user.id, amount_ml=payload.amount_ml)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "amount_ml": entry.amount_ml}


@router.get("/water", response_model=list[WaterRead])
def list_water(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(WaterLog).filter(WaterLog.user_id == current_user.id).order_by(WaterLog.logged_at.desc()).all()


@router.post("/weight")
def log_weight(payload: WeightCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = WeightLog(user_id=current_user.id, weight_kg=payload.weight_kg)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "weight_kg": entry.weight_kg}


@router.get("/weight", response_model=list[WeightRead])
def list_weight(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(WeightLog).filter(WeightLog.user_id == current_user.id).order_by(WeightLog.logged_at.desc()).all()
