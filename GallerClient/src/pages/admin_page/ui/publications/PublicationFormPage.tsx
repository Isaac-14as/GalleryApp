import { Box, Checkbox, CircularProgress, Typography } from "@mui/joy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi, parseApiError } from "../../api/adminApi";
import type { FieldErrors, StagedImage } from "../../model/types";
import { CoverPicker } from "../common/CoverPicker";
import { FormField } from "../common/FormField";
import { FormPage } from "../common/FormPage";
import { LoadError } from "../common/LoadError";

type PublicationForm = {
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  published_at: string;
  is_published: boolean;
};

type PublicationRecord = {
  id: number;
  title_ru: string;
  title_en: string | null;
  description_ru: string | null;
  description_en: string | null;
  published_at: string | null;
  is_published: boolean;
  cover_image: string | null;
};

const emptyForm: PublicationForm = {
  title_ru: "",
  title_en: "",
  description_ru: "",
  description_en: "",
  published_at: "",
  is_published: true,
};

const recordToForm = (record: PublicationRecord): PublicationForm => ({
  title_ru: record.title_ru,
  title_en: record.title_en ?? "",
  description_ru: record.description_ru ?? "",
  description_en: record.description_en ?? "",
  published_at: record.published_at?.slice(0, 16) ?? "",
  is_published: record.is_published,
});

export const PublicationFormPage = () => {
  const { id } = useParams();
  const recordId = id && id !== "new" ? Number(id) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [cover, setCover] = useState<StagedImage | null>(null);
  const [initialImage, setInitialImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["admin-publication", recordId],
    queryFn: () => adminApi.get<PublicationRecord>("publications", recordId!),
    enabled: recordId !== null,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!query.data) return;
    setForm(recordToForm(query.data));
    setInitialImage(query.data.cover_image);
    setCover(
      query.data.cover_image
        ? { objectName: query.data.cover_image, previewUrl: "" }
        : null,
    );
  }, [query.data]);

  const set = <Key extends keyof PublicationForm>(
    key: Key,
    value: PublicationForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const save = async () => {
    const validation: FieldErrors = {};
    if (!form.title_ru.trim()) validation.title_ru = "Введите название";
    if (Object.keys(validation).length) {
      setErrors(validation);
      enqueueSnackbar("Заполните обязательные поля", { variant: "warning" });
      return;
    }

    setSaving(true);
    let uploaded: string[] = [];
    let saved: PublicationRecord;
    let imageName = cover?.objectName ?? null;

    try {
      if (cover?.file) {
        uploaded = await adminApi.uploadFiles("publications", [cover.file]);
        imageName = uploaded[0] ?? null;
      }
      const payload = {
        ...form,
        title_en: form.title_en || null,
        description_ru: form.description_ru || null,
        description_en: form.description_en || null,
        published_at: form.published_at || null,
        cover_image: imageName,
      };
      saved = recordId
        ? await adminApi.replace<PublicationRecord>("publications", recordId, payload)
        : await adminApi.create<PublicationRecord>("publications", payload);
    } catch (error) {
      if (uploaded.length) await adminApi.deleteFiles("publications", uploaded);
      const parsed = parseApiError(error);
      setErrors(parsed.fields);
      enqueueSnackbar(parsed.message, { variant: "error" });
      setSaving(false);
      return;
    }

    const removedImage = initialImage && initialImage !== imageName
      ? [initialImage]
      : [];
    const cleanupFailures = removedImage.length
      ? await adminApi.deleteFiles("publications", removedImage)
      : 0;

    setForm(recordToForm(saved));
    setInitialImage(saved.cover_image);
    setCover(
      saved.cover_image
        ? { objectName: saved.cover_image, previewUrl: "" }
        : null,
    );
    setErrors({});
    await queryClient.invalidateQueries({
      queryKey: ["admin-list", "publications"],
    });
    if (!recordId) navigate(`/admin/publications/${saved.id}`, { replace: true });
    enqueueSnackbar("Публикация сохранена", { variant: "success" });
    if (cleanupFailures) {
      enqueueSnackbar("Старая фотография сохранена в хранилище", {
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
      title={recordId ? "Редактирование публикации" : "Новая публикация"}
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
        <CoverPicker service="publications" value={cover} onChange={setCover} />
      </Box>
    </FormPage>
  );
};
