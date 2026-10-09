BEGIN;

CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name_ru         VARCHAR(100) NOT NULL UNIQUE,
    name_en         VARCHAR(100),
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description_ru  TEXT,
    description_en  TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    img             VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS artworks (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    title_ru        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    slug            VARCHAR(280) NOT NULL UNIQUE,
    description_ru  TEXT,
    description_en  TEXT,
    price           NUMERIC(10, 2),
    year_created    INTEGER,
    width_cm        NUMERIC(6, 1),
    height_cm       NUMERIC(6, 1),
    technique       VARCHAR(255),
    material_ru     VARCHAR(255),
    material_en     VARCHAR(255),
    weight_kg       NUMERIC(8, 2),
    genre_ru        VARCHAR(120),
    genre_en        VARCHAR(120),
    is_sold         BOOLEAN NOT NULL DEFAULT FALSE,
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artworks_category
    ON artworks(category_id);

CREATE TABLE IF NOT EXISTS artwork_images (
    id          SERIAL PRIMARY KEY,
    artwork_id  INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    image_url   VARCHAR(500) NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork
    ON artwork_images(artwork_id);

CREATE TABLE IF NOT EXISTS exhibitions (
    id              SERIAL PRIMARY KEY,
    title_ru        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    description_ru  TEXT,
    description_en  TEXT,
    location_ru     VARCHAR(255),
    location_en     VARCHAR(255),
    start_year      INTEGER,
    end_year        INTEGER,
    cover_image     VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT exhibitions_years_check
        CHECK (end_year IS NULL OR start_year IS NULL OR end_year >= start_year)
);

CREATE TABLE IF NOT EXISTS publications (
    id              SERIAL PRIMARY KEY,
    title_ru        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    description_ru  TEXT,
    description_en  TEXT,
    cover_image     VARCHAR(500),
    published_at    TIMESTAMPTZ,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publications_visibility
    ON publications(is_published, published_at DESC);

CREATE TABLE IF NOT EXISTS videos (
    id              SERIAL PRIMARY KEY,
    title_ru        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255),
    description_ru  TEXT,
    description_en  TEXT,
    video_url       VARCHAR(500) NOT NULL,
    cover_image     VARCHAR(500),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    is_published    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_publication_order
    ON videos(is_published, sort_order, published_at DESC);

COMMIT;
