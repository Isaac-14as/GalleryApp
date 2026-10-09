from fastapi import APIRouter

from src.infra.db.tortoise.models import Publication
from src.presentation.api.v1.publications.dto import PublicationDTO

router = APIRouter(prefix="/publications", tags=["publications"])


@router.get("", response_model=list[PublicationDTO])
async def get_publications():
    return await Publication.filter(is_published=True)
