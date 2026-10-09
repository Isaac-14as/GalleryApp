from datetime import timedelta

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, HTTPException
from fastapi.params import Query
from minio import Minio, S3Error

from src.config import settings
from src.infra.clients.minio_client.minio_client import (
    MinioClient,
    SMinioPresignedPutUrl,
)
from src.infra.di.containers import Container
from src.presentation.api.v1.minio.schemas import SGetPresignedPutUrl
from src.presentation.api.v1.admin.auth import verify_admin

router = APIRouter(tags=["S3"], prefix="/minio")


@router.post("")
@inject
def upload_file_url(
    schema: SGetPresignedPutUrl,
    _admin: str = Depends(verify_admin),
    minio_client: Minio = Depends(Provide[Container.minio_client]),
    public_minio_client: Minio = Depends(Provide[Container.public_minio_client]),
    # payload: PayloadSchema = Depends(get_token_payload),
) -> list[SMinioPresignedPutUrl]:
    result = list()

    bucket_name = schema.service_name

    if not minio_client.bucket_exists(bucket_name):
        minio_client.make_bucket(bucket_name)

    for object_name in schema.object_names:
        path = f"{object_name}"
        url = public_minio_client.presigned_put_object(
            bucket_name,
            path,
            expires=timedelta(minutes=settings.MINIO_PUT_EXPIRE_MINUTES),
        )

        data = SMinioPresignedPutUrl(
            url=url,
            object_name=object_name,
            duration=settings.MINIO_PUT_EXPIRE_MINUTES,
        )
        result.append(data)

    return result


@router.get("/{object_name:path}")
@inject
def get_file_url(
    object_name: str,
    service_name: str = Query(...),
    minio_client: Minio = Depends(Provide[Container.minio_client]),
    public_minio_client: Minio = Depends(Provide[Container.public_minio_client]),
    # payload: PayloadSchema = Depends(get_token_payload),
):
    try:
        minio_client.stat_object(service_name, object_name)
        url = public_minio_client.presigned_get_object(
            service_name,
            object_name,
            expires=timedelta(minutes=settings.MINIO_GET_EXPIRE_MINUTES),
        )
        return {"url": url, "object_name": object_name}
    except S3Error as e:
        if e.code == "NoSuchKey":
            raise HTTPException(status_code=404, detail="Файл не найден")
        raise HTTPException(status_code=500, detail=f"MinIO error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{object_name:path}", status_code=204)
@inject
def delete_file(
    object_name: str,
    service_name: str = Query(...),
    _admin: str = Depends(verify_admin),
    minio_client: Minio = Depends(Provide[Container.minio_client]),
):
    try:
        minio_client.remove_object(service_name, object_name)
    except S3Error as error:
        raise HTTPException(status_code=500, detail=f"MinIO error: {error}") from error


@router.get("")
@inject
def get_files_urls(
    service_name: str = Query(...),
    object_names: list[str] = Query(...),
    minio_client: MinioClient = Depends(Provide[Container.minio_client]),
    public_minio_client: MinioClient = Depends(
        Provide[Container.public_minio_client]
    ),
    # payload: PayloadSchema = Depends(get_token_payload),
):
    urls = list()
    for object_name in object_names:
        try:
            path = f"{object_name}"
            minio_client.stat_object(service_name, object_name=path)
            url = public_minio_client.presigned_get_object(
                service_name,
                path,
                expires=timedelta(minutes=settings.MINIO_GET_EXPIRE_MINUTES),
            )
            data = {"url": url, "object_name": object_name}
            urls.append(data)
        except S3Error as e:
            if e.code == "NoSuchKey":
                urls.append({"url": None, "object_name": object_name})

    return urls
