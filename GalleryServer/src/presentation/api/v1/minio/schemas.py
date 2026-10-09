from pydantic import BaseModel


class SMinioPresignedPutUrl(BaseModel):
    url: str
    object_name: str
    duration: int


class SGetPresignedPutUrl(BaseModel):
    service_name: str
    object_names: list[str]
