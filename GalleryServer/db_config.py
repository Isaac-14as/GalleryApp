from src.config import Settings
from tortoise import Tortoise


async def setup_tortoise(
    settings: Settings,
):
    """
    Инициализация Tortoise ORM без привязки к FastAPI.
    """

    config = {
        "connections": {
            "default": {
                "engine": "tortoise.backends.asyncpg",
                "credentials": settings.pg_creds,
                "echo": True,
            }
        },
        "apps": {
            "models": {
                "models": [
                    "EncostCore.models_tortoise",
                    "src.presentation.api.custom.lactalis_453.models",
                ],
                "default_connection": "default",
            }
        },
        "use_tz": False,
        "timezone": "Europe/Moscow",
    }

    await Tortoise.init(config=config)
