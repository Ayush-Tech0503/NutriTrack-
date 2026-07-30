from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models import FoodCustom, FoodDefault, Meal, MealItem, User
from app.routes.auth import get_current_user
from app.schemas import MealCreate, MealRead, ParseDietRequest
from app.services.diet_parser import analyze_meal_with_gemini
from app.services.nutrition import meal_totals

router = APIRouter(prefix="/api/meals", tags=["meals"])



@router.post("/parse-diet")
def parse_diet(
    payload: ParseDietRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analysis = analyze_meal_with_gemini(payload.text)
    if not analysis.get("success"):
        return {
            "success": False,
            "error": analysis.get("error", "We couldn't analyze this meal. Please provide a little more detail.")
        }
    
    total = analysis.get("total", {})
    foods = analysis.get("foods", [])

    meal = Meal(
        user_id=current_user.id,
        meal_type="lunch",
        meal_name=payload.text[:60].strip() or "Analyzed Meal",
        notes=payload.text,
        meal_time=datetime.utcnow(),
        calories=float(total.get("calories", 0)),
        protein=float(total.get("protein", 0)),
        carbohydrates=float(total.get("carbohydrates", 0)),
        fat=float(total.get("fat", 0)),
        fibre=float(total.get("fibre", 0)),
    )
    db.add(meal)
    db.flush()

    for item in foods:
        db.add(
            MealItem(
                meal_id=meal.id,
                food_name=str(item.get("name", "Food Item")),
                category="Gemini AI",
                portion_size=str(item.get("quantity", "1 serving")),
                quantity=1.0,
                serving=str(item.get("quantity", "1 serving")),
                calories=float(item.get("calories", 0)),
                protein=float(item.get("protein", 0)),
                carbohydrates=float(item.get("carbohydrates", 0)),
                fat=float(item.get("fat", 0)),
                fibre=float(item.get("fibre", 0)),
            )
        )
    db.commit()

    try:
        from app.core.database import mongo_db
        mongo_db["meals"].insert_one({
            "meal_id": meal.id,
            "user_id": current_user.id,
            "meal_name": meal.meal_name,
            "meal_text": payload.text,
            "foods": foods,
            "total": total,
            "created_at": datetime.utcnow()
        })
    except Exception as mongo_err:
        print(f"MongoDB log notice: {mongo_err}")

    return {
        "success": True,
        "foods": foods,
        "total": total,
        "meal_id": meal.id
    }




def _resolve_food(db: Session, user_id: int, food_id: int | None, custom_food_id: int | None):
    if food_id:
        food = db.get(FoodDefault, food_id)
        if not food:
            raise HTTPException(status_code=404, detail="Food not found")
        return food, True
    if custom_food_id:
        food = db.query(FoodCustom).filter(FoodCustom.id == custom_food_id, FoodCustom.user_id == user_id).first()
        if not food:
            raise HTTPException(status_code=404, detail="Custom food not found")
        return food, False
    raise HTTPException(status_code=400, detail="Food reference required")


@router.get("", response_model=list[MealRead])
def list_meals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meals = (
        db.query(Meal)
        .options(joinedload(Meal.items))
        .filter(Meal.user_id == current_user.id)
        .order_by(Meal.created_at.desc())
        .all()
    )
    return meals


@router.post("", response_model=MealRead)
def create_meal(payload: MealCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meal = Meal(
        user_id=current_user.id,
        meal_type=payload.meal_type,
        meal_name=payload.meal_name,
        notes=payload.notes,
        meal_time=payload.meal_time or datetime.utcnow(),
    )
    db.add(meal)
    db.flush()
    items: list[MealItem] = []
    for item in payload.items:
        food, is_default = _resolve_food(db, current_user.id, item.food_id, item.custom_food_id)
        food_name = food.food_name
        calories = food.calories
        protein = food.protein
        carbs = food.carbohydrates
        meal_item = MealItem(
            meal_id=meal.id,
            food_name=food_name,
            category=food.category,
            portion_size=food.portion_size,
            quantity=item.quantity,
            serving=item.serving or food.portion_size,
            calories=calories,
            protein=protein,
            carbohydrates=carbs,
            notes=item.notes,
        )
        db.add(meal_item)
        items.append(meal_item)
    db.flush()
    meal.calories, meal.protein, meal.carbohydrates = meal_totals(items)
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return db.query(Meal).options(joinedload(Meal.items)).filter(Meal.id == meal.id).one()


@router.put("/{meal_id}", response_model=MealRead)
def update_meal(meal_id: int, payload: MealCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meal = db.query(Meal).options(joinedload(Meal.items)).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    meal.meal_type = payload.meal_type
    meal.meal_name = payload.meal_name
    meal.notes = payload.notes
    meal.meal_time = payload.meal_time or meal.meal_time
    meal.items.clear()
    db.flush()
    items = []
    for item in payload.items:
        food, _ = _resolve_food(db, current_user.id, item.food_id, item.custom_food_id)
        meal_item = MealItem(
            meal_id=meal.id,
            food_name=food.food_name,
            category=food.category,
            portion_size=food.portion_size,
            quantity=item.quantity,
            serving=item.serving or food.portion_size,
            calories=food.calories,
            protein=food.protein,
            carbohydrates=food.carbohydrates,
            notes=item.notes,
        )
        db.add(meal_item)
        items.append(meal_item)
    meal.calories, meal.protein, meal.carbohydrates = meal_totals(items)
    db.commit()
    db.refresh(meal)
    return meal


@router.delete("/{meal_id}")
def delete_meal(meal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"ok": True}


@router.post("/{meal_id}/duplicate", response_model=MealRead)
def duplicate_meal(meal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    original = db.query(Meal).options(joinedload(Meal.items)).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Meal not found")
    duplicate = Meal(
        user_id=current_user.id,
        meal_type=original.meal_type,
        meal_name=f"{original.meal_name} Copy",
        notes=original.notes,
        meal_time=datetime.utcnow(),
        calories=original.calories,
        protein=original.protein,
        carbohydrates=original.carbohydrates,
        duplicated_from_id=original.id,
    )
    db.add(duplicate)
    db.flush()
    for item in original.items:
        db.add(
            MealItem(
                meal_id=duplicate.id,
                food_name=item.food_name,
                category=item.category,
                portion_size=item.portion_size,
                quantity=item.quantity,
                serving=item.serving,
                calories=item.calories,
                protein=item.protein,
                carbohydrates=item.carbohydrates,
                notes=item.notes,
            )
        )
    db.commit()
    db.refresh(duplicate)
    return db.query(Meal).options(joinedload(Meal.items)).filter(Meal.id == duplicate.id).one()


@router.post("/{meal_id}/favorite")
def favorite_meal(meal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    meal.is_favorite = not meal.is_favorite
    db.commit()
    return {"is_favorite": meal.is_favorite}

