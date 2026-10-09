import { z } from "zod";
import { DateTime } from "luxon";

export const dateTimeSchema = z
  .string()
  .transform((val) => DateTime.fromISO(val));

export const artworkImageSchema = z.object({
  id: z.number().int(),
  artworkId: z.number().int(),
  imageUrl: z.string(),
  sortOrder: z.number().int(),
  createdAt: dateTimeSchema,
});

export const artworkSchema = z.object({
  id: z.number().int(),
  titleRu: z.string(),
  titleEn: z.string().nullable(),
  slug: z.string(),
  descriptionRu: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  price: z.string().nullable(),
  yearCreated: z.number().int().nullable(),
  widthCm: z.string().nullable(),
  heightCm: z.string().nullable(),
  technique: z.string().nullable(),
  materialRu: z.string().nullable(),
  materialEn: z.string().nullable(),
  weightKg: z.string().nullable(),
  genreRu: z.string().nullable(),
  genreEn: z.string().nullable(),
  isSold: z.boolean(),
  isAvailable: z.boolean(),
  artworImages: z.array(artworkImageSchema),

  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export const categorySchema = z.object({
  id: z.number().int(),
  nameRu: z.string(),
  nameEn: z.string().nullable(),
  slug: z.string(),
  descriptionRu: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: dateTimeSchema,
  img: z.string().nullable(),
  artworks: z.array(artworkSchema),
});

export const categoryListItemSchema = categorySchema.omit({ artworks: true });

export const exhibitionSchema = z.object({
  id: z.number().int(),
  titleRu: z.string(),
  titleEn: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  locationRu: z.string().nullable(),
  locationEn: z.string().nullable(),
  startYear: z.number().int().nullable(),
  endYear: z.number().int().nullable(),
  coverImage: z.string().nullable(),
  createdAt: dateTimeSchema,
});

export const publicationSchema = z.object({
  id: z.number().int(),
  titleRu: z.string(),
  titleEn: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  coverImage: z.string().nullable(),
  publishedAt: dateTimeSchema.nullable(),
  isPublished: z.boolean(),
  createdAt: dateTimeSchema,
});

export const videoSchema = z.object({
  id: z.number().int(),
  titleRu: z.string(),
  titleEn: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  descriptionEn: z.string().nullable(),
  videoUrl: z.string(),
  coverImage: z.string().nullable(),
  sortOrder: z.number().int(),
  publishedAt: dateTimeSchema.nullable(),
  isPublished: z.boolean(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

export type ArtworkImageDTO = z.infer<typeof artworkImageSchema>;
export type ArtworkDTO = z.infer<typeof artworkSchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;
export type CategoryListItemDTO = z.infer<typeof categoryListItemSchema>;
export type ExhibitionDTO = z.infer<typeof exhibitionSchema>;
export type PublicationDTO = z.infer<typeof publicationSchema>;
export type VideoDTO = z.infer<typeof videoSchema>;
