"""Application configuration — loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Portolan Intelligence Platform"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION-portolan-2026"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://portolan:portolan@localhost:5432/portolan"
    DATABASE_SYNC_URL: str = "postgresql://portolan:portolan@localhost:5432/portolan"

    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480  # 8 hours

    # OSINT
    OSINT_TIMEOUT: int = 120  # seconds per tool
    OSINT_MAX_CONCURRENT: int = 5
    PROXY_URL: str | None = None  # e.g. socks5://user:pass@proxy:1080

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
