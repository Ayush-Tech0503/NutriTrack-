from __future__ import annotations

from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models import User
from app.services.nutrition import calculate_goals


def seed() -> None:
    settings = get_settings()
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@nutritrack.app").first():
            admin = User(
                name="Admin",
                email="admin@nutritrack.app",
                password_hash=hash_password("Admin@12345"),
                gender="other",
                age=30,
                height_cm=175,
                current_weight_kg=75,
                goal_weight_kg=72,
                activity_level="moderate",
                goal="maintain",
                is_admin=True,
            )
            for key, value in calculate_goals(admin).items():
                setattr(admin, key, value)
            db.add(admin)
            db.commit()
            print("Seeded default admin account into relational database.")

        try:
            from app.core.database import mongo_db
            mongo_users = mongo_db["users"]
            if mongo_users.count_documents({"email": "admin@nutritrack.app"}) == 0:
                mongo_users.insert_one({
                    "name": "Admin",
                    "email": "admin@nutritrack.app",
                    "password_hash": hash_password("Admin@12345"),
                    "gender": "other",
                    "age": 30,
                    "height_cm": 175,
                    "current_weight_kg": 75,
                    "goal_weight_kg": 72,
                    "activity_level": "moderate",
                    "goal": "maintain",
                    "is_admin": True,
                })
                print("MongoDB: Seeded admin user into 'users' collection.")
        except Exception as mongo_err:
            print(f"MongoDB seed notice: {mongo_err}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
