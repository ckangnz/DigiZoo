import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import lion from '../src/art/animals/lion';
import { renderAnimal, viewBoxOf } from '../src/art/core/render';

const root = resolve(import.meta.dirname, '..');
const pub = resolve(root, 'public');
mkdirSync(resolve(pub, 'icons'), { recursive: true });

function place(svg: string, x: number, y: number, w: number, h: number): string {
  return svg.replace(
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="([^"]+)"[^>]*>/,
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="$1">`,
  );
}

function icon({ rounded, safe }: { rounded: boolean; safe: number }): string {
  const [, , vw, vh] = viewBoxOf(lion);
  const w = 512 * safe;
  const h = (w * vh) / vw;
  const x = (512 - w) / 2;
  const y = 330 - h * 0.62;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">` +
    `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8f2"/><stop offset="1" stop-color="#d6f2ff"/></linearGradient>` +
    `<clipPath id="clip"><rect width="512" height="512" rx="${rounded ? 116 : 0}"/></clipPath></defs>` +
    `<g clip-path="url(#clip)"><rect width="512" height="512" fill="url(#bg)"/>` +
    `<circle cx="408" cy="104" r="${46 * safe + 8}" fill="#ffd34d"/>` +
    `<path d="M0 352C120 316 220 330 300 344C380 358 440 340 512 326V512H0Z" fill="#b9d566"/>` +
    `<path d="M0 404C140 384 260 396 380 410C440 417 480 410 512 404V512H0Z" fill="#9bc150"/>` +
    place(renderAnimal(lion, { style: 'cartoon', idPrefix: 'icon' }), x, y, w, h) +
    `</g></svg>`
  );
}

function png(svg: string, size: number, file: string) {
  const out = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  writeFileSync(resolve(pub, file), out);
  console.log(`  → public/${file}`);
}

const standard = icon({ rounded: true, safe: 0.86 });
const fullBleed = icon({ rounded: false, safe: 0.86 });
const maskable = icon({ rounded: false, safe: 0.68 });

writeFileSync(resolve(pub, 'favicon.svg'), standard);
console.log('  → public/favicon.svg');
png(standard, 192, 'icons/icon-192.png');
png(standard, 512, 'icons/icon-512.png');
png(maskable, 512, 'icons/maskable-512.png');
png(fullBleed, 180, 'icons/apple-touch-icon.png');
