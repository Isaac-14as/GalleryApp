import { Box, Button, CircularProgress, Input, Typography } from "@mui/joy";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  adminApi,
  clearAdminAuth,
  getAdminAuth,
  makeAdminAuth,
  setAdminAuth,
} from "../api/adminApi";

const links = [
  ["Категории", "/admin/categories"],
  ["Картины", "/admin/artworks"],
  ["Выставки", "/admin/exhibitions"],
  ["Публикации", "/admin/publications"],
  ["Видео", "/admin/videos"],
];

type AuthState = "checking" | "authenticated" | "login";

export const AdminPage = () => {
  const [authState, setAuthState] = useState<AuthState>(
    getAdminAuth() ? "checking" : "login",
  );

  useEffect(() => {
    const auth = getAdminAuth();
    if (!auth) {
      setAuthState("login");
      return;
    }
    void adminApi
      .check(auth)
      .then(() => setAuthState("authenticated"))
      .catch(() => {
        clearAdminAuth();
        setAuthState("login");
      });
  }, []);

  if (authState === "checking") {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (authState === "login") {
    return <Login onSuccess={() => setAuthState("authenticated")} />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4efe6",
        display: { md: "grid" },
        gridTemplateColumns: { md: "260px minmax(0, 1fr)" },
      }}
    >
      <Box
        component="aside"
        sx={{
          bgcolor: "#2f2115",
          color: "white",
          p: { xs: 2, md: 3 },
          minHeight: { md: "100vh" },
          position: { md: "sticky" },
          top: 0,
          alignSelf: "start",
        }}
      >
        <Typography level="h3" sx={{ color: "white", mb: { xs: 2, md: 4 } }}>
          Управление галереей
        </Typography>
        <Box
          component="nav"
          sx={{
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            gap: 1,
            overflowX: "auto",
          }}
        >
          {links.map(([label, path]) => (
            <Box
              key={path}
              component={NavLink}
              to={path}
              sx={{
                color: "rgba(255,255,255,.76)",
                textDecoration: "none",
                borderRadius: 8,
                px: 1.5,
                py: 1,
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "rgba(255,255,255,.08)" },
                "&.active": {
                  bgcolor: "rgba(226,176,42,.16)",
                  color: "#f0c554",
                },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>
        <Button
          size="sm"
          // variant="outlined"
          color="neutral"
          onClick={() => {
            clearAdminAuth();
            setAuthState("login");
          }}
          sx={{ width: "100%", mt: 2 }}
        >
          Выйти
        </Button>
      </Box>
      <Box
        component="main"
        sx={{ width: "100%", maxWidth: 1500, mx: "auto", p: { xs: 2, md: 4 } }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

const Login = ({ onSuccess }: { onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const auth = makeAdminAuth(
      String(data.get("username")),
      String(data.get("password")),
    );
    try {
      await adminApi.check(auth);
      setAdminAuth(auth);
      onSuccess();
    } catch {
      enqueueSnackbar("Неверный логин или пароль", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#f4efe6",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={(event) => void submit(event)}
        sx={{
          width: "min(420px, 100%)",
          bgcolor: "white",
          p: 4,
          borderRadius: 16,
          boxShadow: "lg",
        }}
      >
        <Typography level="h2" sx={{ mb: 1 }}>
          Вход в админ-панель
        </Typography>
        <Typography level="body-sm" sx={{ color: "neutral.500", mb: 3 }}>
          Введите данные администратора
        </Typography>
        <Input name="username" placeholder="Логин" required sx={{ mb: 2 }} />
        <Input
          name="password"
          type="password"
          placeholder="Пароль"
          required
          sx={{ mb: 3 }}
        />
        <Button type="submit" loading={loading} fullWidth>
          Войти
        </Button>
      </Box>
    </Box>
  );
};
