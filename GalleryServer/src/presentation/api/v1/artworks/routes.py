# routers/artworks.py
from fastapi import APIRouter, HTTPException, Query
from tortoise.exceptions import IntegrityError
from tortoise.expressions import Q

from src.infra.db.tortoise.models import Artwork, Category
from src.presentation.api.v1.schemas import (
    ArtworkCreate,
    ArtworkPage,
    ArtworkUpdate,
    ArtworkWithImages,
)

router = APIRouter(prefix="/artworks", tags=["artworks"])


@router.get("", response_model=ArtworkPage)
async def list_artworks(
    category_id: int | None = None,
    category_slug: str | None = None,
    is_available: bool | None = None,
    is_sold: bool | None = None,
    search: str | None = Query(None, description="Поиск по названию и описанию на русском и английском"),
    min_price: float | None = None,
    max_price: float | None = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    qs = Artwork.all()

    if category_id is not None:
        qs = qs.filter(category_id=category_id)
    if category_slug is not None:
        qs = qs.filter(category__slug=category_slug)
    if is_available is not None:
        qs = qs.filter(is_available=is_available)
    if is_sold is not None:
        qs = qs.filter(is_sold=is_sold)
    if min_price is not None:
        qs = qs.filter(price__gte=min_price)
    if max_price is not None:
        qs = qs.filter(price__lte=max_price)
    if search:
        qs = qs.filter(
            Q(title_ru__icontains=search)
            | Q(title_en__icontains=search)
            | Q(description_ru__icontains=search)
            | Q(description_en__icontains=search)
        )

    total = await qs.count()
    items = (
        await qs.prefetch_related("images", "category")
        .order_by("-created_at")
        .offset(offset)
        .limit(limit)
    )
    return ArtworkPage(total=total, limit=limit, offset=offset, items=items)


@router.get("/{artwork_id}", response_model=ArtworkWithImages)
async def get_artwork(artwork_id: int):
    artwork = await Artwork.get_or_none(id=artwork_id).prefetch_related(
        "images", "category"
    )
    if artwork is None:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork


@router.get("/by-slug/{slug}", response_model=ArtworkWithImages)
async def get_artwork_by_slug(slug: str):
    artwork = await Artwork.get_or_none(slug=slug).prefetch_related(
        "images", "category"
    )
    if artwork is None:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork


@router.post("", response_model=ArtworkWithImages, status_code=201)
async def create_artwork(payload: ArtworkCreate):
    data = payload.model_dump()

    if data.get("category_id") is not None:
        exists = await Category.exists(id=data["category_id"])
        if not exists:
            raise HTTPException(status_code=400, detail="Category does not exist")

    try:
        artwork = await Artwork.create(**data)
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="Artwork with this slug already exists"
        )

    await artwork.fetch_related("images", "category")
    return artwork


@router.patch("/{artwork_id}", response_model=ArtworkWithImages)
async def update_artwork(artwork_id: int, payload: ArtworkUpdate):
    artwork = await Artwork.get_or_none(id=artwork_id)
    if artwork is None:
        raise HTTPException(status_code=404, detail="Artwork not found")

    data = payload.model_dump(exclude_unset=True)

    if "category_id" in data and data["category_id"] is not None:
        exists = await Category.exists(id=data["category_id"])
        if not exists:
            raise HTTPException(status_code=400, detail="Category does not exist")

    if data:
        try:
            artwork.update_from_dict(data)
            await artwork.save()
        except IntegrityError:
            raise HTTPException(
                status_code=409, detail="Artwork with this slug already exists"
            )

    await artwork.fetch_related("images", "category")
    return artwork


@router.delete("/{artwork_id}", status_code=204)
async def delete_artwork(artwork_id: int):
    deleted_count = await Artwork.filter(id=artwork_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Artwork not found")
