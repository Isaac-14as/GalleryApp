import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VideoLibraryRoundedIcon from "@mui/icons-material/VideoLibraryRounded";
import { Box, Button, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { s3Api } from "shared/api";
import type { StagedFile } from "../../model/types";

type VideoFilePickerProps = {
  value: StagedFile | null;
  error?: string;
  onChange: (value: StagedFile | null) => void;
};

export const VideoFilePicker = ({
  value,
  error,
  onChange,
}: VideoFilePickerProps) => {
  const [dragging, setDragging] = useState(false);
  const remoteVideo = useQuery({
    queryKey: ["admin-video-file", value?.objectName],
    queryFn: () => s3Api.getFilesUrls("videos", [value!.objectName!]),
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
    : remoteVideo.data?.[0]?.url;

  const selectFile = (files: File[]) => {
    const file = files.find((item) => item.type.startsWith("video/"));
    if (!file) return;
    onChange({ file, previewUrl: URL.createObjectURL(file) });
  };

  return (
    <Box>
      <Typography level="title-md" sx={{ mb: 1 }}>
        Видеофайл *
      </Typography>

      {preview && (
        <Box
          component="video"
          src={preview}
          controls
          preload="metadata"
          sx={{
            display: "block",
            width: 560,
            maxWidth: "100%",
            aspectRatio: "16 / 9",
            bgcolor: "#17120e",
            borderRadius: 10,
            mb: 1.5,
          }}
        />
      )}

      {value && !preview && !remoteVideo.isPending && (
        <Typography color="warning" level="body-sm" sx={{ mb: 1.5 }}>
          Видеофайл не найден. Выберите новый файл.
        </Typography>
      )}

      <Box
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          selectFile(Array.from(event.dataTransfer.files));
        }}
        sx={{
          border: "2px dashed",
          borderColor: error
            ? "danger.500"
            : dragging
              ? "primary.500"
              : "neutral.300",
          bgcolor: dragging ? "primary.50" : "neutral.50",
          borderRadius: 12,
          px: 3,
          py: 2.5,
          textAlign: "center",
        }}
      >
        <Typography level="body-sm" sx={{ mb: 1 }}>
          Перетащите видео сюда или выберите файл
        </Typography>
        <Button
          component="label"
          variant="soft"
          startDecorator={<VideoLibraryRoundedIcon />}
        >
          Выбрать видео
          <input
            hidden
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(event) => {
              selectFile(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
        </Button>
      </Box>

      {error && (
        <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}

      {value && (
        <Button
          color="danger"
          variant="soft"
          startDecorator={<DeleteOutlineRoundedIcon />}
          onClick={() => onChange(null)}
          sx={{ mt: 1.5 }}
        >
          Убрать видео
        </Button>
      )}
    </Box>
  );
};
