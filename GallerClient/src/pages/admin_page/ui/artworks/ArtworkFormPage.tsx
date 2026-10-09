import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Box, Button, Checkbox, CircularProgress, Typography } from "@mui/joy";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { s3Api } from "shared/api";
import { adminApi, parseApiError } from "../../api/adminApi";
import type { AdminRecord, FieldErrors, StagedImage } from "../../model/types";
import { FormField } from "../common/FormField";
import { FormPage } from "../common/FormPage";
import { ImageDropzone } from "../common/ImageDropzone";
import { LoadError } from "../common/LoadError";

type ArtworkForm = {
  category_id: number | null;
  title_ru: string;
  title_en: string;
  slug: string;
  description_ru: string;
  description_en: string;
  price: number | "";
  year_created: number | "";
  width_cm: number | "";
  height_cm: number | "";
  technique: string;
  material_ru: string;
  material_en: string;
  weight_kg: number | "";
  genre_ru: string;
  genre_en: string;
  is_sold: boolean;
  is_available: boolean;
};

type ImageRecord = {
  id: number;
  image_url: string;
  sort_order: number;
};

type ArtworkRecord = {
  id: number;
  category_id: number | null;
  title_ru: string;
  title_en: string | null;
  slug: string;
  description_ru: string | null;
  description_en: string | null;
  price: number | string | null;
  year_created: number | null;
  width_cm: number | string | null;
  height_cm: number | string | null;
  technique: string | null;
  material_ru: string | null;
  material_en: string | null;
  weight_kg: number | string | null;
  genre_ru: string | null;
  genre_en: string | null;
  is_sold: boolean;
  is_available: boolean;
  images: ImageRecord[];
};

const emptyForm: ArtworkForm = {
  category_id: null,
  title_ru: "",
  title_en: "",
  slug: "",
  description_ru: "",
  description_en: "",
  price: "",
  year_created: "",
  width_cm: "",
  height_cm: "",
  technique: "",
  material_ru: "",
  material_en: "",
  weight_kg: "",
  genre_ru: "",
  genre_en: "",
  is_sold: false,
  is_available: true,
};

const optionalNumber = (value: number | string | null): number | "" =>
  value === null ? "" : Number(value);

const recordToForm = (record: ArtworkRecord): ArtworkForm => ({
  category_id: record.category_id,
  title_ru: record.title_ru,
  title_en: record.title_en ?? "",
  slug: record.slug,
  description_ru: record.description_ru ?? "",
  description_en: record.description_en ?? "",
  price: optionalNumber(record.price),
  year_created: optionalNumber(record.year_created),
  width_cm: optionalNumber(record.width_cm),
  height_cm: optionalNumber(record.height_cm),
  technique: record.technique ?? "",
  material_ru: record.material_ru ?? "",
  material_en: record.material_en ?? "",
  weight_kg: optionalNumber(record.weight_kg),
  genre_ru: record.genre_ru ?? "",
  genre_en: record.genre_en ?? "",
  is_sold: record.is_sold,
  is_available: record.is_available,
});

