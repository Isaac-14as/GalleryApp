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

type ExhibitionForm = {
  title_ru: string;
  title_en: string;
  description_ru: string;
  description_en: string;
  location_ru: string;
  location_en: string;
  start_year: number | "";
  end_year: number | "";
};

type ExhibitionRecord = {
  id: number;
  title_ru: string;
  title_en: string | null;
  description_ru: string | null;
  description_en: string | null;
  location_ru: string | null;
  location_en: string | null;
  start_year: number | null;
  end_year: number | null;
  cover_image: string | null;
};

const emptyForm: ExhibitionForm = {
  title_ru: "",
  title_en: "",
  description_ru: "",
  description_en: "",
  location_ru: "",
  location_en: "",
  start_year: "",
  end_year: "",
};

const recordToForm = (record: ExhibitionRecord): ExhibitionForm => ({
  title_ru: record.title_ru,
  title_en: record.title_en ?? "",
  description_ru: record.description_ru ?? "",
  description_en: record.description_en ?? "",
  location_ru: record.location_ru ?? "",
  location_en: record.location_en ?? "",
  start_year: record.start_year ?? "",
  end_year: record.end_year ?? "",
});

export const ExhibitionFormPage = () => {
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
    queryKey: ["admin-exhibition", recordId],
    queryFn: () => adminApi.get<ExhibitionRecord>("exhibitions", recordId!),
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

  const set = (key: keyof ExhibitionForm, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const save = async () => {
    const validation: FieldErrors = {};
    if (!form.title_ru.trim()) validation.title_ru = "Введите название";
    if (form.start_year && form.end_year && form.end_year < form.start_year) {
      validation.end_year = "Год окончания не может быть меньше года начала";
    }
    if (Object.keys(validation).length) {
      setErrors(validation);
      enqueueSnackbar("Проверьте заполнение формы", { variant: "warning" });
      return;
    }

    setSaving(true);
    let uploaded: string[] = [];
    let saved: ExhibitionRecord;
    let imageName = cover?.objectName ?? null;

    try {
      if (cover?.file) {
        uploaded = await adminApi.uploadFiles("exhibitions", [cover.file]);
        imageName = uploaded[0] ?? null;
      }
      const payload = {
        ...form,
        title_en: form.title_en || null,
        description_ru: form.description_ru || null,
        description_en: form.description_en || null,
        location_ru: form.location_ru || null,
        location_en: form.location_en || null,
        start_year: form.start_year || null,
        end_year: form.end_year || null,
        cover_image: imageName,
      };
      saved = recordId
        ? await adminApi.replace<ExhibitionRecord>("exhibitions", recordId, payload)
        : await adminApi.create<ExhibitionRecord>("exhibitions", payload);
    } catch (error) {
      if (uploaded.length) await adminApi.deleteFiles("exhibitions", uploaded);
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
      ? await adminApi.deleteFiles("exhibitions", removedImage)
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
      queryKey: ["admin-list", "exhibitions"],
    });
    if (!recordId) navigate(`/admin/exhibitions/${saved.id}`, { replace: true });
    enqueueSnackbar("Выставка сохранена", { variant: "success" });
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
      title={recordId ? "Редактирование выставки" : "Новая выставка"}
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
          label="Место на русском"
          value={form.location_ru}
          error={errors.location_ru}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("location_ru", event.target.value)}
        />
        <FormField
          label="Место на английском"
          value={form.location_en}
          error={errors.location_en}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("location_en", event.target.value)}
        />
        <FormField
          label="Год начала"
          type="number"
          value={form.start_year}
          error={errors.start_year}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("start_year", event.target.value ? Number(event.target.value) : "")}
        />
        <FormField
          label="Год окончания"
          type="number"
          value={form.end_year}
          error={errors.end_year}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("end_year", event.target.value ? Number(event.target.value) : "")}
        />
      </Box>
      <Box sx={{ mt: 3 }}>
        <CoverPicker service="exhibitions" value={cover} onChange={setCover} />
      </Box>
    </FormPage>
  );
};
