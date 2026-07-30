from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserBase(BaseModel):
    name: str
    email: EmailStr
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    current_weight_kg: float | None = None
    goal_weight_kg: float | None = None
    activity_level: str | None = None
    goal: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    gender: str | None = None
    age: int | None = None
    height_cm: float | None = None
    current_weight_kg: float | None = None
    goal_weight_kg: float | None = None
    activity_level: str | None = None
    goal: str | None = None
    daily_calories_goal: float | None = None
    daily_protein_goal: float | None = None
    daily_carb_goal: float | None = None
    daily_fat_goal: float | None = None
    daily_fibre_goal: float | None = None
    daily_water_goal: float | None = None


class UserRead(UserBase):
    id: int
    daily_calories_goal: float | None = None
    daily_protein_goal: float | None = None
    daily_carb_goal: float | None = None
    daily_fat_goal: float | None = None
    daily_fibre_goal: float | None = None
    daily_water_goal: float | None = None
    bmi: float | None = None
    bmr: float | None = None
    tdee: float | None = None
    is_admin: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class FoodRead(BaseModel):
    id: int
    category: str
    food_name: str
    portion_size: str
    calories: float | None
    protein: float | None
    carbohydrates: float | None
    is_default: bool = True

    class Config:
        from_attributes = True


class FoodCreate(BaseModel):
    category: str
    food_name: str
    portion_size: str
    calories: float
    protein: float
    carbohydrates: float


class MealItemCreate(BaseModel):
    food_id: int | None = None
    custom_food_id: int | None = None
    quantity: float = Field(default=1, gt=0)
    serving: str | None = None
    notes: str | None = None


class MealCreate(BaseModel):
    meal_type: str
    meal_name: str
    notes: str | None = None
    meal_time: datetime | None = None
    items: list[MealItemCreate] = Field(default_factory=list)


class MealItemRead(BaseModel):
    id: int
    food_name: str
    category: str
    portion_size: str
    quantity: float
    serving: str | None = None
    calories: float | None = None
    protein: float | None = None
    carbohydrates: float | None = None
    fat: float | None = None
    fibre: float | None = None
    notes: str | None = None

    class Config:
        from_attributes = True


class MealRead(BaseModel):
    id: int
    meal_type: str
    meal_name: str
    notes: str | None = None
    meal_time: datetime | None = None
    calories: float
    protein: float
    carbohydrates: float
    fat: float = 0
    fibre: float = 0
    is_favorite: bool = False
    duplicated_from_id: int | None = None
    items: list[MealItemRead] = Field(default_factory=list)

    class Config:
        from_attributes = True


class WaterCreate(BaseModel):
    amount_ml: int = Field(gt=0)


class WeightCreate(BaseModel):
    weight_kg: float = Field(gt=0)


class WaterRead(BaseModel):
    id: int
    amount_ml: int
    logged_at: datetime

    class Config:
        from_attributes = True


class WeightRead(BaseModel):
    id: int
    weight_kg: float
    logged_at: datetime

    class Config:
        from_attributes = True


class ParseDietRequest(BaseModel):
    text: str

