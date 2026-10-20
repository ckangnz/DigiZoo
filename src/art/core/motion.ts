import type { AnimalDef, Locomotion, Motion, PartNode, Pose } from './types';

type MotionFn = (phi: number, def: AnimalDef, part: PartNode) => Partial<Pose>;
type Spec = Motion | MotionFn;

const TAU = Math.PI * 2;
const HOP_AIR = 0.62;

export const IDENTITY: Pose = { tx: 0, ty: 0, rot: 0, sx: 1, sy: 1 };

function wave(kind: Motion['wave'], theta: number): number {
  switch (kind) {
    case 'cos':
      return Math.cos(theta);
    case 'abs':
      return Math.abs(Math.sin(theta));
    case 'lift':
      return Math.max(0, Math.sin(theta));
    default:
      return Math.sin(theta);
  }
}

export function evalMotion(m: Motion, phi: number, phaseOffset = 0): Pose {
  const theta = TAU * ((m.freq ?? 1) * phi + (m.phase ?? 0) + phaseOffset);
  const w = wave(m.wave, theta);
  return {
    tx: (m.x ?? 0) * w,
    ty: (m.y ?? 0) * w,
    rot: (m.rotate ?? 0) * w,
    sx: 1 + (m.scaleX ?? 0) * w,
    sy: 1 + (m.scaleY ?? 0) * w,
  };
}

const swing = (def: AnimalDef, fallback: number) => def.gait?.swing ?? fallback;
const height = (def: AnimalDef) => def.box[1];

function hopT(phi: number): { air: boolean; t: number } {
  const p = phi - Math.floor(phi);
  if (p < HOP_AIR) return { air: true, t: p / HOP_AIR };
  return { air: false, t: (p - HOP_AIR) / (1 - HOP_AIR) };
}

