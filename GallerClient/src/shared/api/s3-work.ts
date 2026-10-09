import axios from "axios";
import { axiosWrapper } from "./axiosWrapper";
import { urls } from "./urls";

export type S3FileItem = {
  url: string | null;
  object_name: string;
};

export const s3Api = {
  getUploadFileUrl: async (serviceName: string, objectNames: string[]) => {
    const response = await axiosWrapper({
      url: `${urls.serverUrl}/minio`,
      method: "POST",
      data: {
        service_name: serviceName,
        object_names: objectNames,
      },
    });
    return response;
  },

  uploadPhotoToS3: async (url: string, file: File) => {
    const response = await axios.put(url, file, {
      headers: {
        "Content-Type": file.type, // Указываем MIME-тип файла
        // Другие необходимые заголовки, если они требуются S3
      },
    });
    return response;
  },

  getFilesUrls: async (serviceName: string, objectNames: string[]): Promise<S3FileItem[]> => {
    const params = new URLSearchParams();
    params.append("service_name", serviceName);

    objectNames.forEach((name) => {
      params.append("object_names", name);
    });

    const response = await axiosWrapper({
      url: `${urls.serverUrl}/minio?${params.toString()}`,
      method: "GET",
    });
    return response as S3FileItem[];
  },

  urlToFile: async (url: string, filename: string = "") => {
    const fileResponse = await fetch(url);
    const blob = await fileResponse.blob();
    const file = new File([blob], filename || "file", {
      type: blob.type || "image/jpeg",
    });

    return file;
  },
};
