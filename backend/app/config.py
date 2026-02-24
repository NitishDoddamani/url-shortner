from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/urlshortener"
    REDIS_URL: str = "redis://redis:6379"
    BASE_URL: str = "http://localhost:8000"
    REDIS_CACHE_TTL: int = 3600       # 1 hour cache
    DEFAULT_EXPIRY_DAYS: int = 30
    RATE_LIMIT: str = "100/minute"

    class Config:
        env_file = ".env"

settings = Settings()