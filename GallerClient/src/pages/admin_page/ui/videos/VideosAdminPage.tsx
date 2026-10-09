import { EntityListPage } from "../common/EntityListPage";

export const VideosAdminPage = () => (
  <EntityListPage
    entity="videos"
    title="Видео"
    nameKey="title_ru"
    imageKey="cover_image"
    storedFileKeys={["cover_image", "video_url"]}
  />
);
