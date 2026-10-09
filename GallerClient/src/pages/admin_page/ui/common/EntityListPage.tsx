import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, CircularProgress, Typography } from "@mui/joy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { s3Api } from "shared/api";
import { adminApi, parseApiError } from "../../api/adminApi";
import type { AdminEntity, AdminRecord } from "../../model/types";
import { LoadError } from "./LoadError";

type EntityListPageProps = {
  entity: AdminEntity;
  title: string;
  nameKey: string;
  imageKey?: string;
  storedFileKeys?: string[];
};

type ArtworkImage = { image_url: string };

const artworkImages = (item: AdminRecord) =>
  (item.images as ArtworkImage[] | undefined) ?? [];

export const EntityListPage = ({
  entity,
  title,
  nameKey,
  imageKey,
  storedFileKeys,
}: EntityListPageProps) => {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const query = useQuery({
    queryKey: ["admin-list", entity],
    queryFn: () => adminApi.list<AdminRecord>(entity),
    retry: false,
  });

  const imageNames = useMemo(
    () =>
      query.data?.flatMap((item) => {
        if (entity === "artworks") {
          const firstImage = artworkImages(item)[0]?.image_url;
          return firstImage ? [firstImage] : [];
        }
        const imageName = imageKey ? item[imageKey] : null;
        return typeof imageName === "string" && imageName ? [imageName] : [];
      }) ?? [],
    [entity, imageKey, query.data],
  );

  const images = useQuery({
    queryKey: ["admin-list-images", entity, imageNames],
    queryFn: () => s3Api.getFilesUrls(entity, imageNames),
    enabled: imageNames.length > 0,
  });
  const urls = useMemo(
    () =>
      new Map((images.data ?? []).map((item) => [item.object_name, item.url])),
    [images.data],
  );

  const getStoredImages = (item: AdminRecord) => {
    if (entity === "artworks") {
      return artworkImages(item).map((image) => image.image_url);
    }
    const keys = storedFileKeys ?? (imageKey ? [imageKey] : []);
    return keys.flatMap((key) => {
      const fileName = item[key];
      return typeof fileName === "string" && fileName ? [fileName] : [];
    });
  };

  const remove = async (item: AdminRecord) => {
    if (!confirm("Удалить запись? Это действие нельзя отменить.")) return;
    setDeletingId(item.id);
    try {
      await adminApi.remove(entity, item.id);
    } catch (error) {
      enqueueSnackbar(parseApiError(error).message, { variant: "error" });
      setDeletingId(null);
      return;
    }

    const storedImages = getStoredImages(item);
    const cleanupFailures = storedImages.length
      ? await adminApi.deleteFiles(entity, storedImages)
      : 0;
    await queryClient.invalidateQueries({ queryKey: ["admin-list", entity] });
    enqueueSnackbar("Запись удалена", { variant: "success" });
    if (cleanupFailures) {
      enqueueSnackbar("Некоторые файлы остались в хранилище", {
        variant: "warning",
      });
    }
    setDeletingId(null);
  };

  if (query.isPending) return <CircularProgress />;
  if (query.isError) {
    return (
      <LoadError
        message={parseApiError(query.error).message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography level="h1">{title}</Typography>
        <Button component={Link} to="new" startDecorator={<AddRoundedIcon />}>
          Добавить
        </Button>
      </Box>

      {!query.data?.length ? (
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 14,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography>Здесь пока нет записей</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {query.data.map((item) => {
            const imageName = getStoredImages(item)[0];
            const imageUrl = imageName ? urls.get(imageName) : null;
            return (
              <Box
                key={item.id}
                sx={{
                  bgcolor: "white",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "sm",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                  }}
                >
                  {imageUrl ? (
                    <Box
                      component="img"
                      src={imageUrl}
                      alt=""
                      sx={{ width: "100%", height: 180, objectFit: "cover" }}
                    />
                  ) : (
                    <Typography sx={{ textAlign: "center" }}>
                      Изображение отсутствует
                    </Typography>
                  )}
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography level="h3">
                    {String(item[nameKey] ?? `Запись №${item.id}`)}
                  </Typography>
                  <Typography level="body-xs" sx={{ mb: 2 }}>
                    ID: {item.id}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      component={Link}
                      to={String(item.id)}
                      startDecorator={<EditRoundedIcon />}
                    >
                      Редактировать
                    </Button>
                    <Button
                      color="danger"
                      variant="soft"
                      loading={deletingId === item.id}
                      disabled={deletingId !== null && deletingId !== item.id}
                      onClick={() => void remove(item)}
                      startDecorator={<DeleteOutlineRoundedIcon />}
                    >
                      Удалить
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
