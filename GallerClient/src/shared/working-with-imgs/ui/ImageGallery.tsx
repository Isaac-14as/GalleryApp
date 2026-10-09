import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import {
  Box,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { AnimatePresence, motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "shared/i18n";
import { imgsStore } from "../models/ImgsStore";

type AnimationDirection = "left" | "right";

const imageVariants = {
  enter: (direction: AnimationDirection) => ({
    x: direction === "right" ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: AnimationDirection) => ({
    x: direction === "right" ? -80 : 80,
    opacity: 0,
  }),
};

export const ImageGallery = observer(() => {
  const { imgs } = imgsStore;
  const { t } = useLanguage();
  const direction = useRef<AnimationDirection>("right");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const images = imgs.filter((image) => Boolean(image.previewUrl));
  const currentImage = images[activeIndex];
  const firstImageId = images[0]?.id;

  useEffect(() => {
    setActiveIndex(0);
  }, [firstImageId, images.length]);

  const selectImage = (index: number) => {
    direction.current = index > activeIndex ? "right" : "left";
    setActiveIndex(index);
  };

  const showNext = useCallback(() => {
    if (images.length < 2) return;
    direction.current = "right";
    setActiveIndex((index) => (index + 1) % images.length);
  }, [images.length]);

  const showPrevious = useCallback(() => {
    if (images.length < 2) return;
    direction.current = "left";
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, showNext, showPrevious]);

  if (!currentImage) {
    return (
      <Box
        sx={{
          minHeight: { xs: 360, md: 560 },
          display: "grid",
          placeItems: "center",
          bgcolor: "#eee5d3",
          borderRadius: { xs: 14, md: 20 },
          color: "#8a715a",
        }}
      >
        <Typography>{t("noImages")}</Typography>
      </Box>
    );
  }

  const navigationButtonStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    bgcolor: "rgba(250, 245, 230, 0.9)",
    color: "#5B3A1B",
    boxShadow: "sm",
    "&:hover": { bgcolor: "#faf5e6" },
  } as const;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: { xs: 380, sm: 500, md: 620 },
          overflow: "hidden",
          bgcolor: "#eee5d3",
          borderRadius: { xs: 14, md: 20 },
          boxShadow: "0 18px 50px rgba(91, 58, 27, 0.12)",
        }}
      >
        <AnimatePresence mode="wait" custom={direction.current}>
          <Box
            key={currentImage.id}
            component={motion.img}
            src={currentImage.previewUrl ?? undefined}
            alt=""
            custom={direction.current}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeOut" }}
            onClick={() => setIsFullscreen(true)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              cursor: "zoom-in",
            }}
          />
        </AnimatePresence>

        <IconButton
          aria-label={t("openFullscreen")}
          onClick={() => setIsFullscreen(true)}
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            bgcolor: "rgba(250, 245, 230, 0.9)",
            color: "#5B3A1B",
          }}
        >
          <ZoomInRoundedIcon />
        </IconButton>

        {images.length > 1 && (
          <>
            <IconButton
              aria-label={t("previousImage")}
              onClick={showPrevious}
              sx={{ ...navigationButtonStyle, left: 12 }}
            >
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton
              aria-label={t("nextImage")}
              onClick={showNext}
              sx={{ ...navigationButtonStyle, right: 12 }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </>
        )}
      </Box>

      {images.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1.5,
            pb: 0.5,
            overflowX: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {images.map((image, index) => (
            <Box
              key={image.id}
              component="button"
              type="button"
              aria-label={`${t("imageNumber")} ${index + 1}`}
              onClick={() => selectImage(index)}
              sx={{
                width: 78,
                height: 92,
                flex: "0 0 auto",
                p: 0,
                overflow: "hidden",
                borderRadius: 8,
                border: "2px solid",
                borderColor: index === activeIndex ? "#8a5d2f" : "transparent",
                bgcolor: "#eee5d3",
                cursor: "pointer",
                opacity: index === activeIndex ? 1 : 0.68,
                transition: "opacity 160ms ease, border-color 160ms ease",
                "&:hover": { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={image.previewUrl ?? undefined}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      )}

      <Modal open={isFullscreen} onClose={() => setIsFullscreen(false)}>
        <ModalDialog
          layout="fullscreen"
          sx={{
            bgcolor: "rgba(25, 18, 12, 0.96)",
            border: 0,
            borderRadius: 0,
            p: { xs: 2, md: 4 },
            display: "grid",
            placeItems: "center",
          }}
        >
          <ModalClose
            aria-label={t("close")}
            sx={{ color: "white", top: 18, right: 18 }}
          />
          <Box
            component="img"
            src={currentImage.previewUrl ?? undefined}
            alt=""
            sx={{
              maxWidth: "calc(100vw - 48px)",
              maxHeight: "calc(100vh - 48px)",
              objectFit: "contain",
            }}
          />
          {images.length > 1 && (
            <>
              <IconButton
                aria-label={t("previousImage")}
                onClick={showPrevious}
                sx={{ ...navigationButtonStyle, left: { xs: 8, md: 24 } }}
              >
                <ChevronLeftRoundedIcon />
              </IconButton>
              <IconButton
                aria-label={t("nextImage")}
                onClick={showNext}
                sx={{ ...navigationButtonStyle, right: { xs: 8, md: 24 } }}
              >
                <ChevronRightRoundedIcon />
              </IconButton>
            </>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
});
