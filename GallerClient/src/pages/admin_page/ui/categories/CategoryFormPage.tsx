import { Box, CircularProgress } from "@mui/joy";
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

type CategoryForm = {
  name_ru: string;
  name_en: string;
  slug: string;
  description_ru: string;
  description_en: string;
  sort_order: number;
};

type CategoryRecord = {
  id: number;
  name_ru: string;
  name_en: string | null;
  slug: string;
  description_ru: string | null;
  description_en: string | null;
  sort_order: number;
  img: string | null;
};

const emptyForm: CategoryForm = {
  name_ru: "",
  name_en: "",
  slug: "",
  description_ru: "",
  description_en: "",
  sort_order: 0,
};

const recordToForm = (record: CategoryRecord): CategoryForm => ({
  name_ru: record.name_ru,
  name_en: record.name_en ?? "",
  slug: record.slug,
  description_ru: record.description_ru ?? "",
  description_en: record.description_en ?? "",
  sort_order: record.sort_order,
});

export const CategoryFormPage = () => {
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
    queryKey: ["admin-category", recordId],
    queryFn: () => adminApi.get<CategoryRecord>("categories", recordId!),
    enabled: recordId !== null,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!query.data) return;
    setForm(recordToForm(query.data));
    setInitialImage(query.data.img);
    setCover(
      query.data.img
        ? { objectName: query.data.img, previewUrl: "" }
        : null,
    );
  }, [query.data]);

  const set = (key: keyof CategoryForm, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const save = async () => {
    const validation: FieldErrors = {};
    if (!form.name_ru.trim()) validation.name_ru = "Введите название";
    if (!form.slug.trim()) validation.slug = "Введите slug";
    if (Object.keys(validation).length) {
      setErrors(validation);
      enqueueSnackbar("Заполните обязательные поля", { variant: "warning" });
      return;
    }

    setSaving(true);
    let uploaded: string[] = [];
    let saved: CategoryRecord;
    let imageName = cover?.objectName ?? null;

    try {
      if (cover?.file) {
        uploaded = await adminApi.uploadFiles("categories", [cover.file]);
        imageName = uploaded[0] ?? null;
      }
      const payload = {
        ...form,
        name_en: form.name_en || null,
        description_ru: form.description_ru || null,
        description_en: form.description_en || null,
        img: imageName,
      };
      saved = recordId
        ? await adminApi.replace<CategoryRecord>("categories", recordId, payload)
        : await adminApi.create<CategoryRecord>("categories", payload);
    } catch (error) {
      if (uploaded.length) await adminApi.deleteFiles("categories", uploaded);
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
      ? await adminApi.deleteFiles("categories", removedImage)
      : 0;

    setForm(recordToForm(saved));
    setInitialImage(saved.img);
    setCover(
      saved.img
        ? { objectName: saved.img, previewUrl: "" }
        : null,
    );
    setErrors({});
    await queryClient.invalidateQueries({
      queryKey: ["admin-list", "categories"],
    });
    if (!recordId) navigate(`/admin/categories/${saved.id}`, { replace: true });
    enqueueSnackbar("Категория сохранена", { variant: "success" });
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
      title={recordId ? "Редактирование категории" : "Новая категория"}
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
          value={form.name_ru}
          error={errors.name_ru}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("name_ru", event.target.value)}
        />
        <FormField
          label="Название на английском"
          value={form.name_en}
          error={errors.name_en}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("name_en", event.target.value)}
        />
        <FormField
          label="Slug *"
          value={form.slug}
          error={errors.slug}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("slug", event.target.value)}
        />
        <FormField
          label="Порядок"
          type="number"
          value={form.sort_order}
          error={errors.sort_order}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("sort_order", Number(event.target.value))}
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
      </Box>
      <Box sx={{ mt: 3 }}>
        <CoverPicker service="categories" value={cover} onChange={setCover} />
      </Box>
    </FormPage>
  );
};
