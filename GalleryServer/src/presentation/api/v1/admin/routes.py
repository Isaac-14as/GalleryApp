from typing import TypeVar

from fastapi import APIRouter, Depends, HTTPException, status
from tortoise.exceptions import IntegrityError
from tortoise.models import Model
from tortoise.transactions import in_transaction

from src.infra.db.tortoise.models import (
    Artwork,
    ArtworkImage,
    Category,
    Exhibition,
    Publication,
    Video,
)
from src.presentation.api.v1.admin.auth import verify_admin
from src.presentation.api.v1.admin.schemas import (
    ArtworkAdminSave,
    CategoryAdminCreate,
    ExhibitionAdminCreate,
    PublicationAdminCreate,
    VideoAdminCreate,
)

router = APIRouter(
    prefix="/admin/api",
    tags=["admin"],
    dependencies=[Depends(verify_admin)],
)

ModelType = TypeVar("ModelType", bound=Model)


def serialize_instance(instance: Model) -> dict:
    return {
        field_name: getattr(instance, field_name)
        for field_name in instance._meta.db_fields
    }


async def get_object_or_404(model: type[ModelType], object_id: int) -> ModelType:
    instance = await model.get_or_none(id=object_id)
    if instance is None:
        raise HTTPException(status_code=404, detail="Запись не найдена")
    return instance


async def create_object(model: type[ModelType], data: dict):
    try:
        instance = await model.create(**data)
    except IntegrityError as error:
        raise HTTPException(
            status_code=409,
            detail="Запись с таким названием или slug уже существует",
        ) from error
    return serialize_instance(instance)


async def update_object(instance: ModelType, data: dict):
    try:
        instance.update_from_dict(data)
        await instance.save()
    except IntegrityError as error:
        raise HTTPException(
            status_code=409,
            detail="Запись с таким названием или slug уже существует",
        ) from error
    return serialize_instance(instance)


@router.get("/check")
async def check_admin_access():
    return {"authenticated": True}


@router.get("/categories")
async def get_categories():
    return await Category.all().values()


@router.get("/categories/{category_id}")
async def get_category(category_id: int):
    category = await get_object_or_404(Category, category_id)
    return serialize_instance(category)


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(payload: CategoryAdminCreate):
    return await create_object(Category, payload.model_dump())


@router.put("/categories/{category_id}")
async def replace_category(category_id: int, payload: CategoryAdminCreate):
    category = await get_object_or_404(Category, category_id)
    return await update_object(category, payload.model_dump())


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int):
    category = await get_object_or_404(Category, category_id)
    await category.delete()


@router.get("/artworks")
async def get_artworks():
    artworks = await Artwork.all().values()
    images = await ArtworkImage.all().order_by("sort_order", "id").values()
    images_by_artwork: dict[int, list[dict]] = {}
    for image in images:
        images_by_artwork.setdefault(image["artwork_id"], []).append(image)
    for artwork in artworks:
        artwork["images"] = images_by_artwork.get(artwork["id"], [])
    return artworks


@router.get("/artworks/{artwork_id}")
async def get_artwork(artwork_id: int):
    artwork = await get_object_or_404(Artwork, artwork_id)
    data = serialize_instance(artwork)
    data["images"] = await ArtworkImage.filter(artwork_id=artwork_id).order_by(
        "sort_order", "id"
    ).values()
    return data


@router.post("/artworks", status_code=status.HTTP_201_CREATED)
async def create_artwork(payload: ArtworkAdminSave):
    data = payload.model_dump(exclude={"images"})
    if data["category_id"] is not None and not await Category.exists(id=data["category_id"]):
        raise HTTPException(status_code=400, detail="Выбранная категория не существует")
    try:
        async with in_transaction() as connection:
            artwork = await Artwork.create(**data, using_db=connection)
            for image in payload.images:
                await ArtworkImage.create(
                    artwork_id=artwork.id,
                    image_url=image.image_url,
                    sort_order=image.sort_order,
                    using_db=connection,
                )
    except IntegrityError as error:
        raise HTTPException(
            status_code=409,
            detail="Картина с таким slug уже существует",
        ) from error
    return await get_artwork(artwork.id)


