import { renderAnimal } from './core/render';
import type { AnimalDef, StyleId } from './core/types';
import { cloud } from './scenes/props';
import { paletteFor, renderScene } from './scenes/render';
import type { Mode, SceneDef } from './scenes/types';

const toUrl = (svg: string) => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));

const stickers = new Map<string, string>();

export function stickerUrl(def: AnimalDef, style: StyleId): string {
  const key = `${def.id}:${style}`;
  let url = stickers.get(key);
  if (!url) {
    url = toUrl(renderAnimal(def, { style }));
    stickers.set(key, url);
  }
  return url;
}

const scenes = new Map<string, { back: string; front: string }>();

export function sceneUrls(def: SceneDef, mode: Mode): { back: string; front: string } {
  const key = `${def.id}:${mode}`;
  let urls = scenes.get(key);
  if (!urls) {
    const { back, front } = renderScene(def, mode);
    urls = { back: toUrl(back), front: toUrl(front) };
    scenes.set(key, urls);
  }
  return urls;
}

const thumbs = new Map<string, string>();

const strip = (svg: string) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

export function sceneThumbUrl(def: SceneDef): string {
  let url = thumbs.get(def.id);
  if (!url) {
    const { back, front } = renderScene(def, 'day');
    const p = paletteFor(def, 'day');
    const layer = (inFront: boolean) =>
      (def.interactives ?? [])
        .filter((i) => !!i.front === inFront)
        .map((i) => i.render(p, 'day'))
        .join('');
    const [w, h] = def.world;
    url = toUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w / 6}" height="${h / 6}">${strip(back)}${layer(false)}${strip(front)}${layer(true)}</svg>`,
    );
    thumbs.set(def.id, url);
  }
  return url;
}

const rasters = new Map<string, string>();
const rastering = new Map<string, Promise<string>>();
let rasterQueue: Promise<unknown> = Promise.resolve();
const THUMB_WIDTH = 720;

async function rasterize(def: SceneDef): Promise<string> {
  const svgUrl = sceneThumbUrl(def);
  const img = new Image();
  img.src = svgUrl;
  await img.decode();
  const [w, h] = def.world;
  const canvas = document.createElement('canvas');
  canvas.width = THUMB_WIDTH;
  canvas.height = Math.round((THUMB_WIDTH * h) / w);
  canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.88),
  );
  canvas.width = 0;
  canvas.height = 0;
  if (!blob) return svgUrl;
  const url = URL.createObjectURL(blob);
  rasters.set(def.id, url);
  setTimeout(() => {
    URL.revokeObjectURL(svgUrl);
    thumbs.delete(def.id);
  }, 0);
  return url;
}

export function sceneThumbSrc(def: SceneDef): string {
  return rasters.get(def.id) ?? sceneThumbUrl(def);
}

export function rasterizeSceneThumb(def: SceneDef): Promise<string> {
  const ready = rasters.get(def.id);
  if (ready) return Promise.resolve(ready);
  let pending = rastering.get(def.id);
  if (!pending) {
    const job = rasterQueue.then(() => rasterize(def));
    rasterQueue = job.catch(() => undefined);
    pending = job.catch(() => sceneThumbUrl(def));
    rastering.set(def.id, pending);
  }
  return pending;
}

export function releaseScenesExcept(themeId: string): void {
  for (const [key, urls] of scenes) {
    if (key.startsWith(`${themeId}:`)) continue;
    URL.revokeObjectURL(urls.back);
    URL.revokeObjectURL(urls.front);
    scenes.delete(key);
  }
}

let cloudSpriteUrl: string | null = null;

export function cloudSprite(): string {
  if (!cloudSpriteUrl) {
    cloudSpriteUrl = toUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 150" width="260" height="150">${cloud(
        130,
        96,
        1,
        '#ffffff',
        '#dbeaf7',
      )}</svg>`,
    );
  }
  return cloudSpriteUrl;
}
