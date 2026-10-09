from tortoise import fields
from tortoise.models import Model


class Category(Model):
    id = fields.IntField(pk=True)
    name_ru = fields.CharField(max_length=100, unique=True)
    name_en = fields.CharField(max_length=100, null=True)
    slug = fields.CharField(max_length=120, unique=True)
    description_ru = fields.TextField(null=True)
    description_en = fields.TextField(null=True)
    sort_order = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)
    img = fields.CharField(max_length=500, null=True)

    artworks: fields.ReverseRelation["Artwork"]

    class Meta:
        table = "categories"
        ordering = ["sort_order", "id"]

    def __str__(self) -> str:
        return self.name_ru


class Artwork(Model):
    id = fields.IntField(pk=True)
    category: fields.ForeignKeyNullableRelation[Category] = fields.ForeignKeyField(
        "models.Category",
        related_name="artworks",
        on_delete=fields.SET_NULL,
        null=True,
    )
    title_ru = fields.CharField(max_length=255)
    title_en = fields.CharField(max_length=255, null=True)
    slug = fields.CharField(max_length=280, unique=True)
    description_ru = fields.TextField(null=True)
    description_en = fields.TextField(null=True)
    price = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    year_created = fields.IntField(null=True)
    width_cm = fields.DecimalField(max_digits=6, decimal_places=1, null=True)
    height_cm = fields.DecimalField(max_digits=6, decimal_places=1, null=True)
    technique = fields.CharField(max_length=255, null=True)
    material_ru = fields.CharField(max_length=255, null=True)
    material_en = fields.CharField(max_length=255, null=True)
    weight_kg = fields.DecimalField(max_digits=8, decimal_places=2, null=True)
    genre_ru = fields.CharField(max_length=120, null=True)
    genre_en = fields.CharField(max_length=120, null=True)
    is_sold = fields.BooleanField(default=False)
    is_available = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    artwork_images: fields.ReverseRelation["ArtworkImage"]

    class Meta:
        table = "artworks"
        ordering = ["-created_at"]
        indexes = [("category_id",)]

    def __str__(self) -> str:
        return self.title_ru


class ArtworkImage(Model):
    id = fields.IntField(pk=True)
    artwork: fields.ForeignKeyRelation[Artwork] = fields.ForeignKeyField(
        "models.Artwork",
        related_name="images",
        on_delete=fields.CASCADE,
    )
    image_url = fields.CharField(max_length=500)
    sort_order = fields.IntField(default=0)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "artwork_images"
        ordering = ["sort_order", "id"]
        indexes = [("artwork_id",)]

    def __str__(self) -> str:
        return self.image_url


