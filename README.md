# Gallery App

Монорепозиторий сайта художницы:

- `GallerClient` — React/Vite frontend;
- `GalleryServer` — FastAPI backend;
- PostgreSQL — база данных;
- MinIO — изображения и видео;
- Caddy — внешний HTTP/HTTPS reverse proxy.

## Требования к серверу

- Linux VPS с публичным IPv4;
- установленные Docker Engine и Docker Compose Plugin;
- открытые TCP-порты `80` и `9003` для теста по IP;
- для домена — TCP `80`, TCP/UDP `443`.

PostgreSQL, backend и MinIO Console не публикуются в интернет.

## Первый запуск по IP

После клонирования репозитория:

```bash
cp .env.example .env
nano .env
```

Замените `CHANGE_ME_SERVER_IP` на публичный IPv4 сервера и задайте длинные
случайные пароли для PostgreSQL, админки и MinIO.

Запустите весь проект:

```bash
docker compose up -d
```

При первом запуске Docker автоматически соберёт frontend и backend. После
изменения исходного кода используйте `docker compose up -d --build`.

Проверка состояния:

```bash
docker compose ps
docker compose logs --tail=100 backend
docker compose logs --tail=100 caddy
```

Адреса тестового окружения:

- сайт: `http://SERVER_IP`;
- API docs: `http://SERVER_IP/api/docs`;
- админка: `http://SERVER_IP/admin`;
- MinIO API для файлов: `http://SERVER_IP:9003`.

Таблицы PostgreSQL создаются автоматически из `init-db.sql` только при первом
создании пустого volume `postgres_data`.

## Переход на домен и HTTPS

Создайте DNS-записи `A`:

```text
example.com          -> SERVER_IP
storage.example.com  -> SERVER_IP
```

Измените `.env`:

```env
SITE_ADDRESS=example.com
PUBLIC_ORIGIN=https://example.com

MINIO_SITE_ADDRESS=storage.example.com
MINIO_PUBLIC_URL=https://storage.example.com
MINIO_HOST=storage.example.com
MINIO_PORT=443
MINIO_SECURE=true
```

Затем примените конфигурацию:

```bash
docker compose up -d --build
```

Caddy автоматически запросит и будет обновлять HTTPS-сертификаты.

## Остановка и обновление

```bash
docker compose down
```

Данные при этом сохраняются в Docker volumes. Для обновления:

```bash
git pull
docker compose up -d --build
```

Не запускайте `docker compose down -v`, если не хотите удалить базу данных и
все файлы MinIO.

## Резервное копирование PostgreSQL

```bash
mkdir -p backups
docker compose exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > backups/gallery.dump
```

Файлы MinIO находятся в Docker volume `gallery_minio_data`. Для настоящего
production резервные копии БД и файлов нужно отправлять на другой сервер или в
отдельное объектное хранилище.

## Важное замечание о схеме БД

`init-db.sql` предназначен для первого чистого развёртывания. После появления
реальных данных дальнейшие изменения структуры необходимо делать миграциями, а
не редактированием init-файла.

## Первая публикация в Git

Корневой Git-репозиторий уже инициализирован на ветке `main`. Добавьте URL
пустого удалённого репозитория и выполните:

```bash
git add .
git commit -m "Initial gallery deployment"
git remote add origin <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
git push -u origin main
```

Файлы `.env`, `node_modules`, `venv`, сборки и локальные данные исключены из
Git. Загружать `.env` с настоящими паролями нельзя.
