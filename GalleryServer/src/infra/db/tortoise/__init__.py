from tortoise import BaseDBAsyncClient, Tortoise
from tortoise.contrib.fastapi import register_tortoise

from src.config import Settings, settings
from src.infra.db.tortoise import models

DB_CONFIG = {
    "connections": {
        "default": {
            "engine": "tortoise.backends.asyncpg",
            "credentials": settings.pg_creds,
        },
    },
    "apps": {
        "models": {
            "models": ["src.infra.db.tortoise.models"],
            "default_connection": "default",
        },
    },
    "use_tz": False,
    "timezone": "Europe/Moscow",
}


def setup_tortoise_orm(app, settings: Settings) -> None:
    register_tortoise(app, DB_CONFIG)


def get_connection(name: str = "default") -> BaseDBAsyncClient:
    connection = Tortoise.get_connection(name)
    return connection


def get_default_connection_name() -> str:
    return "default"
