import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { SnackbarProvider } from "notistack";
import theme from "./theme";

import { Router } from "./router";
// import "./styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "shared/i18n";

export const App = () => {
  const queryClient = new QueryClient();

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
      <CssVarsProvider
        defaultMode="light"
        modeStorageKey="color-scheme"
        theme={theme}
      >
        <SnackbarProvider maxSnack={3}>
          <CssBaseline />
          <Router />
          {/* <ConfirmationModal2 /> */}
        </SnackbarProvider>
      </CssVarsProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
};