const PRESETS: Record<Locomotion, Record<string, Spec>> = {
  walk4: {
    body: (phi, def) => ({
      ty: -0.014 * height(def) * Math.abs(Math.cos(TAU * phi)),
      rot: 1.2 * Math.sin(TAU * phi),
    }),
    head: { rotate: 2.5, phase: 0.1 },
    neck: { rotate: 2.5, phase: 0.05 },
    tail: { rotate: 12, phase: 0.25 },
    ear: { rotate: 5, phase: 0.3, freq: 2 },
    earN: { rotate: 5, phase: 0.3, freq: 2 },
    earF: { rotate: -5, phase: 0.3, freq: 2 },
    trunk: { rotate: 7, phase: 0.2 },
    legFN: (phi, def) => ({ rot: swing(def, 22) * Math.sin(TAU * phi) }),
    legBF: (phi, def) => ({ rot: swing(def, 22) * Math.sin(TAU * phi) }),
    legFF: (phi, def) => ({ rot: swing(def, 22) * Math.sin(TAU * (phi + 0.5)) }),
    legBN: (phi, def) => ({ rot: swing(def, 22) * Math.sin(TAU * (phi + 0.5)) }),
  },
  walk2: {
    body: (phi, def) => ({
      ty: -0.018 * height(def) * Math.abs(Math.cos(TAU * phi)),
      rot: 2 * Math.sin(TAU * phi),
    }),
    head: (phi, def) => ({
      tx: 0.012 * def.box[0] * Math.sin(TAU * 2 * phi),
      rot: 2 * Math.sin(TAU * phi),
    }),
    tail: { rotate: 7, phase: 0.25 },
    wingN: { rotate: 6, phase: 0.25 },
    wingF: { rotate: 6, phase: 0.75 },
    armN: (phi, def) => ({ rot: swing(def, 26) * 0.8 * Math.sin(TAU * (phi + 0.5)) }),
    armF: (phi, def) => ({ rot: swing(def, 26) * 0.8 * Math.sin(TAU * phi) }),
    legN: (phi, def) => ({ rot: swing(def, 26) * Math.sin(TAU * phi) }),
    legF: (phi, def) => ({ rot: swing(def, 26) * Math.sin(TAU * (phi + 0.5)) }),
    ear: { rotate: 4, phase: 0.3, freq: 2 },
  },
  waddle: {
    root: { rotate: 6 },
    body: (phi, def) => ({ ty: -0.01 * height(def) * Math.abs(Math.cos(TAU * phi)) }),
    head: { rotate: -3 },
    legN: (phi, def) => ({ ty: -0.035 * height(def) * Math.max(0, Math.sin(TAU * phi)) }),
    legF: (phi, def) => ({ ty: -0.035 * height(def) * Math.max(0, Math.sin(TAU * (phi + 0.5))) }),
    wingN: { rotate: 14, phase: 0.25 },
    wingF: { rotate: 14, phase: 0.75 },
    tail: { rotate: 8, phase: 0.25 },
  },
  hop: {
    root: (phi, def) => {
      const { air, t } = hopT(phi);
      const lift = def.gait?.lift ?? 0.22 * height(def);
      if (air) return { ty: -lift * Math.sin(Math.PI * t) };
      const squash = Math.sin(Math.PI * t);
      return { sy: 1 - 0.1 * squash, sx: 1 + 0.07 * squash };
    },
    body: (phi) => {
      const { air, t } = hopT(phi);
      return { rot: air ? -8 * Math.cos(Math.PI * t) : 8 * Math.cos(Math.PI * t) };
    },
    legBN: (phi, def) => {
      const { air, t } = hopT(phi);
      return { rot: air ? swing(def, 34) * Math.sin(Math.PI * t) : 0 };
    },
    legBF: (phi, def) => {
      const { air, t } = hopT(phi);
      return { rot: air ? swing(def, 34) * Math.sin(Math.PI * t) : 0 };
    },
    legFN: (phi, def) => {
      const { air, t } = hopT(phi);
      return { rot: air ? -swing(def, 34) * 0.7 * Math.sin(Math.PI * t) : 0 };
    },
    legFF: (phi, def) => {
      const { air, t } = hopT(phi);
      return { rot: air ? -swing(def, 34) * 0.7 * Math.sin(Math.PI * t) : 0 };
    },
    ear: (phi) => {
      const { air, t } = hopT(phi);
      return { rot: air ? 12 * Math.sin(Math.PI * t) : -4 * Math.sin(Math.PI * t) };
    },
    tail: { rotate: 8, phase: 0.2 },
    head: (phi) => {
      const { air, t } = hopT(phi);
      return { rot: air ? 3 * Math.cos(Math.PI * t) : 0 };
    },
  },
  fly: {
    root: (phi, def) => ({
      ty: 0.035 * height(def) * Math.sin(Math.PI * phi),
      rot: 2.5 * Math.sin(Math.PI * phi + 1),
    }),
    wingN: (phi, def) => ({ rot: -swing(def, 34) * Math.sin(TAU * phi) }),
    wingF: (phi, def) => ({ rot: -swing(def, 34) * Math.sin(TAU * phi + 0.35) }),
    tail: { rotate: 5, phase: 0.2 },
    head: { rotate: 2, phase: 0.1 },
  },
  flutter: {
    root: (phi, def) => ({
      ty: 0.06 * height(def) * Math.sin(Math.PI * 0.5 * phi),
      rot: 4 * Math.sin(Math.PI * phi),
    }),
    wingN: (phi) => ({ sx: 1 - 0.55 * (0.5 + 0.5 * Math.sin(TAU * phi)) }),
    wingF: (phi) => ({ sx: 1 - 0.45 * (0.5 + 0.5 * Math.sin(TAU * phi)) }),
    antenna: { rotate: 6, phase: 0.2 },
    head: { rotate: 2 },
  },
  swim: {
    root: (phi, def) => ({
      ty: 0.03 * height(def) * Math.sin(Math.PI * phi),
      rot: 2 * Math.sin(Math.PI * phi + 0.6),
    }),
    body: { rotate: 2 },
    tail: { rotate: 16, phase: 0.25 },
    finN: { rotate: 14, phase: 0.5 },
    finF: { rotate: 14, phase: 0 },
    finTop: { rotate: 4, phase: 0.3 },
    flipperFN: { rotate: 24, phase: 0 },
    flipperFF: { rotate: 24, phase: 0.5 },
    flipperBN: { rotate: 16, phase: 0.5 },
    flipperBF: { rotate: 16, phase: 0 },
    head: { rotate: 1.5, phase: 0.6 },
  },
  slither: {
    head: { rotate: 4, phase: 0.1 },
    tongue: { scaleX: 0.4, freq: 3 },
  },
  crawl: {
    body: (phi, def) => ({ ty: -0.01 * height(def) * Math.abs(Math.sin(TAU * 2 * phi)) }),
    leg: (phi, def, part) => ({
      rot: swing(def, 14) * Math.sin(TAU * (2 * phi + (part.phase ?? 0))),
    }),
    claw: { rotate: 6, phase: 0.2 },
    tail: { rotate: 6, phase: 0.3 },
    head: { rotate: 2, phase: 0.2 },
    antenna: { rotate: 8, phase: 0.1, freq: 2 },
  },
  pulse: {
    root: (phi, def) => ({ ty: -0.05 * height(def) * Math.sin(TAU * (phi - 0.15)) }),
    bell: (phi) => {
      const c = 0.5 + 0.5 * Math.sin(TAU * phi);
      return { sx: 1 - 0.1 * c, sy: 1 + 0.07 * c };
    },
    body: (phi) => {
      const c = 0.5 + 0.5 * Math.sin(TAU * phi);
      return { sx: 1 - 0.06 * c, sy: 1 + 0.05 * c };
    },
    tentacle: (phi, _def, part) => ({
      rot: 10 * Math.sin(TAU * (phi + (part.phase ?? 0))),
    }),
    arm: (phi, _def, part) => ({
      rot: 12 * Math.sin(TAU * (phi + (part.phase ?? 0))),
    }),
    head: { rotate: 2 },
  },
};

