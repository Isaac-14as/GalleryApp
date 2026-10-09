import { Box, CircularProgress, Typography } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo } from "react";

import { mainApi, s3Api } from "shared/api";
import type { VideoDTO } from "shared/api/dto/dto";
import { mainFontStyle } from "shared/css/fonts";
import { showDefaultSnack } from "shared/default-snack";
import { useIsMobile } from "shared/hooks/isMobile";
import { useLanguage } from "shared/i18n";

export const VideoPage = observer(() => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const videosQuery = useQuery({
    queryKey: ["videos"],
    queryFn: mainApi.fetchVideos,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!videosQuery.error) return;
    console.error(videosQuery.error);
    showDefaultSnack(enqueueSnackbar, t("videosLoadError"), "error");
  }, [videosQuery.error, t]);

  const fileNames = useMemo(
    () =>
      Array.from(
        new Set(
          videosQuery.data?.flatMap((video) =>
            [video.videoUrl, video.coverImage].filter(
              (name): name is string => Boolean(name),
            ),
          ) ?? [],
        ),
      ),
    [videosQuery.data],
  );

  const filesQuery = useQuery({
    queryKey: ["videoFiles", fileNames],
    queryFn: () => s3Api.getFilesUrls("videos", fileNames),
    enabled: fileNames.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const fileUrls = useMemo(
    () =>
      new Map(
        (filesQuery.data ?? []).flatMap((file) =>
          file.url ? [[file.object_name, file.url] as const] : [],
        ),
      ),
    [filesQuery.data],
  );

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
            {t("videosTitle")}
          </Typography>
          <Typography
            sx={{
              maxWidth: "680px",
              mx: "auto",
              mt: 1.5,
              color: "#806a55",
              fontFamily: "serif",
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            {t("videosSubtitle")}
          </Typography>
        </Box>

        {videosQuery.isPending ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 12 }}>
            <CircularProgress sx={{ color: "#5B3A1B" }} />
          </Box>
        ) : videosQuery.data?.length ? (
          <Box sx={{ display: "grid", gap: { xs: 4, md: 6 } }}>
            {videosQuery.data.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                videoUrl={fileUrls.get(video.videoUrl)}
                coverUrl={
                  video.coverImage
                    ? fileUrls.get(video.coverImage)
                    : undefined
                }
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ color: "#806a55", textAlign: "center", py: 10 }}>
            {t("videosEmpty")}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

type VideoCardProps = {
  video: VideoDTO;
  videoUrl?: string;
  coverUrl?: string;
};

const VideoCard = observer(({ video, videoUrl, coverUrl }: VideoCardProps) => {
  const { localized, t } = useLanguage();
  const title = localized(video.titleRu, video.titleEn);
  const description = localized(video.descriptionRu, video.descriptionEn);

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
      <Box sx={{ aspectRatio: "16 / 9", bgcolor: "#211a14" }}>
        {videoUrl ? (
          <Box
            component="video"
            controls
            preload="metadata"
            poster={coverUrl}
            aria-label={title}
            sx={{ width: "100%", height: "100%", display: "block" }}
          >
            <source src={videoUrl} />
            {t("videoUnavailable")}
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "rgba(255, 255, 255, 0.72)",
              backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Typography sx={{ color: "inherit" }}>
              {t("videoUnavailable")}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Typography
          level="h2"
          sx={{
            ...mainFontStyle,
            color: "#5B3A1B",
            fontWeight: 400,
            fontSize: { xs: "1.65rem", md: "2.15rem" },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              mt: 2,
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
});
