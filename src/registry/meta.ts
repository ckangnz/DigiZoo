import type { Bounds } from '../art/core/paths';
import { animalBounds } from '../art/core/render';
import type { AnimalDef, AnimalInfo } from '../art/core/types';

export interface AnimalMeta extends AnimalInfo {
  bounds: Bounds;
}

const round = (v: number) => Math.round(v * 100) / 100;

export function toMeta(def: AnimalDef): AnimalMeta {
  const b = animalBounds(def);
  const meta: AnimalMeta = {
    id: def.id,
    name: def.name,
    kind: def.kind,
    aliases: def.aliases,
    group: def.group,
    habitats: def.habitats,
    box: def.box,
    size: def.size,
    locomotion: def.locomotion,
    gait: def.gait,
    sound: def.sound,
    bounds: { minX: round(b.minX), minY: round(b.minY), maxX: round(b.maxX), maxY: round(b.maxY) },
  };
  return JSON.parse(JSON.stringify(meta)) as AnimalMeta;
}