function lookup(loco: Locomotion, role: string): Spec | undefined {
  const table = PRESETS[loco];
  if (table[role]) return table[role];
  const generic = role.replace(/(N|F|\d+[NF]?|\d+)$/, '');
  return table[generic];
}

export function partPose(def: AnimalDef, part: PartNode, phi: number): Pose {
  if (part.motion === null) return IDENTITY;
  if (part.motion) return evalMotion(part.motion, phi, part.phase ?? 0);
  if (!part.role) return IDENTITY;
  const spec = lookup(def.locomotion, part.role);
  if (!spec) return IDENTITY;
  if (typeof spec === 'function') return { ...IDENTITY, ...spec(phi, def, part) };
  return evalMotion(spec, phi, part.phase ?? 0);
}

export function rootPose(def: AnimalDef, phi: number): Pose {
  const spec = PRESETS[def.locomotion].root;
  if (!spec) return IDENTITY;
  const rootPart: PartNode = { id: 'root' };
  if (typeof spec === 'function') return { ...IDENTITY, ...spec(phi, def, rootPart) };
  return evalMotion(spec, phi);
}

export function rootPivot(def: AnimalDef): [number, number] {
  const [w, h] = def.box;
  switch (def.locomotion) {
    case 'fly':
    case 'flutter':
    case 'swim':
    case 'pulse':
      return [w / 2, h / 2];
    default:
      return [w / 2, h];
  }
}

export function travelFactor(def: AnimalDef, phi: number): number {
  if (def.locomotion !== 'hop') return 1;
  const p = phi - Math.floor(phi);
  return p < HOP_AIR ? 1 / HOP_AIR : 0;
}

const DEFAULT_PERIOD: Record<Locomotion, number> = {
  walk4: 0.9,
  walk2: 0.7,
  waddle: 0.6,
  hop: 0.75,
  fly: 0.5,
  flutter: 0.3,
  swim: 1.1,
  slither: 1.2,
  crawl: 0.9,
  pulse: 1.4,
};

const DEFAULT_STRIDE: Record<Locomotion, number> = {
  walk4: 0.3,
  walk2: 0.22,
  waddle: 0.12,
  hop: 0.55,
  fly: 0.3,
  flutter: 0.06,
  swim: 0.35,
  slither: 0.22,
  crawl: 0.14,
  pulse: 0.12,
};

export function gaitPeriod(def: AnimalDef): number {
  return def.gait?.period ?? DEFAULT_PERIOD[def.locomotion];
}

export function gaitStride(def: AnimalDef): number {
  return def.gait?.stride ?? DEFAULT_STRIDE[def.locomotion] * def.box[0];
}

export function poseToTransform(p: Pose, pivot: [number, number]): string {
  const [px, py] = pivot;
  let out = '';
  if (p.tx || p.ty) out += `translate(${p.tx.toFixed(2)} ${p.ty.toFixed(2)})`;
  if (p.rot) out += `rotate(${p.rot.toFixed(2)} ${px} ${py})`;
  if (p.sx !== 1 || p.sy !== 1) {
    out += `translate(${px} ${py})scale(${p.sx.toFixed(4)} ${p.sy.toFixed(4)})translate(${-px} ${-py})`;
  }
  return out;
}
