# schemas.py
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

# ---------- Category ----------


class CategoryBase(BaseModel):
    name_ru: str = Field(max_length=100)
    name_en: str | None = Field(default=None, max_length=100)
    slug: str = Field(max_length=120)
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name_ru: str | None = Field(default=None, max_length=100)
    name_en: str | None = Field(default=None, max_length=100)
    slug: str | None = Field(default=None, max_length=120)
    description_ru: str | None = None
    description_en: str | None = None
    sort_order: int | None = None


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


# ---------- ArtworkImage ----------


class ArtworkImageBase(BaseModel):
    image_url: str = Field(max_length=500)
    sort_order: int = 0


class ArtworkImageCreate(ArtworkImageBase):
    pass


class ArtworkImageUpdate(BaseModel):
    image_url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = None


class ArtworkImageOut(ArtworkImageBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    artwork_id: int
    created_at: datetime


# ---------- Artwork ----------


class ArtworkBase(BaseModel):
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
    category_id: int | None = None


class ArtworkCreate(ArtworkBase):
    pass


class ArtworkUpdate(BaseModel):
    title_ru: str | None = Field(default=None, max_length=255)
    title_en: str | None = Field(default=None, max_length=255)
    slug: str | None = Field(default=None, max_length=280)
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
    is_sold: bool | None = None
    is_available: bool | None = None
    category_id: int | None = None


class ArtworkOut(ArtworkBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime


class ArtworkWithImages(ArtworkOut):
    images: list[ArtworkImageOut] = []
    category: CategoryOut | None = None


class Page(BaseModel):
    total: int
    limit: int
    offset: int


class ArtworkPage(Page):
    items: list[ArtworkWithImages]


class CategoryPage(Page):
    items: list[CategoryOut]
