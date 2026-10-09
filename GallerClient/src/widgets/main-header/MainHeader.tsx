import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/joy";
import MenuIcon from "@mui/icons-material/Menu";
import { useLanguage } from "shared/i18n";

export const MainHeader = observer(() => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const links = [
    // {
    //   title: t("gallery"),
    //   path: "/gallery",
    // },
    {
      title: t("biography"),
      path: "/biography",
    },
    {
      title: t("exhibitions"),
      path: "/exhibitions",
    },
    {
      title: t("publications"),
      path: "/publications",
    },
    {
      title: t("video"),
      path: "/video",
    },
  ];

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,

          width: "100%",
          height: {
            xs: "60px",
            md: "80px",
          },

          px: {
            xs: 2,
            md: 6,
          },

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          zIndex: 100,

          background:
            "linear-gradient(180deg,rgba(45,30,15,0.7) 0%,rgba(45,30,15,0.35) 100%,transparent 100%)",

          color: "white",
        }}
      >
        {/* Мобильное меню */}
        <Box
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
          }}
        >
          <IconButton color="neutral" onClick={() => setOpen(true)}>
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
        </Box>

        {/* Домой */}
        <LinkBox title={t("home")} path="/" fontSize="22px" />

        {/* Desktop меню */}
        <Box
          sx={{
            display: {
              xs: "none",
              md: "flex",
            },

            gap: 4,
            alignItems: "center",
          }}
        >
          {links.map((link) => (
            <LinkBox key={link.path} title={link.title} path={link.path} />
          ))}
          <LanguageSwitch language={language} setLanguage={setLanguage} />
        </Box>

        <Box sx={{ display: { xs: "block", md: "none" } }}>
          <LanguageSwitch language={language} setLanguage={setLanguage} />
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          content: {
            sx: {
              backgroundColor: "#2b1b0d",
              color: "white",
              width: "280px",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 24,
              fontFamily: "serif",
              mb: 3,
            }}
          >
            {t("menu")}
          </Typography>

          {links.map((link) => (
            <Box
              key={link.path}
              onClick={() => {
                setOpen(false);
                navigate(link.path);
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontSize: 20,
                }}
              >
                {link.title}
              </Typography>
            </Box>
          ))}
          <LanguageSwitch language={language} setLanguage={setLanguage} />
        </Box>
      </Drawer>
    </>
  );
});

type LanguageSwitchProps = {
  language: "ru" | "en";
  setLanguage: (language: "ru" | "en") => void;
};

const LanguageSwitch = ({ language, setLanguage }: LanguageSwitchProps) => (
  <Box
    sx={{
      display: "flex",
      border: "1px solid rgba(255,255,255,0.65)",
      borderRadius: "999px",
      p: "2px",
    }}
  >
    {(["ru", "en"] as const).map((item) => (
      <Button
        key={item}
        size="sm"
        variant={language === item ? "solid" : "plain"}
        onClick={() => setLanguage(item)}
        sx={{
          minWidth: "38px",
          borderRadius: "999px",
          color: language === item ? "#5B3A1B" : "white",
          bgcolor: language === item ? "#E2B02A" : "transparent",
          "&:hover": {
            bgcolor: language === item ? "#E2B02A" : "rgba(255,255,255,0.15)",
          },
        }}
      >
        {item.toUpperCase()}
      </Button>
    ))}
  </Box>
);

type Props = {
  title: string;
  path: string;
  fontSize?: string;
};

const LinkBox = observer((props: Props) => {
  const { title, path, fontSize = "18px" } = props;

  const navigate = useNavigate();

  return (
    <Box
      key={path}
      onClick={() => navigate(path)}
      sx={{
        cursor: "pointer",
        position: "relative",

        fontSize: fontSize,
        letterSpacing: "0.5px",

        transition: "0.3s",

        "&:after": {
          content: '""',
          position: "absolute",
          bottom: -8,
          left: 0,

          width: 0,
          height: "2px",
          backgroundColor: "#E2B02A",

          transition: "0.3s",
        },

        "&:hover": {
          color: "#E2B02A",

          "&:after": {
            width: "100%",
          },
        },
      }}
    >
      {title}
    </Box>
  );
});
