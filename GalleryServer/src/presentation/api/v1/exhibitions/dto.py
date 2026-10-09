from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ExhibitionDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title_ru: str
    title_en: str | None
    description_ru: str | None
    description_en: str | None
    location_ru: str | None
    location_en: str | None
    start_year: int | None
    end_year: int | None
    cover_image: str | None
    created_at: datetime
