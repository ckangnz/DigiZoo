import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { renderAnimal, viewBoxOf } from '../src/art/core/render';
import { validateAnimal } from '../src/art/core/validate';
import { STYLES, type AnimalDef } from '../src/art/core/types';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = resolve(root, outIdx >= 0 ? args[outIdx + 1] : '.art-preview');
const positional = args.filter((a, i) => !a.startsWith('--') && (outIdx < 0 || i !== outIdx + 1));
const sceneMode = args.includes('--scene');
const sheetMode = args.includes('--sheet');

mkdirSync(outDir, { recursive: true });

function place(svg: string, x: number, y: number, w: number, h: number): string {
  return svg.replace(
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="([^"]+)"[^>]*>/,
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="$1" overflow="visible">`,
  );
}

function toPng(svg: string, file: string, width: number) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  writeFileSync(file, png);
}

async function loadAnimal(id: string): Promise<AnimalDef> {
  const mod = await import(pathToFileURL(resolve(root, 'src/art/animals', `${id}.ts`)).href);
  return mod.default as AnimalDef;
}

function animalSheet(def: AnimalDef): string {
  const [, , vw, vh] = viewBoxOf(def);
  const aspect = vw / vh;
  const W = 1500;
  let y = 30;
  let body = '';
  const bigH = 380;
  const bigW = Math.min(bigH * aspect, (W - 80) / 3);
  const bigHH = bigW / aspect;
  STYLES.forEach((style, i) => {
    const x = 30 + i * ((W - 60) / 3) + ((W - 60) / 3 - bigW) / 2;
    body += place(renderAnimal(def, { style, idPrefix: `big${i}` }), x, y, bigW, bigHH);
  });
  y += bigHH + 40;
  const frames = 8;
  const fW = (W - 60) / frames;
  const fH = Math.min(fW / aspect, 200);
  const fWW = fH * aspect;
  body += `<rect x="0" y="${y + fH - 6}" width="${W}" height="${fH * 0.3 + 30}" fill="#e7dcc4"/>`;
  for (let k = 0; k < frames; k++) {
    const x = 30 + k * fW + (fW - fWW) / 2;
    body += place(
      renderAnimal(def, { style: 'cartoon', phase: k / frames, idPrefix: `f${k}` }),
      x,
      y,
      fWW,
      fH,
    );
  }
  y += fH + fH * 0.3 + 50;
  const sH = 120;
  const sW = sH * aspect;
  const bands = ['#9ccc65', '#1d2547'];
  bands.forEach((color, bi) => {
    const bx = bi * (W / 2);
    body += `<rect x="${bx}" y="${y - 10}" width="${W / 2}" height="${sH + 20}" fill="${color}"/>`;
    STYLES.forEach((style, i) => {
      const x = bx + 20 + i * ((W / 2 - 40) / 3) + ((W / 2 - 40) / 3 - sW) / 2;
      body += place(renderAnimal(def, { style, idPrefix: `s${bi}${i}` }), x, y, sW, sH);
    });
  });
  y += sH + 30;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}"><rect width="${W}" height="${y}" fill="#f6f0e4"/>${body}</svg>`;
}

function contactSheet(defs: AnimalDef[], style: (typeof STYLES)[number]): string {
  const cols = 6;
  const cell = 230;
  const rows = Math.ceil(defs.length / cols);
  const W = cols * cell;
  const H = rows * cell;
  let body = '';
  defs.forEach((def, i) => {
    const [, , vw, vh] = viewBoxOf(def);
    const aspect = vw / vh;
    const w = aspect >= 1 ? cell - 20 : (cell - 20) * aspect;
    const h = aspect >= 1 ? (cell - 20) / aspect : cell - 20;
    const x = (i % cols) * cell + (cell - w) / 2;
    const y = Math.floor(i / cols) * cell + (cell - h) / 2;
    body += place(renderAnimal(def, { style, idPrefix: `c${i}` }), x, y, w, h);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#f6f0e4"/>${body}</svg>`;
}

async function main() {
  if (sceneMode) {
    const { renderScenePreview } = await import('./preview-scene');
    for (const id of positional) await renderScenePreview(id, outDir, toPng);
    return;
  }
  const ids = positional.length
    ? positional
    : readdirSync(resolve(root, 'src/art/animals'))
        .filter((f) => f.endsWith('.ts') && !f.startsWith('_') && !f.endsWith('.test.ts'))
        .map((f) => f.replace(/\.ts$/, ''));
  const defs: AnimalDef[] = [];
  let failed = false;
  for (const id of ids) {
    const def = await loadAnimal(id);
    defs.push(def);
    const issues = validateAnimal(def);
    if (issues.length) {
      failed = true;
      console.log(`✗ ${id}\n  - ${issues.join('\n  - ')}`);
    } else {
      console.log(`✓ ${id}`);
    }
    if (!sheetMode) {
      const file = resolve(outDir, `${id}.png`);
      toPng(animalSheet(def), file, 1500);
      console.log(`  → ${file}`);
    }
  }
  if (sheetMode) {
    for (const style of STYLES) {
      const file = resolve(outDir, `_sheet-${style}.png`);
      toPng(contactSheet(defs, style), file, 1380);
      console.log(`  → ${file}`);
    }
  }
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
