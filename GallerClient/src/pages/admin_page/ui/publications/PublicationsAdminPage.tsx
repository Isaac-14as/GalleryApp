import { EntityListPage } from "../common/EntityListPage";

export const PublicationsAdminPage = () => (
  <EntityListPage
    entity="publications"
    title="Публикации"
    nameKey="title_ru"
    imageKey="cover_image"
  />
);