class Exhibition(Model):
    id = fields.IntField(pk=True)
    title_ru = fields.CharField(max_length=255)
    title_en = fields.CharField(max_length=255, null=True)
    description_ru = fields.TextField(null=True)
    description_en = fields.TextField(null=True)
    location_ru = fields.CharField(max_length=255, null=True)
    location_en = fields.CharField(max_length=255, null=True)
    start_year = fields.IntField(null=True)
    end_year = fields.IntField(null=True)
    cover_image = fields.CharField(max_length=500, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "exhibitions"
        ordering = ["-start_year", "-created_at"]

    def __str__(self) -> str:
        return self.title_ru


class Publication(Model):
    id = fields.IntField(pk=True)
    title_ru = fields.CharField(max_length=255)
    title_en = fields.CharField(max_length=255, null=True)
    description_ru = fields.TextField(null=True)
    description_en = fields.TextField(null=True)
    cover_image = fields.CharField(max_length=500, null=True)
    published_at = fields.DatetimeField(null=True)
    is_published = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "publications"
        ordering = ["-published_at", "-created_at"]

    def __str__(self) -> str:
        return self.title_ru


class Video(Model):
    id = fields.IntField(pk=True)
    title_ru = fields.CharField(max_length=255)
    title_en = fields.CharField(max_length=255, null=True)
    description_ru = fields.TextField(null=True)
    description_en = fields.TextField(null=True)
    video_url = fields.CharField(max_length=500)
    cover_image = fields.CharField(max_length=500, null=True)
    sort_order = fields.IntField(default=0)
    published_at = fields.DatetimeField(null=True)
    is_published = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "videos"
        ordering = ["sort_order", "-published_at", "-created_at"]

    def __str__(self) -> str:
        return self.title_ru


# -- ============================================
# -- КАТЕГОРИИ КАРТИН
# -- ============================================
# CREATE TABLE categories (
#     id          SERIAL PRIMARY KEY,
#     name        VARCHAR(100) NOT NULL UNIQUE,
#     slug        VARCHAR(120) NOT NULL UNIQUE,  -- для красивых URL
#     description TEXT,
#     sort_order  INTEGER DEFAULT 0,
#     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
# );

# -- ============================================
# -- КАРТИНЫ
# -- ============================================
# CREATE TABLE artworks (
#     id           SERIAL PRIMARY KEY,
#     category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
#     title        VARCHAR(255) NOT NULL,
#     slug         VARCHAR(280) NOT NULL UNIQUE,
#     description  TEXT,
#     price        NUMERIC(10, 2),          -- NULL, если "не продаётся" / "цена по запросу"
#     year_created INTEGER,                  -- год написания
#     width_cm     NUMERIC(6, 1),
#     height_cm    NUMERIC(6, 1),
#     technique    VARCHAR(255),             -- "масло, холст" и т.п.
#     is_sold      BOOLEAN NOT NULL DEFAULT false,
#     is_available BOOLEAN NOT NULL DEFAULT true,  -- показывать ли на сайте
#     created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
#     updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
# );

# CREATE INDEX idx_artworks_category ON artworks(category_id);

# -- Фото картин (у одной картины может быть несколько фото)
# CREATE TABLE artwork_images (
#     id          SERIAL PRIMARY KEY,
#     artwork_id  INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
#     image_url   VARCHAR(500) NOT NULL,
#     sort_order  INTEGER DEFAULT 0,
#     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
# );

# CREATE INDEX idx_artwork_images_artwork ON artwork_images(artwork_id);

# -- ============================================
# -- ВЫСТАВКИ
# -- ============================================
# CREATE TABLE exhibitions (
#     id          SERIAL PRIMARY KEY,
#     title       VARCHAR(255) NOT NULL,
#     slug        VARCHAR(280) NOT NULL UNIQUE,
#     description TEXT,
#     location    VARCHAR(255),        -- город, галерея
#     start_date  DATE,
#     end_date    DATE,
#     cover_image VARCHAR(500),
#     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
# );

# -- Связь картин с выставками (многие-ко-многим — картина могла
# -- участвовать в нескольких выставках)
# CREATE TABLE exhibition_artworks (
#     exhibition_id INTEGER NOT NULL REFERENCES exhibitions(id) ON DELETE CASCADE,
#     artwork_id    INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
#     PRIMARY KEY (exhibition_id, artwork_id)
# );

# -- ============================================
# -- ПУБЛИКАЦИИ (новости/посты с картиной, фото, описанием)
# -- ============================================
# CREATE TABLE publications (
#     id          SERIAL PRIMARY KEY,
#     artwork_id  INTEGER REFERENCES artworks(id) ON DELETE SET NULL, -- опционально привязана к картине
#     title       VARCHAR(255) NOT NULL,
#     slug        VARCHAR(280) NOT NULL UNIQUE,
#     description TEXT,
#     published_at TIMESTAMPTZ,
#     is_published BOOLEAN NOT NULL DEFAULT true,
#     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
# );

# CREATE TABLE publication_images (
#     id             SERIAL PRIMARY KEY,
#     publication_id INTEGER NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
#     image_url      VARCHAR(500) NOT NULL,
#     sort_order     INTEGER DEFAULT 0
# );
