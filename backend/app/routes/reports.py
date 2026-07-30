from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import Meal, User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/reports")
def reports(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meals = db.query(Meal).options(joinedload(Meal.items)).filter(Meal.user_id == current_user.id).all()
    return {
        "meals": len(meals),
        "favoriteMeals": len([m for m in meals if m.is_favorite]),
        "totalCalories": round(sum(m.calories for m in meals), 2),
    }


@router.get("/reports.csv", response_class=PlainTextResponse)
def reports_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Meal", "Calories", "Protein", "Carbs"])
    for meal in db.query(Meal).filter(Meal.user_id == current_user.id).all():
        writer.writerow([meal.meal_name, meal.calories, meal.protein, meal.carbohydrates])
    return output.getvalue()

