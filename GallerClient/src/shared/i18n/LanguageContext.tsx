import { createContext, useEffect, useMemo, useState } from "react";

export type Language = "ru" | "en";

type TranslationKey =
  | "home" | "gallery" | "biography" | "exhibitions" | "publications" | "video"
  | "menu" | "categoryLoadError" | "imageLoadError" | "categoryDetailsLoadError"
  | "chaptersTitle" | "artworks" | "sold" | "available" | "unavailable"
  | "imagePreparing" | "artist" | "paintingsCollection"
  | "exhibitionsTitle" | "exhibitionsSubtitle" | "exhibitionsEmpty"
  | "exhibitionsLoadError" | "location" | "years"
  | "publicationsTitle" | "publicationsSubtitle" | "publicationsEmpty"
  | "publicationsLoadError" | "publishedAt"
  | "videosTitle" | "videosSubtitle" | "videosEmpty" | "videosLoadError"
  | "videoUnavailable"
  | "artworkLoadError" | "artworkNotFound" | "backToCategory"
  | "description" | "characteristics" | "yearCreated" | "dimensions"
  | "technique" | "material" | "weight" | "genre"
  | "price" | "priceOnRequest" | "centimeters" | "kilograms"
  | "noImages" | "previousImage" | "nextImage" | "openFullscreen"
  | "close" | "imageNumber";

const translations: Record<Language, Record<TranslationKey, string>> = {
  ru: {
    home: "На главную", gallery: "Галерея", biography: "Биография", exhibitions: "Выставки", publications: "Публикации", video: "Видео", menu: "Меню",
    categoryLoadError: "Не удалось получить категории", imageLoadError: "Ошибка при получении изображений", categoryDetailsLoadError: "Не удалось получить полную информацию о категории",
    chaptersTitle: "12 глав с темами славянской живописи", artworks: "Картины", sold: "Продано", available: "В наличии", unavailable: "Недоступно", imagePreparing: "Изображение отсутствует", artist: "Художник", paintingsCollection: "Коллекция картин",
    exhibitionsTitle: "Выставки", exhibitionsSubtitle: "Проекты, в которых представлены работы художника", exhibitionsEmpty: "Информация о выставках скоро появится", exhibitionsLoadError: "Не удалось получить выставки", location: "Место", years: "Годы",
    publicationsTitle: "Публикации", publicationsSubtitle: "Книги и авторские издания о живописи и творчестве", publicationsEmpty: "Информация о публикациях скоро появится", publicationsLoadError: "Не удалось получить публикации", publishedAt: "Опубликовано",
    videosTitle: "Видео", videosSubtitle: "Фильмы о творчестве, мастерской и процессе создания картин", videosEmpty: "Видео скоро появятся", videosLoadError: "Не удалось получить видео", videoUnavailable: "Видео временно недоступно",
    artworkLoadError: "Не удалось получить информацию о картине", artworkNotFound: "Картина не найдена", backToCategory: "Вернуться к категории",
    description: "Описание", characteristics: "Характеристики", yearCreated: "Год создания", dimensions: "Размер", technique: "Техника", material: "Материал", weight: "Вес", genre: "Жанр", price: "Цена", priceOnRequest: "Цена по запросу", centimeters: "см", kilograms: "кг",
    noImages: "У картины пока нет изображений", previousImage: "Предыдущее изображение", nextImage: "Следующее изображение", openFullscreen: "Открыть изображение", close: "Закрыть", imageNumber: "Изображение",
  },
  en: {
    home: "Home", gallery: "Gallery", biography: "Biography", exhibitions: "Exhibitions", publications: "Publications", video: "Video", menu: "Menu",
    categoryLoadError: "Unable to load categories", imageLoadError: "Unable to load images", categoryDetailsLoadError: "Unable to load category details",
    chaptersTitle: "12 chapters of Slavic painting", artworks: "Artworks", sold: "Sold", available: "Available", unavailable: "Unavailable", imagePreparing: "Image is being prepared", artist: "Artist", paintingsCollection: "Collection of paintings",
    exhibitionsTitle: "Exhibitions", exhibitionsSubtitle: "Projects featuring the artist's work", exhibitionsEmpty: "Exhibition information will be available soon", exhibitionsLoadError: "Unable to load exhibitions", location: "Location", years: "Years",
    publicationsTitle: "Publications", publicationsSubtitle: "Books and authored editions about painting and art", publicationsEmpty: "Publication information will be available soon", publicationsLoadError: "Unable to load publications", publishedAt: "Published",
    videosTitle: "Video", videosSubtitle: "Films about the artist, her studio, and the painting process", videosEmpty: "Videos will be available soon", videosLoadError: "Unable to load videos", videoUnavailable: "Video is temporarily unavailable",
    artworkLoadError: "Unable to load artwork details", artworkNotFound: "Artwork not found", backToCategory: "Back to category",
    description: "Description", characteristics: "Details", yearCreated: "Year", dimensions: "Dimensions", technique: "Technique", material: "Material", weight: "Weight", genre: "Genre", price: "Price", priceOnRequest: "Price on request", centimeters: "cm", kilograms: "kg",
    noImages: "This artwork has no images yet", previousImage: "Previous image", nextImage: "Next image", openFullscreen: "Open image", close: "Close", imageNumber: "Image",
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  localized: (ru: string | null | undefined, en: string | null | undefined) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("language") === "en" ? "en" : "ru");

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: TranslationKey) => translations[language][key],
    localized: (ru: string | null | undefined, en: string | null | undefined) => language === "en" ? en || ru || "" : ru || en || "",
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
