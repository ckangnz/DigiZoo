import { animalBounds, flattenParts, renderAnimal, shapesOf, unit, viewBoxOf } from './render';
import { emptyBounds, extendBounds, samplePath } from './paths';
import { STYLES, type AnimalDef, type Locomotion } from './types';

const REQUIRED_ROLES: Record<Locomotion, string[][]> = {
  walk4: [['body'], ['head'], ['legFN'], ['legFF'], ['legBN'], ['legBF']],
  walk2: [['body'], ['legN'], ['legF']],
  waddle: [['body'], ['legN'], ['legF']],
  hop: [['body'], ['legBN', 'legBF'], ['legFN', 'legFF']],
  fly: [['wingN', 'wingF']],
  flutter: [['wingN', 'wingF']],
  swim: [['tail', 'body', 'flipperFN']],
  slither: [],
  crawl: [],
  pulse: [['bell', 'body']],
  float: [],
  beat: [],
  breathe: [],
  wobble: [],
  roll: [],
  drive: [],
};

const GROUNDED: Locomotion[] = [
  'walk4',
  'walk2',
  'waddle',
  'hop',
  'crawl',
  'slither',
  'roll',
  'drive',
];

export function validateAnimal(def: AnimalDef): string[] {
  const issues: string[] = [];
  if (!/^[a-z][a-z0-9-]*$/.test(def.id)) issues.push(`id "${def.id}" must be kebab-case`);
  if (!def.name) issues.push('missing name');
  if (!def.habitats.length) issues.push('no habitats');
  if (!def.sound) issues.push('missing sound id');
  const [w, h] = def.box;
  if (!(w > 0 && h > 0)) issues.push('box must be positive');
  if (!(def.size > 0)) issues.push('size must be positive');

  const parts = flattenParts(def.parts);
  const ids = new Set<string>();
  for (const p of parts) {
    if (ids.has(p.id)) issues.push(`duplicate part id "${p.id}"`);
    ids.add(p.id);
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(p.id))
      issues.push(`part id "${p.id}" must be alphanumeric`);
    if (p.pivot) {
      const [px, py] = p.pivot;
      if (px < -w * 0.1 || px > w * 1.1 || py < -h * 0.1 || py > h * 1.1) {
        issues.push(`part "${p.id}" pivot ${px},${py} is outside the box`);
      }
    } else if (p.role) {
      issues.push(`part "${p.id}" has role "${p.role}" but no pivot`);
    }
    if (!p.shapes?.length && !p.frames && !p.children?.length) {
      issues.push(`part "${p.id}" has no shapes`);
    }
  }

  const roles = new Set(parts.map((p) => p.role).filter(Boolean) as string[]);
  for (const options of REQUIRED_ROLES[def.locomotion]) {
    if (!options.some((r) => roles.has(r))) {
      issues.push(`${def.locomotion} needs a part with role ${options.join(' or ')}`);
    }
  }
  if (def.locomotion === 'slither' && !parts.some((p) => p.frames)) {
    issues.push('slither needs at least one procedural part (frames)');
  }
  if (def.locomotion === 'crawl' && ![...roles].some((r) => r.startsWith('leg'))) {
    issues.push('crawl needs leg* roles');
  }

  for (const style of STYLES) {
    try {
      renderAnimal(def, { style });
      renderAnimal(def, { style, phase: 0.37 });
    } catch (e) {
      issues.push(`render ${style}: ${(e as Error).message}`);
    }
  }

  const [vx, vy, vw, vh] = viewBoxOf(def);
  const b = animalBounds(def);
  const over = Math.max(vx - b.minX, vy - b.minY, b.maxX - (vx + vw), b.maxY - (vy + vh));
  if (over > 0.5) issues.push(`art (with border) exceeds the box by ${over.toFixed(1)} units`);

  if (GROUNDED.includes(def.locomotion)) {
    const raw = emptyBounds();
    for (const p of parts) {
      for (const s of shapesOf(p, 0)) {
        if ((s.kind ?? 'base') === 'detail') continue;
        extendBounds(raw, samplePath(s.d));
      }
    }
    const gap = h - raw.maxY;
    if (gap > 0.06 * h) issues.push(`feet float ${gap.toFixed(1)} units above the box bottom`);
    if (-gap > 8 * unit(def))
      issues.push(`art extends ${(-gap).toFixed(1)} units below the box bottom`);
  }
  return issues;
}
