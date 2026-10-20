import { darken, luminance, saturate } from './color';
import { emptyBounds, extendBounds, samplePath, type Bounds } from './paths';
import { IDENTITY, partPose, poseToTransform, rootPivot, rootPose } from './motion';
import type { AnimalDef, PartNode, Pose, Shape, StyleId } from './types';

export interface RenderOptions {
  style: StyleId;
  phase?: number | null;
  idPrefix?: string;
  live?: boolean;
}

interface StyleSpec {
  outlineWidth: number;
  outlineColor: (fill: string) => string;
  outlineOpacity: number;
  fill: (color: string) => string;
  shade: 'cel' | 'halftone' | 'soft';
  shine: number;
  paint: boolean;
  ink?: string;
}

const INK = '#1f1a2e';

const SPECS: Record<StyleId, StyleSpec> = {
  cartoon: {
    outlineWidth: 4.4,
    outlineColor: (c) => darken(c, 0.45),
    outlineOpacity: 1,
    fill: (c) => c,
    shade: 'cel',
    shine: 0,
    paint: false,
  },
  comic: {
    outlineWidth: 8.5,
    outlineColor: () => INK,
    outlineOpacity: 1,
    fill: (c) => saturate(c, 1.18),
    shade: 'halftone',
    shine: 0.55,
    paint: false,
    ink: INK,
  },
  painted: {
    outlineWidth: 3.2,
    outlineColor: (c) => darken(c, 0.3),
    outlineOpacity: 0.5,
    fill: (c) => saturate(c, 1.1),
    shade: 'soft',
    shine: 0.2,
    paint: true,
  },
};

export const DEFAULT_PALETTE: Record<string, string> = {
  eye: '#2b1d1a',
  shine: '#ffffff',
  blush: '#ff8a9a',
  mouth: '#5b2b2b',
  nose: '#3a2522',
  tongue: '#ff7a8a',
  white: '#ffffff',
  black: '#262131',
  pink: '#ffb3c1',
};

const BORDER = 7;
const PAD = 20;

export const unit = (def: AnimalDef): number => Math.max(def.box[0], def.box[1]) / 320;

export function padOf(def: AnimalDef): number {
  return PAD * unit(def);
}

export function viewBoxOf(def: AnimalDef): [number, number, number, number] {
  const pad = padOf(def);
  return [-pad, -pad, def.box[0] + pad * 2, def.box[1] + pad * 2];
}

const n2 = (v: number) => +v.toFixed(2);

function isLiteral(value: string): boolean {
  return (
    value === 'none' || value.startsWith('#') || value.startsWith('rgb') || value.startsWith('url(')
  );
}

export function resolveColor(
  def: AnimalDef,
  key: string | undefined,
  fallback = '#000000',
): string {
  if (!key) return fallback;
  if (isLiteral(key)) return key;
  const value = def.palette[key] ?? DEFAULT_PALETTE[key];
  if (!value) throw new Error(`${def.id}: unknown palette key "${key}"`);
  return value;
}

export function shapesOf(part: PartNode, phase: number | null | undefined): Shape[] {
  if (part.frames) return part.frames(phase ?? 0);
  return part.shapes ?? [];
}

const kindOf = (s: Shape) => s.kind ?? 'base';

function boundsOf(shapes: Shape[], kinds: string[]): Bounds | null {
  const b = emptyBounds();
  let any = false;
  for (const s of shapes) {
    if (!kinds.includes(kindOf(s))) continue;
    extendBounds(b, samplePath(s.d));
    any = true;
  }
  return any ? b : null;
}

interface Ctx {
  def: AnimalDef;
  spec: StyleSpec;
  u: number;
  P: string;
  phase: number | null;
  live: boolean;
}

function attrTransform(ctx: Ctx, part: PartNode): string {
  if (ctx.phase === null) return '';
  const pose = partPose(ctx.def, part, ctx.phase);
  if (pose === IDENTITY) return '';
  const t = poseToTransform(pose, part.pivot ?? [0, 0]);
  return t ? ` transform="${t}"` : '';
}

function opacityAttr(s: Shape): string {
  return s.opacity !== undefined && s.opacity < 1 ? ` opacity="${s.opacity}"` : '';
}

