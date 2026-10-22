export type StyleId = 'cartoon' | 'comic' | 'painted';

export const STYLES: StyleId[] = ['cartoon', 'comic', 'painted'];

export type Locomotion =
  | 'walk4'
  | 'walk2'
  | 'waddle'
  | 'hop'
  | 'fly'
  | 'flutter'
  | 'swim'
  | 'slither'
  | 'crawl'
  | 'pulse'
  | 'float'
  | 'beat'
  | 'breathe'
  | 'wobble'
  | 'roll'
  | 'drive';

export type HabitatId =
  | 'safari'
  | 'jungle'
  | 'rainforest'
  | 'desert'
  | 'farm'
  | 'ocean'
  | 'dinosaur'
  | 'halloween'
  | 'space'
  | 'body'
  | 'bible'
  | 'birds'
  | 'vehicles'
  | 'polar'
  | 'aussie'
  | 'cave'
  | 'bugs'
  | 'forest'
  | 'pets';

export type AnimalGroup =
  | 'mammal'
  | 'bird'
  | 'reptile'
  | 'amphibian'
  | 'fish'
  | 'bug'
  | 'sea'
  | 'dinosaur'
  | 'spooky'
  | 'space'
  | 'body'
  | 'bible'
  | 'vehicle'
  | 'nature';

export type StickerKind = 'animal' | 'character' | 'object';

export type ShapeKind = 'base' | 'detail' | 'feature' | 'line';

export interface Shape {
  d: string;
  kind?: ShapeKind;
  fill?: string;
  stroke?: string;
  width?: number;
  opacity?: number;
}

export type Wave = 'sin' | 'cos' | 'abs' | 'lift';

export interface Motion {
  rotate?: number;
  x?: number;
  y?: number;
  scaleX?: number;
  scaleY?: number;
  freq?: number;
  phase?: number;
  wave?: Wave;
}

export interface PartNode {
  id: string;
  role?: string;
  pivot?: [number, number];
  phase?: number;
  motion?: Motion | null;
  shapes?: Shape[];
  frames?: (phase: number) => Shape[];
  children?: PartNode[];
  behind?: boolean;
}

export interface Gait {
  period?: number;
  stride?: number;
  swing?: number;
  lift?: number;
}

export interface AnimalDef {
  id: string;
  name: string;
  kind?: StickerKind;
  aliases?: string[];
  group: AnimalGroup;
  habitats: HabitatId[];
  box: [number, number];
  size: number;
  locomotion: Locomotion;
  gait?: Gait;
  palette: Record<string, string>;
  parts: PartNode[];
  sound: string;
}

export interface Pose {
  tx: number;
  ty: number;
  rot: number;
  sx: number;
  sy: number;
}
