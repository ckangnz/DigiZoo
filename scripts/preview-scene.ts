import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { paletteFor, renderScene } from '../src/art/scenes/render';
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
  const boxes = process.argv.includes('--boxes');
  for (const mode of ['day', 'night'] as const) {
    const { back, front } = renderScene(def, mode);
    const p = paletteFor(def, mode);
    const items = def.interactives ?? [];
    const layer = (inFront: boolean) =>
      items
        .filter((i) => !!i.front === inFront)
        .map((i) => i.render(p, mode))
        .join('');
    const outlines = boxes
      ? items
          .map(
            ({ box: [x, y, bw, bh] }) =>
              `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="none" stroke="#ff00ff" stroke-width="6" stroke-dasharray="24 14"/>`,
          )
          .join('')
      : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${strip(back)}${layer(false)}${strip(front)}${layer(true)}${outlines}</svg>`;
    const file = resolve(outDir, `scene-${id}-${mode}.png`);
    toPng(svg, file, 1800);
    console.log(`  → ${file}`);
  }
}
