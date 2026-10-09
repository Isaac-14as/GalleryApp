import { Box, CircularProgress, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo } from "react";

import { mainApi, s3Api } from "shared/api";
import type { PublicationDTO } from "shared/api/dto/dto";
import { mainFontStyle } from "shared/css/fonts";
import { showDefaultSnack } from "shared/default-snack";
import { useIsMobile } from "shared/hooks/isMobile";
import { useLanguage } from "shared/i18n";

export const PublicationsPage = observer(() => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const publicationsQuery = useQuery({
    queryKey: ["publications"],
    queryFn: mainApi.fetchPublications,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!publicationsQuery.error) return;

    console.error(publicationsQuery.error);
    showDefaultSnack(enqueueSnackbar, t("publicationsLoadError"), "error");
  }, [publicationsQuery.error, t]);

  const coverImageNames = useMemo(
    () =>
      publicationsQuery.data
        ?.map((publication) => publication.coverImage)
        .filter((image): image is string => Boolean(image)) ?? [],
    [publicationsQuery.data],
  );

  const coverImagesQuery = useQuery({
    queryKey: ["publicationCoverImages", coverImageNames],
    queryFn: () => s3Api.getFilesUrls("publications", coverImageNames),
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
          width: { xs: "calc(100% - 32px)", sm: "84%", lg: "74%" },
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
            {t("publicationsTitle")}
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
            {t("publicationsSubtitle")}
          </Typography>
        </Box>

        {publicationsQuery.isPending ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#5B3A1B" }} />
          </Box>
        ) : publicationsQuery.data?.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: { xs: 3, md: 4 },
              alignItems: "start",
            }}
          >
            {publicationsQuery.data.map((publication) => (
              <PublicationCard
                key={publication.id}
                publication={publication}
                imageUrl={
                  publication.coverImage
                    ? coverImageUrls.get(publication.coverImage)
                    : undefined
                }
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: "#806a55", textAlign: "center", py: 10 }}>
            {t("publicationsEmpty")}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

type PublicationCardProps = {
  publication: PublicationDTO;
  imageUrl?: string;
};

const PublicationCard = observer(
  ({ publication, imageUrl }: PublicationCardProps) => {
    const { language, localized, t } = useLanguage();
    const title = localized(publication.titleRu, publication.titleEn);
    const description = localized(
      publication.descriptionRu,
      publication.descriptionEn,
    );
    const publishedAt = publication.publishedAt?.setLocale(language).toLocaleString({
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Box
        component="article"
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.66)",
          border: "1px solid rgba(91, 58, 27, 0.12)",
          borderRadius: { xs: "18px", md: "24px" },
          overflow: "hidden",
          boxShadow: "0 14px 38px rgba(91, 58, 27, 0.1)",
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              width: "100%",
              aspectRatio: "16 / 10",
              bgcolor: "#eee5d3",
              overflow: "hidden",
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

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Typography
            level="h2"
            sx={{
              ...mainFontStyle,
              color: "#5B3A1B",
              fontWeight: 400,
              fontSize: { xs: "1.65rem", md: "2rem" },
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>

          {publishedAt && (
            <Typography level="body-sm" sx={{ mt: 1.5, color: "#8a715a" }}>
              <strong>{t("publishedAt")}:</strong> {publishedAt}
            </Typography>
          )}

          {description && (
            <Typography
              sx={{
                mt: 2.5,
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
