import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import { Box, Button, Typography } from "@mui/joy";
import { useState } from "react";

type ImageDropzoneProps = {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export const ImageDropzone = ({ multiple = false, onFiles }: ImageDropzoneProps) => {
  const [dragging, setDragging] = useState(false);

  const selectFiles = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length) onFiles(multiple ? images : images.slice(0, 1));
  };

  return (
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
        selectFiles(Array.from(event.dataTransfer.files));
      }}
      sx={{
        border: "2px dashed",
        borderColor: dragging ? "primary.500" : "neutral.300",
        bgcolor: dragging ? "primary.50" : "neutral.50",
        borderRadius: 12,
        px: 3,
        py: 2.5,
        textAlign: "center",
        transition: "0.15s ease",
      }}
    >
      <Typography level="body-sm" sx={{ mb: 1 }}>
        Перетащите {multiple ? "изображения" : "изображение"} сюда
      </Typography>
      <Button
        component="label"
        variant="soft"
        startDecorator={<AddPhotoAlternateRoundedIcon />}
      >
        Выбрать {multiple ? "файлы" : "файл"}
        <input
          hidden
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(event) => {
            selectFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </Button>
    </Box>
  );
};
