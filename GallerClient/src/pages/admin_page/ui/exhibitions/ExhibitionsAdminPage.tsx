import { EntityListPage } from "../common/EntityListPage";

export const ExhibitionsAdminPage = () => (
  <EntityListPage
    entity="exhibitions"
    title="Выставки"
    nameKey="title_ru"
    imageKey="cover_image"
  />
);
