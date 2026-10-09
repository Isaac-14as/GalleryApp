from fastapi import APIRouter

from src.infra.db.tortoise.models import Video
from src.presentation.api.v1.videos.dto import VideoDTO

router = APIRouter(prefix="/videos", tags=["videos"])


@router.get("", response_model=list[VideoDTO])
async def get_videos():
    return await Video.filter(is_published=True)
