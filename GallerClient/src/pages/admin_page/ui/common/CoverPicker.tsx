import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Box, Button, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { s3Api } from "shared/api";
import type { AdminEntity, StagedImage } from "../../model/types";
import { ImageDropzone } from "./ImageDropzone";

type CoverPickerProps = {
  service: AdminEntity;
  value: StagedImage | null;
  onChange: (value: StagedImage | null) => void;
};

export const CoverPicker = ({ service, value, onChange }: CoverPickerProps) => {
  const remoteImage = useQuery({
    queryKey: ["admin-cover", service, value?.objectName],
    queryFn: () => s3Api.getFilesUrls(service, [value!.objectName!]),
    enabled: Boolean(value?.objectName && !value.file),
    retry: false,
  });

  useEffect(() => {
    const previewUrl = value?.file ? value.previewUrl : null;
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [value]);

  const preview = value?.file
    ? value.previewUrl
    : remoteImage.data?.[0]?.url;

  const setFile = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    onChange({ file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <Box>
      <Typography level="title-md" sx={{ mb: 1 }}>
        Изображение
      </Typography>
      {preview && (
        <Box
          component="img"
          src={preview}
          alt="Текущее изображение"
          sx={{
            display: "block",
            width: 280,
            maxWidth: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 10,
            mb: 1.5,
          }}
        />
      )}
      {value && !preview && !remoteImage.isPending && (
        <Typography color="warning" level="body-sm" sx={{ mb: 1.5 }}>
          Файл изображения не найден. Можно выбрать новый или убрать его.
        </Typography>
      )}
      <ImageDropzone onFiles={setFile} />
      {value && (
        <Button
          color="danger"
          variant="soft"
          startDecorator={<DeleteOutlineRoundedIcon />}
          onClick={() => onChange(null)}
          sx={{ mt: 1.5 }}
        >
          Убрать изображение
        </Button>
      )}
    </Box>
  );
};
