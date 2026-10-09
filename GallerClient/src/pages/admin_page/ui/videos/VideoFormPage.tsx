import { Box, Checkbox, CircularProgress, Typography } from "@mui/joy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { adminApi, parseApiError } from "../../api/adminApi";
import type {
  FieldErrors,
  StagedFile,
  StagedImage,
} from "../../model/types";
import { CoverPicker } from "../common/CoverPicker";
import { FormField } from "../common/FormField";
import { FormPage } from "../common/FormPage";
import { LoadError } from "../common/LoadError";
import { VideoFilePicker } from "./VideoFilePicker";

type VideoForm = {
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  sort_order: number;
  published_at: string;
  is_published: boolean;
};

type VideoRecord = {
  id: number;
  title_ru: string;
  title_en: string | null;
  description_ru: string | null;
  description_en: string | null;
  video_url: string;
  cover_image: string | null;
  sort_order: number;
  published_at: string | null;
  is_published: boolean;
};

const emptyForm: VideoForm = {
  title_ru: "",
  title_en: "",
  description_ru: "",
  description_en: "",
  sort_order: 0,
  published_at: "",
  is_published: true,
};

const recordToForm = (record: VideoRecord): VideoForm => ({
  title_ru: record.title_ru,
  title_en: record.title_en ?? "",
  description_ru: record.description_ru ?? "",
  description_en: record.description_en ?? "",
  sort_order: record.sort_order,
  published_at: record.published_at?.slice(0, 16) ?? "",
  is_published: record.is_published,
});

export const VideoFormPage = () => {
  const { id } = useParams();
  const recordId = id && id !== "new" ? Number(id) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [video, setVideo] = useState<StagedFile | null>(null);
  const [cover, setCover] = useState<StagedImage | null>(null);
  const [initialVideo, setInitialVideo] = useState<string | null>(null);
  const [initialCover, setInitialCover] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["admin-video", recordId],
    queryFn: () => adminApi.get<VideoRecord>("videos", recordId!),
    enabled: recordId !== null,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!query.data) return;
    setForm(recordToForm(query.data));
    setInitialVideo(query.data.video_url);
    setInitialCover(query.data.cover_image);
    setVideo({ objectName: query.data.video_url, previewUrl: "" });
    setCover(
      query.data.cover_image
        ? { objectName: query.data.cover_image, previewUrl: "" }
        : null,
    );
  }, [query.data]);

  const set = <Key extends keyof VideoForm>(
    key: Key,
    value: VideoForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const save = async () => {
    const validation: FieldErrors = {};
    if (!form.title_ru.trim()) validation.title_ru = "Введите название";
    if (!video?.objectName && !video?.file) {
      validation.video_url = "Выберите видеофайл";
    }
    if (Object.keys(validation).length) {
      setErrors(validation);
      enqueueSnackbar("Заполните обязательные поля", { variant: "warning" });
      return;
    }

    setSaving(true);
    const uploaded: string[] = [];
    let videoName = video?.objectName ?? "";
    let coverName = cover?.objectName ?? null;
    let saved: VideoRecord;

    try {
      if (video?.file) {
        const names = await adminApi.uploadFiles("videos", [video.file]);
        uploaded.push(...names);
        videoName = names[0] ?? "";
      }
      if (cover?.file) {
        const names = await adminApi.uploadFiles("videos", [cover.file]);
        uploaded.push(...names);
        coverName = names[0] ?? null;
      }

      const payload = {
        ...form,
        title_en: form.title_en || null,
        description_ru: form.description_ru || null,
        description_en: form.description_en || null,
        published_at: form.published_at || null,
        video_url: videoName,
        cover_image: coverName,
      };

      saved = recordId
        ? await adminApi.replace<VideoRecord>("videos", recordId, payload)
        : await adminApi.create<VideoRecord>("videos", payload);
    } catch (error) {
      if (uploaded.length) await adminApi.deleteFiles("videos", uploaded);
      const parsed = parseApiError(error);
      setErrors(parsed.fields);
      enqueueSnackbar(parsed.message, { variant: "error" });
      setSaving(false);
      return;
    }

    const replacedFiles = [
      initialVideo && initialVideo !== videoName ? initialVideo : null,
      initialCover && initialCover !== coverName ? initialCover : null,
    ].filter((name): name is string => Boolean(name));
    const cleanupFailures = replacedFiles.length
      ? await adminApi.deleteFiles("videos", replacedFiles)
      : 0;

    setForm(recordToForm(saved));
    setInitialVideo(saved.video_url);
    setInitialCover(saved.cover_image);
    setVideo({ objectName: saved.video_url, previewUrl: "" });
    setCover(
      saved.cover_image
        ? { objectName: saved.cover_image, previewUrl: "" }
        : null,
    );
    setErrors({});
    await queryClient.invalidateQueries({ queryKey: ["admin-list", "videos"] });
    await queryClient.invalidateQueries({ queryKey: ["videos"] });
    if (!recordId) navigate(`/admin/videos/${saved.id}`, { replace: true });
    enqueueSnackbar("Видео сохранено", { variant: "success" });
    if (cleanupFailures) {
      enqueueSnackbar("Некоторые старые файлы остались в хранилище", {
        variant: "warning",
      });
    }
    setSaving(false);
  };

  if (query.isPending && recordId !== null) return <CircularProgress />;
  if (query.isError && recordId !== null) {
    return (
      <LoadError
        message={parseApiError(query.error).message}
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <FormPage
      title={recordId ? "Редактирование видео" : "Новое видео"}
      saving={saving}
      onSubmit={() => void save()}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <FormField
          label="Название на русском *"
          value={form.title_ru}
          error={errors.title_ru}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("title_ru", event.target.value)}
        />
        <FormField
          label="Название на английском"
          value={form.title_en}
          error={errors.title_en}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("title_en", event.target.value)}
        />
        <FormField
          label="Описание на русском"
          textarea
          value={form.description_ru}
          error={errors.description_ru}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            set("description_ru", event.target.value)}
        />
        <FormField
          label="Описание на английском"
          textarea
          value={form.description_en}
          error={errors.description_en}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            set("description_en", event.target.value)}
        />
        <FormField
          label="Порядок отображения"
          type="number"
          value={form.sort_order}
          error={errors.sort_order}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("sort_order", Number(event.target.value))}
        />
        <FormField
          label="Дата публикации"
          type="datetime-local"
          value={form.published_at}
          error={errors.published_at}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("published_at", event.target.value)}
        />
        <Box>
          <Typography level="body-sm" sx={{ mb: 1 }}>
            Статус
          </Typography>
          <Checkbox
            checked={form.is_published}
            onChange={(event) => set("is_published", event.target.checked)}
            label="Опубликовано"
          />
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <VideoFilePicker
          value={video}
          error={errors.video_url}
          onChange={(value) => {
            setVideo(value);
            setErrors((current) => ({ ...current, video_url: "" }));
          }}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <CoverPicker service="videos" value={cover} onChange={setCover} />
      </Box>
    </FormPage>
  );
};
