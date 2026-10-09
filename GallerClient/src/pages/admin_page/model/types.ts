export type AdminEntity =
  | "categories"
  | "artworks"
  | "exhibitions"
  | "publications"
  | "videos";
export type AdminRecord = Record<string, unknown> & { id: number };
export type FieldErrors = Record<string, string>;
export type StagedImage = {
  id?: number;
  objectName?: string;
  file?: File;
  previewUrl: string;
};

export type StagedFile = {
  objectName?: string;
  file?: File;
  previewUrl: string;
};
