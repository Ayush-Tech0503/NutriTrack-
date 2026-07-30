from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import FoodCustom, FoodDefault
from app.routes.auth import get_current_user
from app.schemas import FoodCreate, FoodRead
from app.models import User

router = APIRouter(prefix="/api/foods", tags=["foods"])


@router.get("", response_model=list[FoodRead])
def list_foods(
    q: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    default_query = db.query(FoodDefault)
    custom_query = db.query(FoodCustom).filter(FoodCustom.user_id == current_user.id)
    if q:
        pattern = f"%{q}%"
        default_query = default_query.filter(FoodDefault.food_name.ilike(pattern))
        custom_query = custom_query.filter(FoodCustom.food_name.ilike(pattern))
    if category:
        default_query = default_query.filter(FoodDefault.category == category)
        custom_query = custom_query.filter(FoodCustom.category == category)
    foods = []
    for food in default_query.order_by(FoodDefault.category, FoodDefault.food_name).all():
        foods.append(
            FoodRead(
                id=food.id,
                category=food.category,
                food_name=food.food_name,
                portion_size=food.portion_size,
                calories=food.calories,
                protein=food.protein,
                carbohydrates=food.carbohydrates,
                is_default=True,
            )
        )
    for food in custom_query.order_by(FoodCustom.category, FoodCustom.food_name).all():
        foods.append(
            FoodRead(
                id=food.id,
                category=food.category,
                food_name=food.food_name,
                portion_size=food.portion_size,
                calories=food.calories,
                protein=food.protein,
                carbohydrates=food.carbohydrates,
                is_default=False,
            )
        )
    return foods


@router.post("/custom", response_model=FoodRead)
def create_custom_food(
    payload: FoodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    food = FoodCustom(user_id=current_user.id, **payload.model_dump())
    db.add(food)
    db.commit()
    db.refresh(food)
    return FoodRead(
        id=food.id,
        category=food.category,
        food_name=food.food_name,
        portion_size=food.portion_size,
        calories=food.calories,
        protein=food.protein,
        carbohydrates=food.carbohydrates,
        is_default=False,
    )