export const ArtworkFormPage = () => {
  const { id } = useParams();
  const recordId = id && id !== "new" ? Number(id) : null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const localPreviewUrls = useRef(new Set<string>());
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<StagedImage[]>([]);
  const [initialNames, setInitialNames] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const query = useQuery({
    queryKey: ["admin-artwork", recordId],
    queryFn: () => adminApi.get<ArtworkRecord>("artworks", recordId!),
    enabled: recordId !== null,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const categories = useQuery({
    queryKey: ["admin-artwork-categories"],
    queryFn: () => adminApi.list<AdminRecord>("categories"),
  });

  const clearLocalPreviews = useCallback(() => {
    localPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    localPreviewUrls.current.clear();
  }, []);

  const applyRecord = useCallback(async (record: ArtworkRecord) => {
    const sortedImages = [...record.images].sort(
      (left, right) => left.sort_order - right.sort_order || left.id - right.id,
    );
    const names = sortedImages.map((image) => image.image_url);
    clearLocalPreviews();
    setForm(recordToForm(record));
    setInitialNames(names);
    setImages(
      sortedImages.map((image) => ({
        id: image.id,
        objectName: image.image_url,
        previewUrl: "",
      })),
    );

    try {
      if (names.length) {
        const urls = await s3Api.getFilesUrls("artworks", names);
        const urlsByName = new Map(
          urls.map((item) => [item.object_name, item.url]),
        );
        setImages((current) => current.map((image) => (
          image.file
            ? image
            : {
                ...image,
                previewUrl: image.objectName
                  ? urlsByName.get(image.objectName) ?? ""
                  : "",
              }
        )));
      }
    } catch {
      enqueueSnackbar("Не удалось загрузить предпросмотр фотографий", {
        variant: "warning",
      });
    }
  }, [clearLocalPreviews]);

  useEffect(() => {
    if (query.data) void applyRecord(query.data);
  }, [applyRecord, query.data]);

  useEffect(() => () => clearLocalPreviews(), [clearLocalPreviews]);

  const set = <Key extends keyof ArtworkForm>(
    key: Key,
    value: ArtworkForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const addFiles = (files: File[]) => {
    const staged = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      localPreviewUrls.current.add(previewUrl);
      return { file, previewUrl };
    });
    setImages((current) => [...current, ...staged]);
  };

  const removeImage = (index: number) => {
    setImages((current) => {
      const removed = current[index];
      if (removed?.file) {
        URL.revokeObjectURL(removed.previewUrl);
        localPreviewUrls.current.delete(removed.previewUrl);
      }
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const reorderImages = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= images.length) return;
    setImages((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      if (!moved) return current;
      next.splice(to, 0, moved);
      return next;
    });
  };

  const validate = () => {
    const validation: FieldErrors = {};
    if (!form.title_ru.trim()) validation.title_ru = "Введите название";
    if (!form.slug.trim()) validation.slug = "Введите slug";
    if (form.price !== "" && form.price < 0) {
      validation.price = "Цена не может быть отрицательной";
    }
    if (form.width_cm !== "" && form.width_cm <= 0) {
      validation.width_cm = "Ширина должна быть больше нуля";
    }
    if (form.height_cm !== "" && form.height_cm <= 0) {
      validation.height_cm = "Высота должна быть больше нуля";
    }
    if (form.weight_kg !== "" && form.weight_kg <= 0) {
      validation.weight_kg = "Вес должен быть больше нуля";
    }
    return validation;
  };

  const save = async () => {
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      enqueueSnackbar("Проверьте заполнение формы", { variant: "warning" });
      return;
    }

    setSaving(true);
    let uploaded: string[] = [];
    let saved: ArtworkRecord;
    let payloadImageNames: string[] = [];

    try {
      const pending = images.filter(
        (image): image is StagedImage & { file: File } => Boolean(image.file),
      );
      if (pending.length) {
        uploaded = await adminApi.uploadFiles(
          "artworks",
          pending.map((image) => image.file),
        );
      }

      let uploadedIndex = 0;
      const payloadImages = images.map((image, index) => {
        const imageName = image.file
          ? uploaded[uploadedIndex++]
          : image.objectName;
        if (!imageName) throw new Error("Не удалось подготовить фотографию");
        return {
          id: image.id,
          image_url: imageName,
          sort_order: index,
        };
      });
      payloadImageNames = payloadImages.map((image) => image.image_url);
      const payload = {
        ...form,
        title_en: form.title_en || null,
        description_ru: form.description_ru || null,
        description_en: form.description_en || null,
        price: form.price === "" ? null : form.price,
        year_created: form.year_created === "" ? null : form.year_created,
        width_cm: form.width_cm === "" ? null : form.width_cm,
        height_cm: form.height_cm === "" ? null : form.height_cm,
        technique: form.technique || null,
        material_ru: form.material_ru || null,
        material_en: form.material_en || null,
        weight_kg: form.weight_kg === "" ? null : form.weight_kg,
        genre_ru: form.genre_ru || null,
        genre_en: form.genre_en || null,
        images: payloadImages,
      };
      saved = recordId
        ? await adminApi.replace<ArtworkRecord>("artworks", recordId, payload)
        : await adminApi.create<ArtworkRecord>("artworks", payload);
    } catch (error) {
      if (uploaded.length) await adminApi.deleteFiles("artworks", uploaded);
      const parsed = parseApiError(error);
      setErrors(parsed.fields);
      enqueueSnackbar(parsed.message, { variant: "error" });
      setSaving(false);
      return;
    }

    const retained = new Set(payloadImageNames);
    const removedImages = initialNames.filter((name) => !retained.has(name));
    const cleanupFailures = removedImages.length
      ? await adminApi.deleteFiles("artworks", removedImages)
      : 0;

    await applyRecord(saved);
    setErrors({});
    await queryClient.invalidateQueries({
      queryKey: ["admin-list", "artworks"],
    });
    if (!recordId) navigate(`/admin/artworks/${saved.id}`, { replace: true });
    enqueueSnackbar("Картина и фотографии сохранены", { variant: "success" });
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
      title={recordId ? "Редактирование картины" : "Новая картина"}
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
          label="Slug *"
          value={form.slug}
          error={errors.slug}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("slug", event.target.value)}
        />
        <Box>
          <Typography level="body-sm" sx={{ mb: 0.5 }}>
            Категория
          </Typography>
          <Box
            component="select"
          value={form.category_id ?? ""}
            onChange={(event) =>
              set(
                "category_id",
                event.target.value ? Number(event.target.value) : null,
              )}
            sx={{
              width: "100%",
              minHeight: 40,
              borderRadius: 7,
              border: "1px solid",
              borderColor: "neutral.300",
              bgcolor: "white",
              px: 1,
            }}
          >
            <option value="">Без категории</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {String(category.name_ru)}
              </option>
            ))}
          </Box>
          {errors.category_id && (
            <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
              {errors.category_id}
            </Typography>
          )}
          {categories.isError && (
            <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
              Не удалось загрузить категории
            </Typography>
          )}
        </Box>
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
          label="Цена"
          type="number"
          slotProps={{ input: { min: 0 } }}
          value={form.price}
          error={errors.price}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("price", event.target.value ? Number(event.target.value) : "")}
        />
        <FormField
          label="Год"
          type="number"
          value={form.year_created}
          error={errors.year_created}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set(
              "year_created",
              event.target.value ? Number(event.target.value) : "",
            )}
        />
        <FormField
          label="Ширина, см"
          type="number"
          slotProps={{ input: { min: 0 } }}
          value={form.width_cm}
          error={errors.width_cm}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("width_cm", event.target.value ? Number(event.target.value) : "")}
        />
        <FormField
          label="Высота, см"
          type="number"
          slotProps={{ input: { min: 0 } }}
          value={form.height_cm}
          error={errors.height_cm}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("height_cm", event.target.value ? Number(event.target.value) : "")}
        />
        <FormField
          label="Техника"
          value={form.technique}
          error={errors.technique}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("technique", event.target.value)}
        />
        <FormField
          label="Материал на русском"
          value={form.material_ru}
          error={errors.material_ru}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("material_ru", event.target.value)}
        />
        <FormField
          label="Материал на английском"
          value={form.material_en}
          error={errors.material_en}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("material_en", event.target.value)}
        />
        <FormField
          label="Жанр на русском"
          value={form.genre_ru}
          error={errors.genre_ru}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("genre_ru", event.target.value)}
        />
        <FormField
          label="Жанр на английском"
          value={form.genre_en}
          error={errors.genre_en}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("genre_en", event.target.value)}
        />
        <FormField
          label="Вес, кг"
          type="number"
          slotProps={{ input: { min: 0.01, step: 0.01 } }}
          value={form.weight_kg}
          error={errors.weight_kg}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            set("weight_kg", event.target.value ? Number(event.target.value) : "")}
        />
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Checkbox
            checked={form.is_sold}
            onChange={(event) => set("is_sold", event.target.checked)}
            label="Продано"
          />
          <Checkbox
            checked={form.is_available}
            onChange={(event) => set("is_available", event.target.checked)}
            label="Показывать на сайте"
          />
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography level="h3" sx={{ mb: 0.5 }}>
          Фотографии
        </Typography>
        <Typography level="body-sm" sx={{ color: "neutral.500", mb: 2 }}>
          Используйте кнопки со стрелками, чтобы изменить порядок.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 2,
            mb: 2,
          }}
        >
          {images.map((image, index) => (
            <Box
              key={`${image.id ?? "new"}-${image.previewUrl}`}
              sx={{
                border: "1px solid",
                borderColor: "neutral.200",
                bgcolor: "neutral.50",
                p: 1,
                borderRadius: 10,
              }}
            >
              {image.previewUrl ? (
                <Box
                  component="img"
                  src={image.previewUrl}
                  alt={`Фотография ${index + 1}`}
                  sx={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 160,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 8,
                    bgcolor: "neutral.100",
                    color: "neutral.500",
                    textAlign: "center",
                    px: 1,
                  }}
                >
                  Файл недоступен
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                <Typography level="body-xs" sx={{ flex: 1 }}>
                  Позиция {index + 1}
                </Typography>
                <Button
                  type="button"
                  size="sm"
                  variant="plain"
                  aria-label="Переместить фотографию выше"
                  disabled={index === 0}
                  onClick={() => reorderImages(index, index - 1)}
                >
                  <ArrowUpwardRoundedIcon />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="plain"
                  aria-label="Переместить фотографию ниже"
                  disabled={index === images.length - 1}
                  onClick={() => reorderImages(index, index + 1)}
                >
                  <ArrowDownwardRoundedIcon />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="plain"
                  color="danger"
                  aria-label="Удалить фотографию"
                  onClick={() => removeImage(index)}
                >
                  <DeleteOutlineRoundedIcon />
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
        <ImageDropzone multiple onFiles={addFiles} />
      </Box>
    </FormPage>
  );
};
