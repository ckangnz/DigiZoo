import type { ImgHTMLAttributes } from 'react';
import { stickerUrl } from '../art/cache';
import type { StyleId } from '../art/core/types';
import { useArtOf } from '../registry/animals';

type Props = { id: string; look: StyleId } & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

export function StickerImage({ id, look, ...img }: Props) {
  const def = useArtOf(id);
  return def ? <img src={stickerUrl(def, look)} {...img} /> : null;
}
