from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "NutriTrack API"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/nutritrack"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "nutritrack"
    gemini_api_key: str | None = None
    antigravity_api_key: str | None = None
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    frontend_origin: str = "http://localhost:3000"
    protein_pdf_path: str = "/Users/codiotic-01/Downloads/Protein-List.pdf"
    auto_create_tables: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()

