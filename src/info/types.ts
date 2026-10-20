export interface StickerInfo {
  about: string;
  facts: string[];
}

export type InfoPack = Record<string, StickerInfo>;
