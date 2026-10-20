import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderScene } from '../src/art/scenes/render';
import type { SceneDef } from '../src/art/scenes/types';

const root = resolve(import.meta.dirname, '..');

function strip(svg: string): string {
  return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
}

export async function renderScenePreview(
  id: string,
  outDir: string,
  toPng: (svg: string, file: string, width: number) => void,
): Promise<void> {
  const mod = await import(pathToFileURL(resolve(root, 'src/art/scenes', `${id}.ts`)).href);
  const def = mod.default as SceneDef;
  const [w, h] = def.world;
  for (const mode of ['day', 'night'] as const) {
    const { back, front } = renderScene(def, mode);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${strip(back)}${strip(front)}</svg>`;
    const file = resolve(outDir, `scene-${id}-${mode}.png`);
    toPng(svg, file, 1800);
    console.log(`  → ${file}`);
  }
}
