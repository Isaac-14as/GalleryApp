import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Button, Typography } from "@mui/joy";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type FormPageProps = {
  title: string;
  saving: boolean;
  onSubmit: () => void;
  children: ReactNode;
};

export const FormPage = ({
  title,
  saving,
  onSubmit,
  children,
}: FormPageProps) => {
  const navigate = useNavigate();

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      sx={{
        bgcolor: "white",
        borderRadius: 16,
        p: { xs: 2.5, md: 4 },
        boxShadow: "sm",
      }}
    >
      <Button
        type="button"
        variant="plain"
        color="neutral"
        startDecorator={<ArrowBackRoundedIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Назад к списку
      </Button>
      <Typography level="h2" sx={{ mb: 3 }}>
        {title}
      </Typography>
      {children}
      <Button type="submit" loading={saving} sx={{ mt: 4 }}>
        Сохранить изменения
      </Button>
    </Box>
  );
};
