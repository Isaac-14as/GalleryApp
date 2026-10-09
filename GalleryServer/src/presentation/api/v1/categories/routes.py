# routers/categories.py
from fastapi import APIRouter, HTTPException, Query
from tortoise.exceptions import DoesNotExist, IntegrityError

from src.infra.db.tortoise.models import Category
from src.presentation.api.v1.categories.dto import (
    ArtworImageDTO,
    ArtworkDTO,
    CategoryDTO,
)
from src.presentation.api.v1.schemas import (
    CategoryCreate,
    CategoryOut,
    CategoryPage,
    CategoryUpdate,
)

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/get_categories")
async def get_categories():
    res = await Category.all()

    return res


@router.get("/get_category_by_id/{category_id}")
async def get_category_by_id(category_id: int):
    category = await Category.get_or_none(id=category_id).prefetch_related("artworks")
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/get_category_by_slug/{slug}")
async def get_category_by_slug(slug: str) -> CategoryDTO:
    category = await Category.get_or_none(slug=slug).prefetch_related(
        "artworks__images"
    )

    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    res = CategoryDTO(
        id=category.id,
        name_ru=category.name_ru,
        name_en=category.name_en,
        slug=category.slug,
        description_ru=category.description_ru,
        description_en=category.description_en,
        sort_order=category.sort_order,
        created_at=category.created_at,
        img=category.img,
        artworks=[
            ArtworkDTO(
                id=artwork.id,
                title_ru=artwork.title_ru,
                title_en=artwork.title_en,
                slug=artwork.slug,
                description_ru=artwork.description_ru,
                description_en=artwork.description_en,
                price=artwork.price,
                year_created=artwork.year_created,
                width_cm=artwork.width_cm,
                height_cm=artwork.height_cm,
                technique=artwork.technique,
                material_ru=artwork.material_ru,
                material_en=artwork.material_en,
                weight_kg=artwork.weight_kg,
                genre_ru=artwork.genre_ru,
                genre_en=artwork.genre_en,
                is_sold=artwork.is_sold,
                is_available=artwork.is_available,
                created_at=artwork.created_at,
                updated_at=artwork.updated_at,
                artwor_images=[
                    ArtworImageDTO(
                        id=artwor_image.id,
                        artwork_id=artwor_image.artwork_id,
                        image_url=artwor_image.image_url,
                        sort_order=artwor_image.sort_order,
                        created_at=artwor_image.created_at,
                    )
                    for artwor_image in list(artwork.images)
                ],
            )
            for artwork in list(category.artworks)
            if artwork.is_available
        ],
    )
    return res


@router.post("", response_model=CategoryOut, status_code=201)
async def create_category(payload: CategoryCreate):
    try:
        category = await Category.create(**payload.model_dump())
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="Category with this name/slug already exists"
        )
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(category_id: int, payload: CategoryUpdate):
    category = await Category.get_or_none(id=category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return category

    try:
        category.update_from_dict(data)
        await category.save()
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="Category with this name/slug already exists"
        )
    return category


@router.delete("/{category_id}", status_code=204)
async def delete_category(category_id: int):
    deleted_count = await Category.filter(id=category_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Category not found")
