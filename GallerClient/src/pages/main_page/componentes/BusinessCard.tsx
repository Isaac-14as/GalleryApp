import { Box, Typography } from "@mui/joy";
import { observer } from "mobx-react-lite";
import { useIsMobile } from "shared/hooks/isMobile";
import PhoneIcon from "@mui/icons-material/Phone";
import { useLanguage } from "shared/i18n";

export const BusinessCard = observer(() => {
  const isMobile = useIsMobile();
  const { language, t } = useLanguage();

  return (
    <Box
      sx={{
        width: isMobile ? "100%" : "80%",
        height: isMobile ? "100%" : "80%",
        backgroundImage: "url('/imgs/background_1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "48px",
              md: "86px",
            },
            lineHeight: 0.9,
            fontWeight: 800,
            letterSpacing: "-2px",
            textAlign: "center",
          }}
        >
          {language === "ru" ? "Екатерина Латыпова" : "Ekaterina Latypova"}
        </Typography>

        <Box
          sx={{
            width: 120,
            height: 4,
            bgcolor: "#222",
            my: 4,
          }}
        />

        <Typography
          sx={{
            fontSize: {
              xs: "20px",
              md: "28px",
            },
            letterSpacing: "6px",
            textTransform: "uppercase",
            mb: 5,
          }}
        >
          {t("artist")}
        </Typography>

        <Typography
          sx={{
            fontSize: {
              xs: "22px",
              md: "36px",
            },
            fontWeight: 500,
            mb: 1,
          }}
        >
          {t("paintingsCollection")}
        </Typography>

        <Typography
          sx={{
            fontSize: {
              xs: "18px",
              md: "28px",
            },
            color: "rgba(0,0,0,0.65)",
            mb: 5,
          }}
        >
          {language === "ru" ? "Ekaterina Latypova" : "Екатерина Латыпова"}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Typography
            startDecorator={
              <PhoneIcon
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 30,
                  },
                }}
              />
            }
            sx={{
              fontSize: {
                xs: 15,
                md: 25,
              },
            }}
          >
            +7 (999) 999-99-99
          </Typography>
          <Typography
            startDecorator={
              <PhoneIcon
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 30,
                  },
                }}
              />
            }
            sx={{
              fontSize: {
                xs: 15,
                md: 25,
              },
            }}
          >
            +7 (999) 999-99-99
          </Typography>
          <Typography
            startDecorator={
              <PhoneIcon
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 30,
                  },
                }}
              />
            }
            sx={{
              fontSize: {
                xs: 15,
                md: 25,
              },
            }}
          >
            +7 (999) 999-99-99
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
