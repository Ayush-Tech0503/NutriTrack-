import pymongo
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


settings = get_settings()
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=not settings.database_url.startswith("sqlite")
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# MongoDB Client Setup
mongo_client = pymongo.MongoClient(settings.mongodb_url, serverSelectionTimeoutMS=2000)
mongo_db = mongo_client[settings.mongodb_db_name]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_mongo_db():
    return mongo_db



