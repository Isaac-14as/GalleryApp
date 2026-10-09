from functools import cached_property
from pathlib import Path

# from loguru import logger
from pydantic_settings import BaseSettings, SettingsConfigDict

# from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "gallery_api"

    BASE_DIR: Path = Path(__file__).parent.parent
    DEBUG: bool = False

    HOST: str = "127.0.0.1"

    APP_PORT: int = 8000
    ROOT_PATH: str = "/api"
    CORS_ORIGINS: str = "http://localhost"

    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "change-me"

    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "postgres"
    POSTGRES_PORT: str = "5432"

    @cached_property
    def pg_creds(self):
        return {
            "host": self.HOST,
            "port": int(self.POSTGRES_PORT),
            "database": self.POSTGRES_DB,
            "user": self.POSTGRES_USER,
            "password": self.POSTGRES_PASSWORD,
            "statement_cache_size": 0,
        }

    MINIO_HOST: str
    MINIO_PORT: int
    MINIO_SECURE: bool = False
    MINIO_INTERNAL_HOST: str = "minio"
    MINIO_INTERNAL_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "test"
    MINIO_SECRET_KEY: str = "test"
    MINIO_DEFAULT_BUCKET: str = "default"
    MINIO_GET_EXPIRE_MINUTES: int = 10
    MINIO_PUT_EXPIRE_MINUTES: int = 2

    @cached_property
    def minio_url(self):
        return f"{self.MINIO_HOST}:{self.MINIO_PORT}"

    @cached_property
    def minio_internal_url(self):
        return f"{self.MINIO_INTERNAL_HOST}:{self.MINIO_INTERNAL_PORT}"

    @cached_property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()  # noqa
