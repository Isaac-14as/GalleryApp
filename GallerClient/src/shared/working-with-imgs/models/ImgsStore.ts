import { makeAutoObservable } from "mobx";

type ImgItem = {
  id: string;
  file: File | null;
  previewUrl: string | null;
};

export class ImgsStore {
  imgs: ImgItem[] = [];
  constructor() {
    makeAutoObservable(this, {}, { deep: true, autoBind: true });
  }

  clear() {
    this.imgs = [];
  }

  setImgs(data: ImgItem[]) {
    this.imgs = data;
  }

  addImg(data: ImgItem) {
    this.imgs.push(data);
  }
}

export const imgsStore = new ImgsStore();
