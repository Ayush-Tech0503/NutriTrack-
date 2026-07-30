from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import FoodCustom, FoodDefault, Meal, MealItem, WaterLog, WeightLog, User


def calculate_bmi(height_cm: float | None, weight_kg: float | None) -> float | None:
    if not height_cm or not weight_kg or height_cm <= 0:
        return None
    height_m = height_cm / 100
    return round(weight_kg / (height_m * height_m), 2)


def calculate_bmr(gender: str | None, weight_kg: float | None, height_cm: float | None, age: int | None) -> float | None:
    if not weight_kg or not height_cm or not age:
        return None
    if gender == "female":
        value = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    else:
        value = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    return round(value, 2)


def activity_multiplier(level: str | None) -> float:
    return {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "athlete": 1.9,
    }.get(level or "", 1.2)


def calculate_goals(user: User) -> dict[str, float | None]:
    weight = user.current_weight_kg or 70.0
    height = user.height_cm or 175.0
    age = user.age or 25
    gender = (user.gender or "male").lower()
    act = (user.activity_level or "moderate").lower()
    g = (user.goal or "maintain").lower()

    bmi = calculate_bmi(height, weight)
    bmr = calculate_bmr(gender, weight, height, age)

    # Activity level multiplier
    if "sed" in act:
        mult = 1.2
    elif "light" in act:
        mult = 1.375
    elif "mod" in act:
        mult = 1.55
    elif "act" in act or "very" in act:
        mult = 1.725
    elif "ath" in act or "extra" in act:
        mult = 1.9
    else:
        mult = 1.55

    tdee = round(bmr * mult, 1) if bmr else 2200.0

    # Goal Calorie & Protein Logic:
    # Weight Loss: 400 deficit | Protein: 2.0 g/kg | Fat: 25% | Carbs: Remaining
    # Maintain: 0 deficit | Protein: 1.6 g/kg | Fat: 25% | Carbs: Remaining
    # Weight Gain: 400 surplus | Protein: 1.8 g/kg | Fat: 25% | Carbs: Remaining
    # Muscle Gain: 300 surplus | Protein: 2.0 g/kg | Fat: 25% | Carbs: Remaining
    if "lose" in g:
        calories = round(tdee - 400, 0)
        protein_rate = 2.0
    elif "gain_weight" in g or g == "gain":
        calories = round(tdee + 400, 0)
        protein_rate = 1.8
    elif "muscle" in g:
        calories = round(tdee + 300, 0)
        protein_rate = 2.0
    else:  # maintain
        calories = round(tdee, 0)
        protein_rate = 1.6

    protein = round(weight * protein_rate, 0)
    fat = round((calories * 0.25) / 9, 0)
    carbs = round((calories - (protein * 4) - (fat * 9)) / 4, 0)
    fibre = round((calories / 1000) * 14, 0)
    water = round(weight * 38, 0)  # 38 ml/kg recommendation

    return {
        "bmi": bmi,
        "bmr": bmr,
        "tdee": tdee,
        "daily_calories_goal": user.daily_calories_goal if user.daily_calories_goal is not None else calories,
        "daily_protein_goal": user.daily_protein_goal if user.daily_protein_goal is not None else protein,
        "daily_carb_goal": user.daily_carb_goal if user.daily_carb_goal is not None else carbs,
        "daily_fat_goal": user.daily_fat_goal if user.daily_fat_goal is not None else fat,
        "daily_fibre_goal": user.daily_fibre_goal if user.daily_fibre_goal is not None else fibre,
        "daily_water_goal": user.daily_water_goal if user.daily_water_goal is not None else water,
    }


def combine_foods(default_foods: list[FoodDefault], custom_foods: list[FoodCustom]) -> list[dict]:
    foods = []
    for food in default_foods:
        foods.append(
            {
                "id": food.id,
                "category": food.category,
                "food_name": food.food_name,
                "portion_size": food.portion_size,
                "calories": food.calories,
                "protein": food.protein,
                "carbohydrates": food.carbohydrates,
                "is_default": True,
            }
        )
    for food in custom_foods:
        foods.append(
            {
                "id": food.id,
                "category": food.category,
                "food_name": food.food_name,
                "portion_size": food.portion_size,
                "calories": food.calories,
                "protein": food.protein,
                "carbohydrates": food.carbohydrates,
                "is_default": False,
            }
        )
    return foods


def meal_totals(items: list[MealItem]) -> tuple[float, float, float]:
    calories = 0.0
    protein = 0.0
    carbs = 0.0
    for item in items:
        qty = float(item.quantity or 1)
        calories += float(item.calories or 0) * qty
        protein += float(item.protein or 0) * qty
        carbs += float(item.carbohydrates or 0) * qty
    return round(calories, 2), round(protein, 2), round(carbs, 2)


def date_window(days: int) -> tuple[datetime, datetime]:
    end = datetime.now(timezone.utc)
    start = end - timedelta(days=days)
    return start, end


