import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_core import ValidationError
from tortoise.contrib.fastapi import RegisterTortoise

from src.config import settings
from src.infra.db.tortoise import DB_CONFIG
from src.infra.di.containers import init_container
from src.presentation.api.v1.admin.routes import router as admin_router
from src.presentation.api.v1.artworks.routes import router as artworks_router
from src.presentation.api.v1.categories.routes import router as categories_router
from src.presentation.api.v1.exhibitions.routes import router as exhibitions_router
from src.presentation.api.v1.minio.routes import router as minio_router
from src.presentation.api.v1.publications.routes import router as publications_router
from src.presentation.api.v1.videos.routes import router as videos_router

# from src.presentation.api.v1.images.routes import router as main_router


@asynccontextmanager
async def lifespan(
    app: FastAPI,
):
    async with RegisterTortoise(
        app=app,
        config=DB_CONFIG,
    ):
        yield


def create_app() -> FastAPI:
    # setup_logging()
    # setup_stdout_logging(level=logging.INFO)

    # set_oauth2_scheme_token_url(f"{settings.ROOT_PATH}/auth/login")

    app = FastAPI(
        title=settings.PROJECT_NAME,
        # version=settings.APP_VERSION,
        root_path=settings.ROOT_PATH,
        debug=settings.DEBUG,
        port=settings.APP_PORT,
        lifespan=lifespan,
        # exception_handlers={
        #     AppExceptionV2: app_exception_v2_handler,
        #     BaseExceptionV3: exception_v3_handler,
        #     DomainExceptionV2: domain_exception_v2_handler,
        #     AppException: app_exception_handler,
        #     DomainException: domain_exception_handler,
        #     ValidationError: validation_exception_handler,
        #     Exception: internal_exception_v2_handler,
        # },
        swagger_ui_parameters={
            "syntaxHighlight.theme": "obsidian",
            "defaultModelsExpandDepth": -1,
        },
    )

    ### CONTAINER ###
    di_container = init_container()
    app.state.di_container = di_container

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(artworks_router)
    app.include_router(admin_router)
    app.include_router(categories_router)
    app.include_router(exhibitions_router)
    app.include_router(minio_router)
    app.include_router(publications_router)
    app.include_router(videos_router)

    @app.get("/health", include_in_schema=False)
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()
