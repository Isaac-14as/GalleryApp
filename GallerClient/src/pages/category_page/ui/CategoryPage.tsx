import { Box, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mainApi, s3Api } from "shared/api";
import { showDefaultSnack } from "shared/default-snack";

import { mainFontStyle } from "shared/css/fonts";
import { ArtworkDTO } from "shared/api/dto/dto";
import { useIsMobile } from "shared/hooks/isMobile";
import { useLanguage } from "shared/i18n";

export const CategoryPage = observer(() => {
  const { categorySlug } = useParams();
  const isMobile = useIsMobile();
  const { language, localized, t } = useLanguage();

  const fetchCategoryBySlugQuery = useQuery({
    queryKey: ["fetchCategoryBySlugQuery"],
    queryFn: () => mainApi.fetchCategoryBySlug(categorySlug),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchCategoryBySlugQuery.error) {
      console.error(fetchCategoryBySlugQuery.error);
      showDefaultSnack(enqueueSnackbar, t("categoryDetailsLoadError"), "error");
    }
  }, [fetchCategoryBySlugQuery.isError, t]);

  const fetchImgUrlsQuery = useQuery({
    queryKey: ["fetchImgUrlsQuery"],
    queryFn: () =>
      s3Api.getFilesUrls("categories", [fetchCategoryBySlugQuery.data.img]),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!fetchCategoryBySlugQuery.data?.img,
    // staleTime: 5 * 60 * 1000,
  });

  const allArtworksImgs = useMemo(() => {
    if (!fetchCategoryBySlugQuery.data) return null;
    const res = [];
    fetchCategoryBySlugQuery.data.artworks.map((artwork) => {
      const firstImg = artwork?.artworImages.find(
        (item) => item.sortOrder === 0,
      );
      if (firstImg) {
        res.push(firstImg.imageUrl);
      }
    });

    if (res.length === 0) {
      return null;
    }

    return res;
  }, [fetchCategoryBySlugQuery.dataUpdatedAt]);

  const fetchAllImagePreviewQuery = useQuery({
    queryKey: ["fetchAllImagePreviewQuery"],
    queryFn: () => s3Api.getFilesUrls("artworks", allArtworksImgs),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: !!allArtworksImgs,
    // staleTime: 5 * 60 * 1000,
  });

  return (
    <Box
      sx={{
        width: "100%",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: isMobile ? "3px" : "5px",
        },

        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },

        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#d12626",
          borderRadius: "10px",
        },

        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#d12626",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#faf5e6",
          pt: { xs: "72px", md: "100px" },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: { xs: "calc(100% - 32px)", sm: "82%", lg: "70%" },
            maxWidth: "1180px",
            m: "0 auto",
            gap: { xs: 2, md: 3 },
          }}
        >
          <Typography
            level="h2"
            sx={{
              ...mainFontStyle,
              color: "#5B3A1B",
              fontWeight: 400,
              textAlign: "center",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            {localized(
              fetchCategoryBySlugQuery.data?.nameRu,
              fetchCategoryBySlugQuery.data?.nameEn,
            )}
          </Typography>
          <Box
            sx={{
              width: "100%",
              m: "0 auto",
              aspectRatio: { xs: "4/3", md: "2/1" },
              overflow: "hidden",
              borderRadius: { xs: "16px", md: "24px" },
              bgcolor: "#eee5d3",
              boxShadow: "0 18px 50px rgba(91, 58, 27, 0.12)",
            }}
          >
            <Box
              className="category-image"
              component="img"
              src={fetchImgUrlsQuery.data?.[0].url}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "0.5s",
              }}
            />
          </Box>
          <Typography
            sx={{
              maxWidth: "900px",
              mx: "auto",
              color: "#6f5945",
              fontFamily: "serif",
              fontStyle: "italic",
              lineHeight: 1.75,
              textAlign: "center",
              fontSize: { xs: "1rem", md: "1.125rem" },
            }}
          >
            {localized(
              fetchCategoryBySlugQuery.data?.descriptionRu,
              fetchCategoryBySlugQuery.data?.descriptionEn,
            )}
          </Typography>

          <Box sx={{ mt: { xs: 5, md: 8 } }}>
            <Typography
              level="h2"
              sx={{
                ...mainFontStyle,
                color: "#5B3A1B",
                fontWeight: 400,
                textAlign: "center",
                mb: { xs: 3, md: 4 },
              }}
            >
              {t("artworks")}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: { xs: 3, md: 4 },
              }}
            >
              {fetchCategoryBySlugQuery.data?.artworks.map((artwork) => {
                const imagePreviewName = artwork.artworImages?.find(
                  (item) => item.sortOrder === 0,
                );
                const imagePreview = fetchAllImagePreviewQuery.data?.find(
                  (item) => item.object_name === imagePreviewName?.imageUrl,
                );

                const imgUrl = imagePreview?.url;

                return (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    imagePreview={imgUrl}
                    language={language}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

type ArtworkCardProps = {
  artwork: ArtworkDTO;
  imagePreview?: string;
  language: "ru" | "en";
};

const ArtworkCard = observer((props: ArtworkCardProps) => {
  const { artwork, imagePreview, language } = props;
  const navigate = useNavigate();
  const { localized, t } = useLanguage();

  const formattedPrice = artwork.price
    ? new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(Number(artwork.price))
    : null;

  const status = artwork.isSold
    ? t("sold")
    : artwork.isAvailable
      ? t("available")
      : t("unavailable");

  return (
    <Box
      onClick={() => {
        navigate(`${artwork.slug}`);
      }}
      component="article"
      sx={{
        cursor: "pointer",
        minWidth: 0,
        bgcolor: "rgba(255, 255, 255, 0.62)",
        border: "1px solid rgba(91, 58, 27, 0.12)",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(91, 58, 27, 0.08)",
        transition: "transform 250ms ease, box-shadow 250ms ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 18px 42px rgba(91, 58, 27, 0.16)",
          "& .artwork-image": { transform: "scale(1.035)" },
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          aspectRatio: "4 / 5",
          position: "relative",
          overflow: "hidden",
          bgcolor: "#eee5d3",
        }}
      >
        {imagePreview ? (
          <Box
            className="artwork-image"
            component="img"
            src={imagePreview}
            alt={localized(artwork.titleRu, artwork.titleEn)}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 500ms ease",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#9a846e",
              fontFamily: "serif",
            }}
          >
            {t("imagePreparing")}
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            px: 1.25,
            py: 0.55,
            borderRadius: "999px",
            bgcolor: artwork.isSold
              ? "rgba(91, 58, 27, 0.88)"
              : artwork.isAvailable
                ? "rgba(250, 245, 230, 0.92)"
                : "rgba(110, 104, 96, 0.88)",
            color: artwork.isAvailable && !artwork.isSold ? "#5B3A1B" : "white",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            backdropFilter: "blur(6px)",
          }}
        >
          {status}
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        <Typography
          level="h3"
          sx={{
            ...mainFontStyle,
            color: "#5B3A1B",
            fontWeight: 400,
            fontSize: "1.5rem",
            lineHeight: 1.25,
          }}
        >
          {localized(artwork.titleRu, artwork.titleEn)}
        </Typography>

        <Typography
          level="body-sm"
          sx={{ mt: 1, color: "#8a715a", lineHeight: 1.5 }}
        >
          {[
            `${artwork.widthCm} × ${artwork.heightCm} ${language === "ru" ? "см" : "cm"}`,
            artwork.technique,
            artwork.yearCreated,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Typography>

        {/* {localized(artwork.descriptionRu, artwork.descriptionEn) && (
          <Typography
            level="body-sm"
            sx={{
              mt: 1.5,
              color: "#675544",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {localized(artwork.descriptionRu, artwork.descriptionEn)}
          </Typography>
        )} */}

        {formattedPrice && (
          <Typography
            sx={{
              mt: 2,
              color: artwork.isSold ? "#9a846e" : "#5B3A1B",
              fontFamily: "serif",
              fontSize: "1.125rem",
              fontWeight: 600,
            }}
          >
            {formattedPrice}
          </Typography>
        )}
      </Box>
    </Box>
  );
});
