import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { mainApi, s3Api } from "shared/api";
import { mainFontStyle } from "shared/css/fonts";
import { ImageGallery, imgsStore } from "shared/working-with-imgs";
import { useIsMobile } from "shared/hooks/isMobile";
import { useLanguage } from "shared/i18n";

export const ArtworkPage = () => {
  const isMobile = useIsMobile();
  const { categorySlug, artworkSlug } = useParams();
  const { language, localized, t } = useLanguage();

  const categoryQuery = useQuery({
    queryKey: ["artwork-category", categorySlug],
    queryFn: () => mainApi.fetchCategoryBySlug(categorySlug!),
    enabled: Boolean(categorySlug),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const artwork = useMemo(
    () => categoryQuery.data?.artworks.find((item) => item.slug === artworkSlug),
    [artworkSlug, categoryQuery.data],
  );
  const sortedImages = useMemo(
    () => [...(artwork?.artworImages ?? [])].sort(
      (left, right) => left.sortOrder - right.sortOrder || left.id - right.id,
    ),
    [artwork],
  );
  const imageNames = useMemo(
    () => sortedImages.map((image) => image.imageUrl),
    [sortedImages],
  );
  const imagesQuery = useQuery({
    queryKey: ["artwork-images", artwork?.id, imageNames],
    queryFn: () => s3Api.getFilesUrls("artworks", imageNames),
    enabled: imageNames.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!artwork || (imageNames.length && !imagesQuery.data)) {
      imgsStore.clear();
      return;
    }
    const urlsByName = new Map(
      (imagesQuery.data ?? []).map((image) => [image.object_name, image.url]),
    );
    imgsStore.setImgs(
      sortedImages.flatMap((image) => {
        const previewUrl = urlsByName.get(image.imageUrl);
        return previewUrl
          ? [{ id: String(image.id), file: null, previewUrl }]
          : [];
      }),
    );
  }, [artwork, imageNames.length, imagesQuery.data, sortedImages]);

  useEffect(() => () => imgsStore.clear(), []);

  if (categoryQuery.isPending) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress sx={{ color: "#8a5d2f" }} />
      </Box>
    );
  }

  if (categoryQuery.isError) {
    return (
      <PageMessage>
        <Alert
          color="danger"
          endDecorator={(
            <Button
              color="danger"
              variant="soft"
              onClick={() => void categoryQuery.refetch()}
            >
              {language === "ru" ? "Повторить" : "Try again"}
            </Button>
          )}
        >
          {t("artworkLoadError")}
        </Alert>
      </PageMessage>
    );
  }

  if (!artwork) {
    return (
      <PageMessage>
        <Typography level="h2" sx={{ ...mainFontStyle, color: "#5B3A1B" }}>
          {t("artworkNotFound")}
        </Typography>
        <Button
          component={Link}
          to={`/category/${categorySlug}`}
          variant="plain"
          startDecorator={<ArrowBackRoundedIcon />}
          sx={{ mt: 2, color: "#7c542e" }}
        >
          {t("backToCategory")}
        </Button>
      </PageMessage>
    );
  }

  const title = localized(artwork.titleRu, artwork.titleEn);
  const description = localized(artwork.descriptionRu, artwork.descriptionEn);
  const categoryName = localized(
    categoryQuery.data.nameRu,
    categoryQuery.data.nameEn,
  );
  const formattedPrice = artwork.price
    ? new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(Number(artwork.price))
    : t("priceOnRequest");
  const dimensions = [artwork.widthCm, artwork.heightCm]
    .filter((value): value is string => Boolean(value))
    .join(" × ");
  const material = localized(artwork.materialRu, artwork.materialEn);
  const genre = localized(artwork.genreRu, artwork.genreEn);
  const formattedWeight = artwork.weightKg
    ? `${new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
        maximumFractionDigits: 2,
      }).format(Number(artwork.weightKg))} ${t("kilograms")}`
    : null;
  const status = artwork.isSold
    ? t("sold")
    : artwork.isAvailable
      ? t("available")
      : t("unavailable");

  return (
    <Box
      sx={{
        width: "100%",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: isMobile ? "3px" : "5px" },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#d12626",
          borderRadius: "10px",
        },
      }}
    >
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#faf5e6",
          pt: { xs: "72px", md: "100px" },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Box
          sx={{
            width: { xs: "calc(100% - 32px)", sm: "88%", xl: "78%" },
            maxWidth: 1380,
            mx: "auto",
          }}
        >
          <Button
            component={Link}
            to={`/category/${categoryQuery.data.slug}`}
            variant="plain"
            startDecorator={<ArrowBackRoundedIcon />}
            sx={{ color: "#7c542e", mb: { xs: 2, md: 3 }, px: 0 }}
          >
            {categoryName || t("backToCategory")}
          </Button>

          <Box
            component="article"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.12fr) minmax(360px, .88fr)" },
              gap: { xs: 4, lg: 7 },
              alignItems: "start",
            }}
          >
            <Box>
              {imagesQuery.isPending && imageNames.length ? (
                <Box
                  sx={{
                    minHeight: { xs: 380, md: 620 },
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#eee5d3",
                    borderRadius: { xs: 14, md: 20 },
                  }}
                >
                  <CircularProgress sx={{ color: "#8a5d2f" }} />
                </Box>
              ) : (
                <ImageGallery />
              )}
              {imagesQuery.isError && (
                <Alert color="warning" variant="soft" sx={{ mt: 1.5 }}>
                  {t("imageLoadError")}
                </Alert>
              )}
            </Box>

            <Box sx={{ pt: { lg: 1 } }}>
              <Typography
                level="body-sm"
                sx={{ color: "#9a7959", letterSpacing: "0.08em", mb: 1 }}
              >
                {categoryName}
              </Typography>
              <Typography
                component="h1"
                sx={{
                  ...mainFontStyle,
                  color: "#5B3A1B",
                  fontWeight: 400,
                  fontSize: { xs: "2.2rem", md: "3.25rem" },
                  lineHeight: 1.08,
                }}
              >
                {title}
              </Typography>

              <Chip
                variant="soft"
                sx={{
                  mt: 2.5,
                  bgcolor: artwork.isSold ? "#e7ddd0" : "#e5eadc",
                  color: artwork.isSold ? "#765f4a" : "#536044",
                }}
              >
                {status}
              </Chip>

              <Box sx={{ my: 4, borderTop: "1px solid rgba(91,58,27,.16)" }} />

              <Typography level="body-sm" sx={{ color: "#8a715a", mb: 0.5 }}>
                {t("price")}
              </Typography>
              <Typography
                sx={{
                  ...mainFontStyle,
                  color: artwork.isSold ? "#8a715a" : "#5B3A1B",
                  fontSize: { xs: "1.65rem", md: "2rem" },
                }}
              >
                {formattedPrice}
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography
                  level="h3"
                  sx={{ ...mainFontStyle, color: "#5B3A1B", mb: 2 }}
                >
                  {t("characteristics")}
                </Typography>
                <Box
                  sx={{
                    borderTop: "1px solid rgba(91,58,27,.13)",
                    "& > div": {
                      borderBottom: "1px solid rgba(91,58,27,.13)",
                    },
                  }}
                >
                  {artwork.yearCreated && (
                    <DetailRow label={t("yearCreated")} value={artwork.yearCreated} />
                  )}
                  {dimensions && (
                    <DetailRow
                      label={t("dimensions")}
                      value={`${dimensions} ${t("centimeters")}`}
                    />
                  )}
                  {artwork.technique && (
                    <DetailRow label={t("technique")} value={artwork.technique} />
                  )}
                  {material && (
                    <DetailRow label={t("material")} value={material} />
                  )}
                  {formattedWeight && (
                    <DetailRow label={t("weight")} value={formattedWeight} />
                  )}
                  {genre && <DetailRow label={t("genre")} value={genre} />}
                </Box>
              </Box>
            </Box>
          </Box>

          {description && (
            <Box
              component="section"
              sx={{
                mt: { xs: 6, md: 9 },
                pt: { xs: 4, md: 5 },
                borderTop: "1px solid rgba(91,58,27,.18)",
                maxWidth: 940,
              }}
            >
              <Typography
                level="h2"
                sx={{ ...mainFontStyle, color: "#5B3A1B", mb: 2.5 }}
              >
                {t("description")}
              </Typography>
              <Typography
                sx={{
                  color: "#675544",
                  fontFamily: "serif",
                  fontSize: { xs: "1rem", md: "1.125rem" },
                  lineHeight: 1.85,
                  whiteSpace: "pre-line",
                }}
              >
                {description}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "minmax(120px, .8fr) minmax(0, 1.2fr)",
      gap: 2,
      py: 1.5,
    }}
  >
    <Typography level="body-sm" sx={{ color: "#8a715a" }}>
      {label}
    </Typography>
    <Typography level="body-sm" sx={{ color: "#4f3b2a" }}>
      {value}
    </Typography>
  </Box>
);

const PageMessage = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      bgcolor: "#faf5e6",
      pt: { xs: "100px", md: "140px" },
      px: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Box sx={{ width: "min(620px, 100%)", textAlign: "center" }}>
      {children}
    </Box>
  </Box>
);