export function partDefs(ctx: Ctx, part: PartNode, shapes: Shape[]): string {
  const bases = shapes.filter((s) => kindOf(s) === 'base');
  if (!bases.length) return '';
  const { P, u, spec } = ctx;
  const id = part.id;
  const b = boundsOf(bases, ['base'])!;
  const bw = b.maxX - b.minX;
  const bh = b.maxY - b.minY;
  const shift = Math.min(11 * u, Math.max(2.5 * u, 0.16 * Math.min(bw, bh)));
  const paths = bases.map((s) => `<path d="${s.d}"/>`).join('');
  let out = `<clipPath id="${P}c-${id}">${paths}</clipPath>`;
  const white = bases.map((s) => `<path d="${s.d}" fill="#fff"/>`).join('');
  const dark = (dx: number, dy: number) =>
    `<g transform="translate(${n2(dx)} ${n2(dy)})">${bases.map((s) => `<path d="${s.d}" fill="#000"/>`).join('')}</g>`;
  if (spec.shade !== 'soft') {
    out += `<mask id="${P}m-${id}" maskUnits="userSpaceOnUse" x="${n2(b.minX - 20 * u)}" y="${n2(b.minY - 20 * u)}" width="${n2(bw + 40 * u)}" height="${n2(bh + 40 * u)}">${white}${dark(-0.55 * shift, -0.85 * shift)}</mask>`;
  } else {
    out +=
      `<linearGradient id="${P}g-${id}" gradientUnits="userSpaceOnUse" x1="${n2(b.minX + bw * 0.3)}" y1="${n2(b.minY)}" x2="${n2(b.minX + bw * 0.6)}" y2="${n2(b.maxY)}">` +
      `<stop offset="0" stop-color="#fff8e8" stop-opacity=".34"/><stop offset=".4" stop-color="#fff8e8" stop-opacity="0"/>` +
      `<stop offset=".55" stop-color="#2a1838" stop-opacity="0"/><stop offset="1" stop-color="#2a1838" stop-opacity=".26"/></linearGradient>`;
  }
  if (spec.shine > 0 && Math.min(bw, bh) > 14 * u) {
    out += `<mask id="${P}r-${id}" maskUnits="userSpaceOnUse" x="${n2(b.minX - 20 * u)}" y="${n2(b.minY - 20 * u)}" width="${n2(bw + 40 * u)}" height="${n2(bh + 40 * u)}">${white}${dark(0.35 * shift, 0.5 * shift)}</mask>`;
  }
  return out;
}

