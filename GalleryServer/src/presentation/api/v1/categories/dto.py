from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class ArtworImageDTO(BaseModel):
    id: int
    artwork_id: int
    image_url: str
    sort_order: int
    created_at: datetime


class ArtworkDTO(BaseModel):
    id: int
    title_ru: str
    title_en: str | None
    slug: str
    description_ru: str | None
    description_en: str | None
    price: Decimal | None
    year_created: int | None
    width_cm: Decimal | None
    height_cm: Decimal | None
    technique: str | None
    material_ru: str | None
    material_en: str | None
    weight_kg: Decimal | None
    genre_ru: str | None
    genre_en: str | None
    is_sold: bool
    is_available: bool
    created_at: datetime
    updated_at: datetime

    artwor_images: list[ArtworImageDTO]


class CategoryDTO(BaseModel):
    id: int
    name_ru: str
    name_en: str | None
    slug: str
    description_ru: str | None
    description_en: str | None
    sort_order: int
    created_at: datetime
    img: str | None

    artworks: list[ArtworkDTO]
