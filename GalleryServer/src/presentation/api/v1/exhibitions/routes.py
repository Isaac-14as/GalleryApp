from fastapi import APIRouter, HTTPException

from src.infra.db.tortoise.models import Exhibition
from src.presentation.api.v1.exhibitions.dto import ExhibitionDTO

router = APIRouter(prefix="/exhibitions", tags=["exhibitions"])


@router.get("", response_model=list[ExhibitionDTO])
async def get_exhibitions():
    return await Exhibition.all()


@router.get("/{slug}", response_model=ExhibitionDTO)
async def get_exhibition_by_slug(slug: str):
    exhibition = await Exhibition.get_or_none(slug=slug)
    if exhibition is None:
        raise HTTPException(status_code=404, detail="Exhibition not found")

    return exhibition
