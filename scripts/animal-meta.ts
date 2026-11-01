import { readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AnimalDef } from '../src/art/core/types';
import { toMeta } from '../src/registry/meta';

const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, 'src/art/animals');
const metas = [];
for (const file of readdirSync(dir).sort()) {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
  const def = (await import(pathToFileURL(resolve(dir, file)).href)).default as AnimalDef;
  metas.push(toMeta(def));
}
writeFileSync(resolve(root, 'src/registry/animal-meta.json'), `${JSON.stringify(metas)}\n`);
console.log(`animal-meta: ${metas.length} stickers`);
