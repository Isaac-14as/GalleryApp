import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { MainLayout } from "pages/main-layout";
import { Box } from "@mui/joy";

const MainPage = React.lazy(() =>
  import("pages/main_page").then((module) => ({
    default: module.MainPage,
  })),
);

const CategoryPage = React.lazy(() =>
  import("pages/category_page").then((module) => ({
    default: module.CategoryPage,
  })),
);

const ExhibitionsPage = React.lazy(() =>
  import("pages/exhibitions_page").then((module) => ({
    default: module.ExhibitionsPage,
  })),
);

const AdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({ default: module.AdminPage })),
);
const CategoriesAdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.CategoriesAdminPage,
  })),
);
const CategoryFormPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.CategoryFormPage,
  })),
);
const ArtworksAdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.ArtworksAdminPage,
  })),
);
const ArtworkFormPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.ArtworkFormPage,
  })),
);
const ExhibitionsAdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.ExhibitionsAdminPage,
  })),
);
const ExhibitionFormPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.ExhibitionFormPage,
  })),
);
const PublicationsAdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.PublicationsAdminPage,
  })),
);
const PublicationFormPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.PublicationFormPage,
  })),
);
const VideosAdminPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.VideosAdminPage,
  })),
);
const VideoFormPage = React.lazy(() =>
  import("pages/admin_page").then((module) => ({
    default: module.VideoFormPage,
  })),
);

const PublicationsPage = React.lazy(() =>
  import("pages/publications_page").then((module) => ({
    default: module.PublicationsPage,
  })),
);

const VideoPage = React.lazy(() =>
  import("pages/video_page").then((module) => ({
    default: module.VideoPage,
  })),
);

const ArtworkPage = React.lazy(() =>
  import("pages/artwork_page").then((module) => ({
    default: module.ArtworkPage,
  })),
);

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SnackbarProvider maxSnack={3}>
        <MainLayout />
      </SnackbarProvider>
    ),
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/category/:categorySlug",
        element: <CategoryPage />,
      },
      {
        path: "/exhibitions",
        element: <ExhibitionsPage />,
      },
      {
        path: "/publications",
        element: <PublicationsPage />,
      },
      {
        path: "/video",
        element: <VideoPage />,
      },
      {
        path: "/category/:categorySlug/:artworkSlug",
        element: <ArtworkPage />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <SnackbarProvider maxSnack={3}>
        <AdminPage />
      </SnackbarProvider>
    ),
    children: [
      { index: true, element: <Navigate to="categories" replace /> },
      { path: "categories", element: <CategoriesAdminPage /> },
      { path: "categories/new", element: <CategoryFormPage /> },
      { path: "categories/:id", element: <CategoryFormPage /> },
      { path: "artworks", element: <ArtworksAdminPage /> },
      { path: "artworks/new", element: <ArtworkFormPage /> },
      { path: "artworks/:id", element: <ArtworkFormPage /> },
      { path: "exhibitions", element: <ExhibitionsAdminPage /> },
      { path: "exhibitions/new", element: <ExhibitionFormPage /> },
      { path: "exhibitions/:id", element: <ExhibitionFormPage /> },
      { path: "publications", element: <PublicationsAdminPage /> },
      { path: "publications/new", element: <PublicationFormPage /> },
      { path: "publications/:id", element: <PublicationFormPage /> },
      { path: "videos", element: <VideosAdminPage /> },
      { path: "videos/new", element: <VideoFormPage /> },
      { path: "videos/:id", element: <VideoFormPage /> },
    ],
  },
  {
    path: "*",
    element: (
      <SnackbarProvider maxSnack={3}>
        <Box>404 - Page Not Found</Box>
      </SnackbarProvider>
    ),
  },
]);

export const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};