@router.put("/artworks/{artwork_id}")
async def replace_artwork(artwork_id: int, payload: ArtworkAdminSave):
    artwork = await get_object_or_404(Artwork, artwork_id)
    data = payload.model_dump(exclude={"images"})
    category_id = data.get("category_id")
    if category_id is not None and not await Category.exists(id=category_id):
        raise HTTPException(status_code=400, detail="Выбранная категория не существует")
    try:
        async with in_transaction() as connection:
            artwork.update_from_dict(data)
            await artwork.save(using_db=connection)
            existing_images = await ArtworkImage.filter(
                artwork_id=artwork_id
            ).using_db(connection)
            images_by_id = {image.id: image for image in existing_images}
            retained_ids: set[int] = set()
            for image_data in payload.images:
                if image_data.id is not None:
                    image = images_by_id.get(image_data.id)
                    if image is None:
                        raise HTTPException(
                            status_code=400,
                            detail="Список фотографий устарел. Обновите страницу",
                        )
                    image.image_url = image_data.image_url
                    image.sort_order = image_data.sort_order
                    await image.save(using_db=connection)
                    retained_ids.add(image.id)
                else:
                    image = await ArtworkImage.create(
                        artwork_id=artwork_id,
                        image_url=image_data.image_url,
                        sort_order=image_data.sort_order,
                        using_db=connection,
                    )
                    retained_ids.add(image.id)
            for image in existing_images:
                if image.id not in retained_ids:
                    await image.delete(using_db=connection)
    except IntegrityError as error:
        raise HTTPException(
            status_code=409,
            detail="Картина с таким slug уже существует",
        ) from error
    return await get_artwork(artwork_id)


@router.delete("/artworks/{artwork_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_artwork(artwork_id: int):
    artwork = await get_object_or_404(Artwork, artwork_id)
    await artwork.delete()


@router.get("/exhibitions")
async def get_exhibitions():
    return await Exhibition.all().values()


@router.get("/exhibitions/{exhibition_id}")
async def get_exhibition(exhibition_id: int):
    exhibition = await get_object_or_404(Exhibition, exhibition_id)
    return serialize_instance(exhibition)


@router.post("/exhibitions", status_code=status.HTTP_201_CREATED)
async def create_exhibition(payload: ExhibitionAdminCreate):
    return await create_object(Exhibition, payload.model_dump())


@router.put("/exhibitions/{exhibition_id}")
async def replace_exhibition(exhibition_id: int, payload: ExhibitionAdminCreate):
    exhibition = await get_object_or_404(Exhibition, exhibition_id)
    return await update_object(exhibition, payload.model_dump())


@router.delete("/exhibitions/{exhibition_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exhibition(exhibition_id: int):
    exhibition = await get_object_or_404(Exhibition, exhibition_id)
    await exhibition.delete()


@router.get("/publications")
async def get_publications():
    return await Publication.all().values()


@router.get("/publications/{publication_id}")
async def get_publication(publication_id: int):
    publication = await get_object_or_404(Publication, publication_id)
    return serialize_instance(publication)


@router.post("/publications", status_code=status.HTTP_201_CREATED)
async def create_publication(payload: PublicationAdminCreate):
    return await create_object(Publication, payload.model_dump())


@router.put("/publications/{publication_id}")
async def replace_publication(publication_id: int, payload: PublicationAdminCreate):
    publication = await get_object_or_404(Publication, publication_id)
    return await update_object(publication, payload.model_dump())


@router.delete("/publications/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_publication(publication_id: int):
    publication = await get_object_or_404(Publication, publication_id)
    await publication.delete()


@router.get("/videos")
async def get_videos():
    return await Video.all().values()


@router.get("/videos/{video_id}")
async def get_video(video_id: int):
    video = await get_object_or_404(Video, video_id)
    return serialize_instance(video)


@router.post("/videos", status_code=status.HTTP_201_CREATED)
async def create_video(payload: VideoAdminCreate):
    return await create_object(Video, payload.model_dump())


@router.put("/videos/{video_id}")
async def replace_video(video_id: int, payload: VideoAdminCreate):
    video = await get_object_or_404(Video, video_id)
    return await update_object(video, payload.model_dump())


@router.delete("/videos/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(video_id: int):
    video = await get_object_or_404(Video, video_id)
    await video.delete()
