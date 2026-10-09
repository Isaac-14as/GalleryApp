from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class CategoryAdminCreate(BaseModel):
    name_ru: str = Field(max_length=100)
    name_en: str | None = Field(default=None, max_length=100)
    slug: str = Field(max_length=120)
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int = 0
    img: str | None = Field(default=None, max_length=500)


class ArtworkAdminCreate(BaseModel):
    category_id: int | None = None
    title_ru: str = Field(max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    slug: str = Field(max_length=280)
    description_ru: str | None = None
    description_en: str | None = None
    price: Decimal | None = None
    year_created: int | None = None
    width_cm: Decimal | None = None
    height_cm: Decimal | None = None
    technique: str | None = Field(default=None, max_length=255)
    material_ru: str | None = Field(default=None, max_length=255)
    material_en: str | None = Field(default=None, max_length=255)
    weight_kg: Decimal | None = Field(default=None, gt=0)
    genre_ru: str | None = Field(default=None, max_length=120)
    genre_en: str | None = Field(default=None, max_length=120)
    is_sold: bool = False
    is_available: bool = True


class ArtworkImageAdminSave(BaseModel):
    id: int | None = None
    image_url: str = Field(max_length=500)
    sort_order: int = 0


class ArtworkAdminSave(ArtworkAdminCreate):
    images: list[ArtworkImageAdminSave] = Field(default_factory=list)


class ExhibitionAdminCreate(BaseModel):
    title_ru: str = Field(max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    description_ru: str | None = None
    description_en: str | None = None
    location_ru: str | None = Field(default=None, max_length=255)
    location_en: str | None = Field(default=None, max_length=255)
    start_year: int | None = None
    end_year: int | None = None
    cover_image: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_years(self):
        if self.start_year and self.end_year and self.end_year < self.start_year:
            raise ValueError("end_year must be greater than or equal to start_year")
        return self


class PublicationAdminCreate(BaseModel):
    title_ru: str = Field(max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    description_ru: str | None = None
    description_en: str | None = None
    cover_image: str | None = Field(default=None, max_length=500)
    published_at: datetime | None = None
    is_published: bool = True


class VideoAdminCreate(BaseModel):
    title_ru: str = Field(min_length=1, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    description_ru: str | None = None
    description_en: str | None = None
    video_url: str = Field(min_length=1, max_length=500)
    cover_image: str | None = Field(default=None, max_length=500)
    sort_order: int = 0
    published_at: datetime | None = None
    is_published: bool = True
