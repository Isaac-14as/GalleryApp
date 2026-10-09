import camelcaseKeys from "camelcase-keys";
import { axiosWrapper } from "./axiosWrapper";
import {
  categoryListItemSchema,
  categorySchema,
  exhibitionSchema,
  publicationSchema,
  videoSchema,
} from "./dto/dto";
import { urls } from "./urls";

export const mainApi = {
  fetchCategories: async () => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/categories/get_categories`,
      method: "GET",
    });

    return categoryListItemSchema
      .array()
      .parse(camelcaseKeys(response, { deep: true }));
  },

  fetchCategoryBySlug: async (slug: string) => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/categories/get_category_by_slug/${slug}`,
      method: "GET",
    });
    const camelcase = camelcaseKeys(response, { deep: true });

    const res = categorySchema.parse(camelcase);

    return res;
  },

  fetchExhibitions: async () => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/exhibitions`,
      method: "GET",
    });

    return exhibitionSchema
      .array()
      .parse(camelcaseKeys(response, { deep: true }));
  },

  fetchPublications: async () => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/publications`,
      method: "GET",
    });

    return publicationSchema
      .array()
      .parse(camelcaseKeys(response, { deep: true }));
  },

  fetchVideos: async () => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/videos`,
      method: "GET",
    });

    return videoSchema.array().parse(camelcaseKeys(response, { deep: true }));
  },
};
