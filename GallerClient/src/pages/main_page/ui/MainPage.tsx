import { Box, Typography } from "@mui/joy";
import { observer } from "mobx-react-lite";

import { BusinessCard } from "../componentes/BusinessCard";
import { useIsMobile } from "shared/hooks/isMobile";
import { mainFontStyle } from "shared/css/fonts";
import { useQuery } from "@tanstack/react-query";
import { mainApi } from "shared/api/api";
import { useEffect, useMemo } from "react";
import { showDefaultSnack } from "shared/default-snack";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { s3Api } from "shared/api";
import { CategoryListItemDTO } from "shared/api/dto/dto";
import { useLanguage } from "shared/i18n";

export const MainPage = observer(() => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const fetchCategoriesQuery = useQuery({
    queryKey: ["fetchCategoriesQuery"],
    queryFn: () => mainApi.fetchCategories(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (fetchCategoriesQuery.error) {
      console.error(fetchCategoriesQuery.error);
      showDefaultSnack(
        enqueueSnackbar,
        t("categoryLoadError"),
        "error",
      );
    }
  }, [fetchCategoriesQuery.isError, t]);

  const imgNames = useMemo(() => {
    if (!fetchCategoriesQuery?.data) return [];
    const res = fetchCategoriesQuery.data
      .filter((item) => item.img)
      .map((item) => item.img);

    return res;
  }, [fetchCategoriesQuery?.data]);

  console.log("imgNames", imgNames);

  const fetchImgUrlsQuery = useQuery({
    queryKey: ["fetchImgUrlsQuery", imgNames],
    queryFn: () =>
      s3Api.getFilesUrls(
        "categories",
        fetchCategoriesQuery.data
          .filter((item) => item.img)
          .map((item) => item.img),
      ),
    refetchOnWindowFocus: false,
    retry: false,
    enabled: imgNames.length > 0,
    // staleTime: 5 * 60 * 1000,
  });

  console.log("img", fetchImgUrlsQuery.data);

  useEffect(() => {
    if (fetchImgUrlsQuery.error) {
      console.error(fetchImgUrlsQuery.error);
      showDefaultSnack(
        enqueueSnackbar,
        t("imageLoadError"),
        "error",
      );
    }
  }, [fetchImgUrlsQuery.isError, t]);

  const imgUrls = useMemo(() => {
    if (!fetchImgUrlsQuery?.data) return null;

    const res = fetchImgUrlsQuery.data.reduce((acc, item) => {
      acc[item.object_name] = item.url;
      return acc;
    }, {});

    return res;
  }, [fetchImgUrlsQuery?.data]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
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
          height: "100%",
          bgcolor: "#E2B02A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BusinessCard />
      </Box>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#faf5e6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 8,
          gap: 4,
        }}
      >
        <Typography
          level="h2"
          sx={{
            color: "#5B3A1B",
            ...mainFontStyle,
            fontWeight: 500,
          }}
        >
          {t("chaptersTitle")}
        </Typography>

        <Box
          sx={{
            width: "70%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {fetchCategoriesQuery.data?.map((category) => {
            const imgUrl = imgUrls?.[category.img];
            return (
              <CategoryCard
                key={category.id}
                category={category}
                imgUrl={imgUrl}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
});

type CategoryCardProps = {
  category: CategoryListItemDTO;
  imgUrl?: string;
};

export const CategoryCard = observer((props: CategoryCardProps) => {
  const { category, imgUrl } = props;
  const navigate = useNavigate();
  const { localized } = useLanguage();

  return (
    <Box
      onClick={() => {
        navigate(`category/${category.slug}`);
      }}
      sx={{
        height: 350,
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          "& .category-image": {
            transform: "scale(1.1)",
          },
        },
      }}
    >
      <Box
        className="category-image"
        component="img"
        src={imgUrl}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "0.5s",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          p: 3,
          color: "white",
        }}
      >
        <Typography
          level="h3"
          sx={{
            color: "white",
            fontFamily: "serif",
          }}
        >
          {localized(category.nameRu, category.nameEn)}
        </Typography>

        {/* <Typography
          level="body-md"
          sx={{
            color: "rgba(255,255,255,0.85)",
            mt: 1,
          }}
        >
          {localized(category.descriptionRu, category.descriptionEn)}
        </Typography> */}
      </Box>
    </Box>
  );
});