function underlayShapes(ctx: Ctx, shapes: Shape[]): string {
  const { u, spec, def } = ctx;
  const w = n2((BORDER * 2 + spec.outlineWidth) * u);
  return shapes
    .filter((s) => kindOf(s) !== 'detail')
    .map((s) => {
      if (kindOf(s) === 'line') {
        const lw = n2((s.width ?? 3) * u + w);
        return `<path d="${s.d}" fill="none" stroke="#fff" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      const fill = resolveColor(def, s.fill, '#ffffff');
      if (fill === 'none') return '';
      return `<path d="${s.d}" fill="#fff" stroke="#fff" stroke-width="${w}" stroke-linejoin="round"/>`;
    })
    .join('');
}

function artShapes(ctx: Ctx, part: PartNode, shapes: Shape[]): string {
  const { def, spec, u, P } = ctx;
  const id = part.id;
  const bases = shapes.filter((s) => kindOf(s) === 'base');
  const details = shapes.filter((s) => kindOf(s) === 'detail');
  const front = shapes.filter((s) => kindOf(s) === 'feature' || kindOf(s) === 'line');
  const ow = n2(spec.outlineWidth * u);
  const color = (key: string | undefined, fallback?: string) => {
    const c = resolveColor(def, key, fallback);
    return c.startsWith('#') ? spec.fill(c) : c;
  };
  let out = '';
  for (const s of bases) {
    const c = resolveColor(def, s.fill, '#ffffff');
    if (c === 'none') continue;
    const oc = c.startsWith('#') ? spec.outlineColor(c) : INK;
    out += `<path d="${s.d}" fill="${oc}" stroke="${oc}" stroke-width="${ow}" stroke-linejoin="round"${spec.outlineOpacity < 1 ? ` opacity="${spec.outlineOpacity}"` : ''}/>`;
  }
  for (const s of bases) {
    const c = color(s.fill, '#ffffff');
    if (c === 'none') continue;
    out += `<path d="${s.d}" fill="${c}"${opacityAttr(s)}/>`;
  }
  if (bases.length) {
    const b = boundsOf(bases, ['base'])!;
    const rect = `x="${n2(b.minX - 4 * u)}" y="${n2(b.minY - 4 * u)}" width="${n2(b.maxX - b.minX + 8 * u)}" height="${n2(b.maxY - b.minY + 8 * u)}"`;
    let inner = details
      .map((s) => `<path d="${s.d}" fill="${color(s.fill)}"${opacityAttr(s)}/>`)
      .join('');
    if (spec.shade === 'cel') {
      inner += `<rect ${rect} fill="#2a1838" fill-opacity=".13" mask="url(#${P}m-${id})"/>`;
    } else if (spec.shade === 'halftone') {
      inner += `<rect ${rect} fill="url(#${P}ht)" mask="url(#${P}m-${id})"/>`;
      inner += `<rect ${rect} fill="#2a1838" fill-opacity=".12" mask="url(#${P}m-${id})"/>`;
    } else {
      inner += `<rect ${rect} fill="url(#${P}g-${id})"/>`;
    }
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    if (spec.shine > 0 && Math.min(bw, bh) > 14 * u) {
      inner += `<rect ${rect} fill="#ffffff" fill-opacity="${spec.shine}" mask="url(#${P}r-${id})"/>`;
    }
    out += `<g clip-path="url(#${P}c-${id})">${inner}</g>`;
  }
  for (const s of front) {
    if (kindOf(s) === 'line') {
      const original = resolveColor(def, s.stroke ?? 'mouth');
      const stroke =
        spec.ink && (!original.startsWith('#') || luminance(original) < 0.32) ? spec.ink : original;
      const lw = n2((s.width ?? 3) * u * (spec.ink ? 1.15 : 1));
      out += `<path d="${s.d}" fill="none" stroke="${stroke}" stroke-width="${lw}" stroke-linecap="round" stroke-linejoin="round"${opacityAttr(s)}/>`;
      continue;
    }
    const c = color(s.fill, '#000000');
    let strokeAttr = '';
    if (s.stroke) {
      const sc =
        s.stroke === 'auto'
          ? c.startsWith('#')
            ? spec.outlineColor(c)
            : INK
          : (spec.ink ?? resolveColor(def, s.stroke));
      strokeAttr = ` stroke="${sc}" stroke-width="${n2((s.width ?? spec.outlineWidth / 2) * u)}" stroke-linejoin="round"`;
    }
    out += `<path d="${s.d}" fill="${c}"${strokeAttr}${opacityAttr(s)}/>`;
  }
  return out;
}

function renderTree(ctx: Ctx, parts: PartNode[], pass: 'u' | 'a', defsOut: string[]): string {
  let out = '';
  for (const part of parts) {
    const shapes = shapesOf(part, ctx.phase);
    if (pass === 'a') defsOut.push(`<g data-d="${part.id}">${partDefs(ctx, part, shapes)}</g>`);
    const children = part.children ?? [];
    const behind = children.filter((c) => c.behind);
    const before = children.filter((c) => !c.behind);
    const own = pass === 'u' ? underlayShapes(ctx, shapes) : artShapes(ctx, part, shapes);
    out +=
      `<g data-p="${part.id}"${attrTransform(ctx, part)}>` +
      renderTree(ctx, behind, pass, defsOut) +
      `<g data-${pass}="${part.id}">${own}</g>` +
      renderTree(ctx, before, pass, defsOut) +
      '</g>';
  }
  return out;
}

function globalDefs(ctx: Ctx): string {
  const { P, u, spec } = ctx;
  let out =
    `<filter id="${P}sh" x="-15%" y="-15%" width="130%" height="135%" color-interpolation-filters="sRGB">` +
    `<feDropShadow dx="0" dy="${n2(3 * u)}" stdDeviation="${n2(2.4 * u)}" flood-color="#3a2a4a" flood-opacity=".28"/></filter>`;
  if (spec.shade === 'halftone') {
    const s = n2(6.6 * u);
    out += `<pattern id="${P}ht" patternUnits="userSpaceOnUse" width="${s}" height="${s}" patternTransform="rotate(28)"><circle cx="${n2(s / 2)}" cy="${n2(s / 2)}" r="${n2(1.65 * u)}" fill="${INK}" fill-opacity=".5"/></pattern>`;
  }
  if (spec.paint) {
    const freq = (v: number) => (v / u).toFixed(4);
    out +=
      `<filter id="${P}pt" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq(0.04)}" numOctaves="2" seed="3" result="w"/>` +
      `<feDisplacementMap in="SourceGraphic" in2="w" scale="${n2(5 * u)}" xChannelSelector="R" yChannelSelector="G" result="d"/>` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq(0.018)}" numOctaves="3" seed="11" result="b"/>` +
      `<feColorMatrix in="b" type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.22  0.4 0 0 0 -0.16" result="bl"/>` +
      `<feComposite in="bl" in2="d" operator="in" result="bli"/>` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq(0.03)} ${freq(0.12)}" numOctaves="2" seed="8" result="s"/>` +
      `<feColorMatrix in="s" type="matrix" values="0 0 0 0 1  0 0 0 0 0.98  0 0 0 0 0.93  0.7 0 0 0 -0.36" result="sl"/>` +
      `<feComposite in="sl" in2="d" operator="in" result="sli"/>` +
      `<feTurbulence type="fractalNoise" baseFrequency="${freq(0.7)}" numOctaves="1" seed="2" result="g"/>` +
      `<feColorMatrix in="g" type="matrix" values="0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0 0.24  -0.8 0 0 0 0.32" result="gd"/>` +
      `<feComposite in="gd" in2="d" operator="in" result="gdi"/>` +
      `<feMorphology in="d" operator="erode" radius="${n2(2.4 * u)}" result="er"/>` +
      `<feComposite in="d" in2="er" operator="out" result="edge"/>` +
      `<feGaussianBlur in="edge" stdDeviation="${n2(1.4 * u)}" result="eb"/>` +
      `<feFlood flood-color="#4a2238" flood-opacity=".22"/>` +
      `<feComposite in2="eb" operator="in" result="ef"/>` +
      `<feComposite in="ef" in2="d" operator="in" result="edi"/>` +
      `<feMerge><feMergeNode in="d"/><feMergeNode in="bli"/><feMergeNode in="sli"/><feMergeNode in="gdi"/><feMergeNode in="edi"/></feMerge></filter>`;
  }
  return out;
}

