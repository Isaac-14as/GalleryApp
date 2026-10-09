import { Box, CircularProgress, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo } from "react";

import { mainApi, s3Api } from "shared/api";
import type { ExhibitionDTO } from "shared/api/dto/dto";
import { mainFontStyle } from "shared/css/fonts";
import { showDefaultSnack } from "shared/default-snack";
import { useIsMobile } from "shared/hooks/isMobile";
import { useLanguage } from "shared/i18n";

export const ExhibitionsPage = observer(() => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const exhibitionsQuery = useQuery({
    queryKey: ["exhibitions"],
    queryFn: mainApi.fetchExhibitions,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!exhibitionsQuery.error) return;

    console.error(exhibitionsQuery.error);
    showDefaultSnack(enqueueSnackbar, t("exhibitionsLoadError"), "error");
  }, [exhibitionsQuery.error, t]);

  const coverImageNames = useMemo(
    () =>
      exhibitionsQuery.data
        ?.map((exhibition) => exhibition.coverImage)
        .filter((image): image is string => Boolean(image)) ?? [],
    [exhibitionsQuery.data],
  );

  const coverImagesQuery = useQuery({
    queryKey: ["exhibitionCoverImages", coverImageNames],
    queryFn: () => s3Api.getFilesUrls("exhibitions", coverImageNames),
    enabled: coverImageNames.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const coverImageUrls = useMemo(() => {
    if (!coverImagesQuery.data) return new Map<string, string>();

    return new Map<string, string>(
      coverImagesQuery.data.map((image) => [image.object_name, image.url]),
    );
  }, [coverImagesQuery.data]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        bgcolor: "#faf5e6",
        "&::-webkit-scrollbar": { width: isMobile ? "3px" : "5px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#d12626",
          borderRadius: "10px",
        },
      }}
    >
      <Box
        component="main"
        sx={{
          width: { xs: "calc(100% - 32px)", sm: "82%", lg: "74%" },
          maxWidth: "1180px",
          minHeight: "100vh",
          mx: "auto",
          pt: { xs: "92px", md: "130px" },
          pb: { xs: 7, md: 12 },
        }}
      >
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Typography
            level="h1"
            sx={{
              ...mainFontStyle,
              color: "#5B3A1B",
              fontWeight: 400,
              fontSize: { xs: "2.4rem", md: "4rem" },
            }}
          >
            {t("exhibitionsTitle")}
          </Typography>
          <Typography
            sx={{
              maxWidth: "650px",
              mx: "auto",
              mt: 1.5,
              color: "#806a55",
              fontFamily: "serif",
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            {t("exhibitionsSubtitle")}
          </Typography>
        </Box>

        {exhibitionsQuery.isPending ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#5B3A1B" }} />
          </Box>
        ) : exhibitionsQuery.data?.length ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: { xs: 4, md: 6 },
            }}
          >
            {exhibitionsQuery.data.map((exhibition, index) => (
              <ExhibitionCard
                key={exhibition.id}
                exhibition={exhibition}
                imageUrl={
                  exhibition.coverImage
                    ? coverImageUrls.get(exhibition.coverImage)
                    : undefined
                }
                reverse={index % 2 !== 0}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: "#806a55", textAlign: "center", py: 10 }}>
            {t("exhibitionsEmpty")}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

type ExhibitionCardProps = {
  exhibition: ExhibitionDTO;
  imageUrl?: string;
  reverse: boolean;
};

const ExhibitionCard = observer(
  ({ exhibition, imageUrl, reverse }: ExhibitionCardProps) => {
    const { localized, t } = useLanguage();
    const title = localized(exhibition.titleRu, exhibition.titleEn);
    const description = localized(
      exhibition.descriptionRu,
      exhibition.descriptionEn,
    );
    const location = localized(exhibition.locationRu, exhibition.locationEn);
    const years = formatYears(exhibition.startYear, exhibition.endYear);

    return (
      <Box
        component="article"
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: imageUrl ? "minmax(0, 1.05fr) minmax(0, 1fr)" : "1fr",
          },
          bgcolor: "rgba(255, 255, 255, 0.62)",
          border: "1px solid rgba(91, 58, 27, 0.12)",
          borderRadius: { xs: "18px", md: "26px" },
          overflow: "hidden",
          boxShadow: "0 16px 45px rgba(91, 58, 27, 0.1)",
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              minHeight: { xs: "280px", md: "430px" },
              gridColumn: { md: reverse ? 2 : 1 },
              gridRow: { md: 1 },
              bgcolor: "#eee5d3",
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt={title}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            gridColumn: { md: imageUrl ? (reverse ? 1 : 2) : 1 },
            gridRow: { md: 1 },
            p: { xs: 3, sm: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            level="h2"
            sx={{
              ...mainFontStyle,
              color: "#5B3A1B",
              fontWeight: 400,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>

          {(years || location) && (
            <Box
              sx={{
                mt: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
                color: "#8a715a",
              }}
            >
              {years && (
                <Typography level="body-sm">
                  <strong>{t("years")}:</strong> {years}
                </Typography>
              )}
              {location && (
                <Typography level="body-sm">
                  <strong>{t("location")}:</strong> {location}
                </Typography>
              )}
            </Box>
          )}

          {description && (
            <Typography
              sx={{
                mt: 3,
                color: "#675544",
                fontFamily: "serif",
                fontSize: "1.05rem",
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>
    );
  },
);

const formatYears = (startYear: number | null, endYear: number | null) => {
  if (startYear && endYear && startYear !== endYear)
    return `${startYear}–${endYear}`;
  return startYear?.toString() ?? endYear?.toString() ?? "";
};
