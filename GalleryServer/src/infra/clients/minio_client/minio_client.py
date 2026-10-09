from datetime import timedelta

from minio import Minio, S3Error
from pydantic import BaseModel

from src.config import settings


class SMinioPresignedPutUrl(BaseModel):
    url: str
    object_name: str
    duration: int


class MinioClient(Minio):
    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        secure: bool = True,
        region: str | None = None,
    ):
        super().__init__(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
            region=region,
        )

    def upload_file_url(
        self, service_name: str, object_names: list[str]
    ) -> list[SMinioPresignedPutUrl]:
        result = list()

        for object_name in object_names:
            path = f"{object_name}"
            url = self.presigned_put_object(
                service_name,
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

    def get_file_url(
        self,
        object_name: str,
        service_name: str,
    ):
        try:
            self.stat_object(service_name, object_name)
            url = self.presigned_get_object(
                service_name,
                object_name,
                expires=timedelta(minutes=settings.MINIO_GET_EXPIRE_MINUTES),
            )
            return {"url": url, "object_name": object_name}
        except S3Error as e:
            raise e

    def get_files_urls(
        self,
        service_name: str,
        object_names: list[str],
    ):
        urls = list()
        for object_name in object_names:
            try:
                path = f"{object_name}"
                self.stat_object(service_name, path)
                url = self.presigned_get_object(
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