def dashboard_summary(db: Session, user_id: int) -> dict:
    today = datetime.now(timezone.utc).date()
    start = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    end = start + timedelta(days=1)
    meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.created_at >= start, Meal.created_at < end).all()
    water = db.query(func.coalesce(func.sum(WaterLog.amount_ml), 0)).filter(
        WaterLog.user_id == user_id,
        WaterLog.logged_at >= start,
        WaterLog.logged_at < end,
    ).scalar()
    weight = db.query(WeightLog).filter(WeightLog.user_id == user_id).order_by(WeightLog.logged_at.desc()).first()
    calories = sum(m.calories for m in meals)
    protein = sum(m.protein for m in meals)
    carbs = sum(m.carbohydrates for m in meals)
    fat = sum(getattr(m, "fat", 0) or 0 for m in meals)
    fibre = sum(getattr(m, "fibre", 0) or 0 for m in meals)
    user = db.get(User, user_id)

    goals = calculate_goals(user) if user else {}
    cal_goal = user.daily_calories_goal if (user and user.daily_calories_goal is not None) else goals.get("daily_calories_goal", 2400)
    pro_goal = user.daily_protein_goal if (user and user.daily_protein_goal is not None) else goals.get("daily_protein_goal", 150)
    carb_goal = user.daily_carb_goal if (user and user.daily_carb_goal is not None) else goals.get("daily_carb_goal", 300)
    fat_goal = user.daily_fat_goal if (user and user.daily_fat_goal is not None) else goals.get("daily_fat_goal", 75)
    fibre_goal = user.daily_fibre_goal if (user and user.daily_fibre_goal is not None) else goals.get("daily_fibre_goal", 30)
    water_goal = user.daily_water_goal if (user and user.daily_water_goal is not None) else goals.get("daily_water_goal", 3500)

    calories_remaining = round(cal_goal - calories, 0) if cal_goal is not None else None

    return {
        "todayCalories": round(calories, 1),
        "todayProtein": round(protein, 1),
        "todayCarbs": round(carbs, 1),
        "todayFat": round(fat, 1),
        "todayFibre": round(fibre, 1),
        "dailyCaloriesGoal": round(cal_goal, 0) if cal_goal else 2400,
        "dailyProteinGoal": round(pro_goal, 0) if pro_goal else 150,
        "dailyCarbGoal": round(carb_goal, 0) if carb_goal else 300,
        "dailyFatGoal": round(fat_goal, 0) if fat_goal else 75,
        "dailyFibreGoal": round(fibre_goal, 0) if fibre_goal else 30,
        "dailyWaterGoal": round(water_goal, 0) if water_goal else 3500,
        "caloriesRemaining": calories_remaining,
        "waterIntake": int(water or 0),
        "weight": weight.weight_kg if weight else (user.current_weight_kg if user else None),
        "recentMeals": [
            {
                "id": meal.id,
                "meal_name": meal.meal_name,
                "meal_type": meal.meal_type,
                "calories": meal.calories,
                "protein": meal.protein,
                "carbohydrates": meal.carbohydrates,
            }
            for meal in meals[:5]
        ],
    }


def analytics_snapshot(db: Session, user_id: int, days: int = 30) -> dict:
    start, end = date_window(days)
    meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.created_at >= start, Meal.created_at <= end).all()
    water = db.query(WaterLog).filter(WaterLog.user_id == user_id, WaterLog.logged_at >= start, WaterLog.logged_at <= end).all()
    weights = db.query(WeightLog).filter(WeightLog.user_id == user_id, WeightLog.logged_at >= start, WeightLog.logged_at <= end).all()
    totals_by_day: dict[str, dict[str, float]] = defaultdict(lambda: {"calories": 0, "protein": 0, "carbs": 0, "water": 0, "weight": 0})
    for meal in meals:
        day = meal.created_at.date().isoformat()
        totals_by_day[day]["calories"] += meal.calories
        totals_by_day[day]["protein"] += meal.protein
        totals_by_day[day]["carbs"] += meal.carbohydrates
    for entry in water:
        day = entry.logged_at.date().isoformat()
        totals_by_day[day]["water"] += entry.amount_ml
    for entry in weights:
        day = entry.logged_at.date().isoformat()
        totals_by_day[day]["weight"] = entry.weight_kg
    food_counter = Counter()
    for meal in meals:
        for item in meal.items:
            food_counter[item.food_name] += 1
    series = [{"date": day, **values} for day, values in sorted(totals_by_day.items())]
    return {
        "series": series,
        "topFoods": [{"name": name, "count": count} for name, count in food_counter.most_common(10)],
        "averages": {
            "calories": round(sum(v["calories"] for v in totals_by_day.values()) / max(len(totals_by_day), 1), 2),
            "protein": round(sum(v["protein"] for v in totals_by_day.values()) / max(len(totals_by_day), 1), 2),
            "carbs": round(sum(v["carbs"] for v in totals_by_day.values()) / max(len(totals_by_day), 1), 2),
        },
    }
