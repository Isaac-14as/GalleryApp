import sys
from typing import Any

from dependency_injector import containers, providers

from src.config import settings
from src.infra.clients.minio_client.minio_client import MinioClient


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=[
            "...app",
            "...presentation.api",
        ],
    )

    minio_client: providers.Singleton[MinioClient] = providers.Singleton(
        MinioClient,
        endpoint=settings.minio_internal_url,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
        region="us-east-1",
    )

    public_minio_client: providers.Singleton[MinioClient] = providers.Singleton(
        MinioClient,
        endpoint=settings.minio_url,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=settings.MINIO_SECURE,
        region="us-east-1",
    )


def init_container() -> Container:
    return Container()
