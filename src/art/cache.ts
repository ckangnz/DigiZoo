import { renderAnimal } from './core/render';
import type { AnimalDef, StyleId } from './core/types';
import { cloud } from './scenes/props';
import { renderScene } from './scenes/render';
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
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 130" width="260" height="130">${cloud(
        124,
        74,
        1,
        '#ffffff',
        '#dbeaf7',
      )}</svg>`,
    );
  }
  return cloudSpriteUrl;
}
