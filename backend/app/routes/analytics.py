from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User
from app.routes.auth import get_current_user
from app.services.nutrition import analytics_snapshot

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics")
def analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analytics_snapshot(db, current_user.id)

