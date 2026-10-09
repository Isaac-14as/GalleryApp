from datetime import datetime

from pydantic import BaseModel, ConfigDict


class VideoDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title_ru: str
    title_en: str | None
    description_ru: str | None
    description_en: str | None
    video_url: str
    cover_image: str | None
    sort_order: int
    published_at: datetime | None
    is_published: bool
    created_at: datetime
    updated_at: datetime
