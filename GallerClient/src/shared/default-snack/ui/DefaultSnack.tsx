import { IconButton } from "@mui/joy";
import { closeSnackbar } from "notistack";
import CloseIcon from "@mui/icons-material/Close";

export const showDefaultSnack = (
  enqueueSnackbar: any,
  text: string,
  variant: any,
  hideDuration: number = 5000,
) => {
  enqueueSnackbar(text, {
    variant,
    autoHideDuration: hideDuration,
    action: (key: any) => (
      <IconButton type="text" onClick={() => closeSnackbar(key)}>
        <CloseIcon />{" "}
      </IconButton>
    ),
  });
};
