import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { paletteFor, renderScene } from '../src/art/scenes/render';
import type { SceneDef } from '../src/art/scenes/types';

const root = resolve(import.meta.dirname, '..');
const sceneDir = resolve(root, 'src/art/scenes');
const outDir = resolve(root, 'public/thumbs');
const WIDTH = 720;

const strip = (svg: string) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

function thumbSvg(def: SceneDef): string {
  const { back, front } = renderScene(def, 'day');
  const p = paletteFor(def, 'day');
  const layer = (inFront: boolean) =>
    (def.interactives ?? [])
      .filter((i) => !!i.front === inFront)
      .map((i) => i.render(p, 'day'))
      .join('');
  const [w, h] = def.world;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${strip(back)}${layer(false)}${strip(front)}${layer(true)}</svg>`;
}

mkdirSync(outDir, { recursive: true });
let total = 0;
for (const file of readdirSync(sceneDir).sort()) {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
  const mod = await import(pathToFileURL(resolve(sceneDir, file)).href);
  const def = mod.default as SceneDef | undefined;
  if (!def?.world || !def.id) continue;
  const png = new Resvg(thumbSvg(def), { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
  writeFileSync(resolve(outDir, `${def.id}.png`), png);
  total += png.length;
}
console.log(`thumbs: ${Math.round(total / 1024)} KB -> public/thumbs`);
