import axios from "axios";

import { urls } from "shared/api/urls";
import type { AdminEntity, FieldErrors } from "../model/types";

const authKey = "admin-auth";
export const getAdminAuth = () => sessionStorage.getItem(authKey) ?? "";
export const setAdminAuth = (value: string) =>
  sessionStorage.setItem(authKey, value);
export const clearAdminAuth = () => sessionStorage.removeItem(authKey);
export const makeAdminAuth = (username: string, password: string) =>
  `Basic ${btoa(`${username}:${password}`)}`;

const request = <T>(method: string, path: string, data?: unknown) =>
  axios<T>({
    method,
    url: `${urls.serverUrl}/admin/api${path}`,
    data,
    headers: { Authorization: getAdminAuth() },
  }).then((response) => response.data);

const deleteMinioFiles = async (service: AdminEntity, names: string[]) => {
  const results = await Promise.allSettled(
    names.map((name) =>
      axios.delete(`${urls.serverUrl}/minio/${encodeURIComponent(name)}`, {
        params: { service_name: service },
        headers: { Authorization: getAdminAuth() },
      }),
    ),
  );

  return results.filter((result) => result.status === "rejected").length;
};

export const adminApi = {
  check: (auth: string) =>
    axios.get(`${urls.serverUrl}/admin/api/check`, {
      headers: { Authorization: auth },
    }),
  list: <T>(entity: AdminEntity) => request<T[]>("GET", `/${entity}`),
  get: <T>(entity: AdminEntity, id: number) =>
    request<T>("GET", `/${entity}/${id}`),
  create: <T>(entity: AdminEntity, data: unknown) =>
    request<T>("POST", `/${entity}`, data),
  replace: <T>(entity: AdminEntity, id: number, data: unknown) =>
    request<T>("PUT", `/${entity}/${id}`, data),
  remove: (entity: AdminEntity, id: number) =>
    request<void>("DELETE", `/${entity}/${id}`),
  uploadFiles: async (service: AdminEntity, files: File[]) => {
    const names = files.map(
      (file) =>
        `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
    );
    const response = await axios.post<
      Array<{ url: string; object_name: string }>
    >(
      `${urls.serverUrl}/minio`,
      { service_name: service, object_names: names },
      { headers: { Authorization: getAdminAuth() } },
    );
    if (response.data.length !== files.length) {
      throw new Error("Хранилище вернуло неверное количество ссылок");
    }
    try {
      await Promise.all(
        response.data.map((item, index) => {
          const file = files[index];
          if (!file) throw new Error("MinIO returned an invalid upload list");
          return axios.put(item.url, file, {
            headers: { "Content-Type": file.type },
          });
        }),
      );
    } catch (error) {
      await deleteMinioFiles(service, names);
      throw error;
    }
    return names;
  },
  deleteFiles: deleteMinioFiles,
};

export const parseApiError = (
  error: unknown,
): { message: string; fields: FieldErrors } => {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : "Неизвестная ошибка",
      fields: {},
    };
  }

  if (!error.response) {
    return {
      message: "Не удалось связаться с сервером. Проверьте подключение",
      fields: {},
    };
  }
  if (error.response.status === 401) {
    return {
      message: "Неверный логин или пароль. Войдите в админ-панель заново",
      fields: {},
    };
  }
  if (error.response.status === 403) {
    return {
      message: "Сервер отклонил загрузку файла. Попробуйте выбрать файл заново",
      fields: {},
    };
  }
  if (error.response.status >= 500) {
    return {
      message: "Сервер не смог выполнить запрос. Попробуйте ещё раз",
      fields: {},
    };
  }

  const detail = (error.response.data as { detail?: unknown } | undefined)
    ?.detail;
  if (Array.isArray(detail)) {
    const fields: FieldErrors = {};
    for (const item of detail) {
      const key = String(item.loc?.at(-1) ?? "form");
      const type = String(item.type ?? "");
      fields[key] = type === "missing"
        ? "Обязательное поле"
        : type === "string_too_long"
          ? "Слишком длинное значение"
          : "Некорректное значение";
    }
    return { message: "Проверьте заполнение формы", fields };
  }
  return {
    message: typeof detail === "string" ? detail : "Не удалось выполнить запрос",
    fields: {},
  };
};