export function rootTransform(def: AnimalDef, phase: number | null): string {
  if (phase === null) return '';
  const pose: Pose = rootPose(def, phase);
  if (pose === IDENTITY) return '';
  return poseToTransform(pose, rootPivot(def));
}

export function renderAnimal(def: AnimalDef, opts: RenderOptions): string {
  const spec = SPECS[opts.style];
  const ctx: Ctx = {
    def,
    spec,
    u: unit(def),
    P: (opts.idPrefix ?? 'a') + '-',
    phase: opts.phase ?? null,
    live: !!opts.live,
  };
  const [vx, vy, vw, vh] = viewBoxOf(def);
  const partDefsOut: string[] = [];
  const art = renderTree(ctx, def.parts, 'a', partDefsOut);
  const under = renderTree(ctx, def.parts, 'u', []);
  const rt = rootTransform(def, ctx.phase);
  const rootAttr = rt ? ` transform="${rt}"` : '';
  const size = opts.live
    ? ` overflow="visible" preserveAspectRatio="xMidYMid meet"`
    : ` width="${n2(vw)}" height="${n2(vh)}"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n2(vx)} ${n2(vy)} ${n2(vw)} ${n2(vh)}"${size}>` +
    `<defs>${globalDefs(ctx)}${partDefsOut.join('')}</defs>` +
    `<g filter="url(#${ctx.P}sh)"><g data-p="__root"${rootAttr}>${under}</g></g>` +
    `<g${spec.paint ? ` filter="url(#${ctx.P}pt)"` : ''}><g data-p="__root"${rootAttr}>${art}</g></g>` +
    `</svg>`
  );
}

export function renderPartPieces(
  def: AnimalDef,
  part: PartNode,
  style: StyleId,
  idPrefix: string,
  phase: number,
): { defs: string; underlay: string; art: string } {
  const ctx: Ctx = {
    def,
    spec: SPECS[style],
    u: unit(def),
    P: idPrefix + '-',
    phase,
    live: true,
  };
  const shapes = shapesOf(part, phase);
  return {
    defs: partDefs(ctx, part, shapes),
    underlay: underlayShapes(ctx, shapes),
    art: artShapes(ctx, part, shapes),
  };
}

export function flattenParts(parts: PartNode[], out: PartNode[] = []): PartNode[] {
  for (const p of parts) {
    out.push(p);
    if (p.children) flattenParts(p.children, out);
  }
  return out;
}

export function animalBounds(def: AnimalDef): Bounds {
  const b = emptyBounds();
  for (const part of flattenParts(def.parts)) {
    for (const s of shapesOf(part, 0)) {
      if (kindOf(s) === 'detail') continue;
      extendBounds(b, samplePath(s.d));
    }
  }
  const grow = (BORDER + 4.5) * unit(def);
  return { minX: b.minX - grow, minY: b.minY - grow, maxX: b.maxX + grow, maxY: b.maxY + grow };
}
