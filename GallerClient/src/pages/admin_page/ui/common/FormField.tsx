import { Box, Input, Textarea, Typography } from "@mui/joy";
import type { InputProps, TextareaProps } from "@mui/joy";

type FormFieldProps = {
  label: string;
  error?: string;
  textarea?: boolean;
} & (Omit<InputProps, "error"> | Omit<TextareaProps, "error">);

export const FormField = ({
  label,
  error,
  textarea,
  ...props
}: FormFieldProps) => (
  <Box>
    <Typography level="body-sm" sx={{ mb: 0.5 }}>
      {label}
    </Typography>
    {textarea ? (
      <Textarea
        minRows={4}
        error={Boolean(error)}
        {...(props as TextareaProps)}
      />
    ) : (
      <Input error={Boolean(error)} {...(props as InputProps)} />
    )}
    {error && (
      <Typography level="body-xs" color="danger" sx={{ mt: 0.5 }}>
        {error}
      </Typography>
    )}
  </Box>
);
