export type Pt = [number, number];

export type Seg =
  | { c: 'M'; x: number; y: number }
  | { c: 'L'; x: number; y: number }
  | { c: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { c: 'Q'; x1: number; y1: number; x: number; y: number }
  | {
      c: 'A';
      rx: number;
      ry: number;
      rot: number;
      large: number;
      sweep: number;
      x: number;
      y: number;
    }
  | { c: 'Z' };

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export const f = (n: number): number => Math.round(n * 100) / 100;

const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
const SEPARATOR = /[\s,]/;
const COMMAND = /[MmLlHhVvCcSsQqTtAaZz]/;

export function parsePath(d: string): Seg[] {
  const segs: Seg[] = [];
  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let cmd = '';
  let lastCtrl: Pt | null = null;
  let lastQuad: Pt | null = null;
  const skip = () => {
    while (i < d.length && SEPARATOR.test(d[i])) i++;
  };
  const fail = (): never => {
    throw new Error(`Bad path data at ${i}: ${d.slice(Math.max(0, i - 20), i + 20)}`);
  };
  const num = () => {
    skip();
    NUMBER.lastIndex = i;
    const m = NUMBER.exec(d);
    if (!m) return fail();
    i = NUMBER.lastIndex;
    return parseFloat(m[0]);
  };
  const flag = () => {
    skip();
    const ch = d[i];
    if (ch !== '0' && ch !== '1') return fail();
    i++;
    return ch === '1' ? 1 : 0;
  };
  while (true) {
    skip();
    if (i >= d.length) break;
    const ch = d[i];
    if (COMMAND.test(ch)) {
      cmd = ch;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        segs.push({ c: 'Z' });
        cx = sx;
        cy = sy;
        lastCtrl = lastQuad = null;
        continue;
      }
    } else if (!cmd) {
      throw new Error(`Path must start with a command: ${d.slice(0, 80)}`);
    }
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const ox = rel ? cx : 0;
    const oy = rel ? cy : 0;
    switch (C) {
      case 'M': {
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'M', x, y });
        cx = sx = x;
        cy = sy = y;
        cmd = rel ? 'l' : 'L';
        lastCtrl = lastQuad = null;
        break;
      }
      case 'L': {
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'L', x, y });
        cx = x;
        cy = y;
        lastCtrl = lastQuad = null;
        break;
      }
      case 'H': {
        const x = num() + ox;
        segs.push({ c: 'L', x, y: cy });
        cx = x;
        lastCtrl = lastQuad = null;
        break;
      }
      case 'V': {
        const y = num() + oy;
        segs.push({ c: 'L', x: cx, y });
        cy = y;
        lastCtrl = lastQuad = null;
        break;
      }
      case 'C': {
        const x1 = num() + ox;
        const y1 = num() + oy;
        const x2 = num() + ox;
        const y2 = num() + oy;
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'C', x1, y1, x2, y2, x, y });
        lastCtrl = [x2, y2];
        lastQuad = null;
        cx = x;
        cy = y;
        break;
      }
      case 'S': {
        const x1: number = lastCtrl ? 2 * cx - lastCtrl[0] : cx;
        const y1: number = lastCtrl ? 2 * cy - lastCtrl[1] : cy;
        const x2 = num() + ox;
        const y2 = num() + oy;
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'C', x1, y1, x2, y2, x, y });
        lastCtrl = [x2, y2];
        lastQuad = null;
        cx = x;
        cy = y;
        break;
      }
      case 'Q': {
        const x1 = num() + ox;
        const y1 = num() + oy;
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'Q', x1, y1, x, y });
        lastQuad = [x1, y1];
        lastCtrl = null;
        cx = x;
        cy = y;
        break;
      }
      case 'T': {
        const x1: number = lastQuad ? 2 * cx - lastQuad[0] : cx;
        const y1: number = lastQuad ? 2 * cy - lastQuad[1] : cy;
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'Q', x1, y1, x, y });
        lastQuad = [x1, y1];
        lastCtrl = null;
        cx = x;
        cy = y;
        break;
      }
      case 'A': {
        const rx = Math.abs(num());
        const ry = Math.abs(num());
        const rot = num();
        const large = flag();
        const sweep = flag();
        const x = num() + ox;
        const y = num() + oy;
        segs.push({ c: 'A', rx, ry, rot, large, sweep, x, y });
        cx = x;
        cy = y;
        lastCtrl = lastQuad = null;
        break;
      }
      default:
        throw new Error(`Unsupported path command ${cmd}`);
    }
  }
  return segs;
}

export function serialize(segs: Seg[]): string {
  return segs
    .map((s) => {
      switch (s.c) {
        case 'M':
        case 'L':
          return `${s.c}${f(s.x)} ${f(s.y)}`;
        case 'C':
          return `C${f(s.x1)} ${f(s.y1)} ${f(s.x2)} ${f(s.y2)} ${f(s.x)} ${f(s.y)}`;
        case 'Q':
          return `Q${f(s.x1)} ${f(s.y1)} ${f(s.x)} ${f(s.y)}`;
        case 'A':
          return `A${f(s.rx)} ${f(s.ry)} ${f(s.rot)} ${s.large} ${s.sweep} ${f(s.x)} ${f(s.y)}`;
        case 'Z':
          return 'Z';
      }
    })
    .join('');
}

function mapPoints(
  d: string,
  map: (x: number, y: number) => Pt,
  arc: (s: Extract<Seg, { c: 'A' }>) => Partial<Extract<Seg, { c: 'A' }>>,
): string {
  const segs = parsePath(d).map((s): Seg => {
    switch (s.c) {
      case 'M':
      case 'L': {
        const [x, y] = map(s.x, s.y);
        return { ...s, x, y };
      }
      case 'C': {
        const [x1, y1] = map(s.x1, s.y1);
        const [x2, y2] = map(s.x2, s.y2);
        const [x, y] = map(s.x, s.y);
        return { c: 'C', x1, y1, x2, y2, x, y };
      }
      case 'Q': {
        const [x1, y1] = map(s.x1, s.y1);
        const [x, y] = map(s.x, s.y);
        return { c: 'Q', x1, y1, x, y };
      }
      case 'A': {
        const [x, y] = map(s.x, s.y);
        return { ...s, ...arc(s), x, y };
      }
      case 'Z':
        return s;
    }
  });
  return serialize(segs);
}

export function translatePath(d: string, dx: number, dy: number): string {
  return mapPoints(
    d,
    (x, y) => [x + dx, y + dy],
    () => ({}),
  );
}

export function scalePath(d: string, sx: number, sy = sx, ox = 0, oy = 0): string {
  const flip = sx * sy < 0;
  return mapPoints(
    d,
    (x, y) => [ox + (x - ox) * sx, oy + (y - oy) * sy],
    (s) => ({
      rx: s.rx * Math.abs(sx),
      ry: s.ry * Math.abs(sy),
      rot: flip ? -s.rot : s.rot,
      sweep: flip ? 1 - s.sweep : s.sweep,
    }),
  );
}

export function mirrorPath(d: string, axisX: number): string {
  return scalePath(d, -1, 1, axisX, 0);
}

export function rotatePath(d: string, deg: number, ox = 0, oy = 0): string {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return mapPoints(
    d,
    (x, y) => {
      const dx = x - ox;
      const dy = y - oy;
      return [ox + dx * cos - dy * sin, oy + dx * sin + dy * cos];
    },
    (s) => ({ rot: s.rot + deg }),
  );
}

function arcPoints(x1: number, y1: number, s: Extract<Seg, { c: 'A' }>, steps = 24): Pt[] {
  const { x: x2, y: y2 } = s;
  let { rx, ry } = s;
  if (rx === 0 || ry === 0) return [[x2, y2]];
  const phi = (s.rot * Math.PI) / 180;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cosP * dx + sinP * dy;
  const y1p = -sinP * dx + cosP * dy;
  const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lambda > 1) {
    const k = Math.sqrt(lambda);
    rx *= k;
    ry *= k;
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const sign = s.large === s.sweep ? -1 : 1;
  const coef = den === 0 ? 0 : sign * Math.sqrt(Math.max(0, num / den));
  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;
  const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2;
  const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2;
  const ang = (ux: number, uy: number, vx: number, vy: number) => {
    const a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
    return a;
  };
  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;
  const t1 = ang(1, 0, ux, uy);
  let dt = ang(ux, uy, vx, vy);
  if (!s.sweep && dt > 0) dt -= 2 * Math.PI;
  if (s.sweep && dt < 0) dt += 2 * Math.PI;
  const pts: Pt[] = [];
  for (let k = 1; k <= steps; k++) {
    const t = t1 + (dt * k) / steps;
    pts.push([
      cx + rx * cosP * Math.cos(t) - ry * sinP * Math.sin(t),
      cy + rx * sinP * Math.cos(t) + ry * cosP * Math.sin(t),
    ]);
  }
  return pts;
}

export function samplePath(d: string, steps = 12): Pt[] {
  const pts: Pt[] = [];
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  for (const s of parsePath(d)) {
    switch (s.c) {
      case 'M':
        cx = sx = s.x;
        cy = sy = s.y;
        pts.push([cx, cy]);
        break;
      case 'L':
        cx = s.x;
        cy = s.y;
        pts.push([cx, cy]);
        break;
      case 'C':
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const u = 1 - t;
          pts.push([
            u * u * u * cx + 3 * u * u * t * s.x1 + 3 * u * t * t * s.x2 + t * t * t * s.x,
            u * u * u * cy + 3 * u * u * t * s.y1 + 3 * u * t * t * s.y2 + t * t * t * s.y,
          ]);
        }
        cx = s.x;
        cy = s.y;
        break;
      case 'Q':
        for (let k = 1; k <= steps; k++) {
          const t = k / steps;
          const u = 1 - t;
          pts.push([
            u * u * cx + 2 * u * t * s.x1 + t * t * s.x,
            u * u * cy + 2 * u * t * s.y1 + t * t * s.y,
          ]);
        }
        cx = s.x;
        cy = s.y;
        break;
      case 'A':
        pts.push(...arcPoints(cx, cy, s));
        cx = s.x;
        cy = s.y;
        break;
      case 'Z':
        cx = sx;
        cy = sy;
        break;
    }
  }
  return pts;
}

export function emptyBounds(): Bounds {
  return { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
}

export function extendBounds(b: Bounds, pts: Pt[]): Bounds {
  for (const [x, y] of pts) {
    if (x < b.minX) b.minX = x;
    if (y < b.minY) b.minY = y;
    if (x > b.maxX) b.maxX = x;
    if (y > b.maxY) b.maxY = y;
  }
  return b;
}

export function pathBounds(d: string): Bounds {
  return extendBounds(emptyBounds(), samplePath(d));
}

export function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`;
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, rot = 0): string {
  const a = (rot * Math.PI) / 180;
  const dx = rx * Math.cos(a);
  const dy = rx * Math.sin(a);
  return `M${f(cx - dx)} ${f(cy - dy)}A${f(rx)} ${f(ry)} ${f(rot)} 1 0 ${f(cx + dx)} ${f(cy + dy)}A${f(rx)} ${f(ry)} ${f(rot)} 1 0 ${f(cx - dx)} ${f(cy - dy)}Z`;
}

export function roundRect(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return (
    `M${f(x + rr)} ${f(y)}H${f(x + w - rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w)} ${f(y + rr)}` +
    `V${f(y + h - rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + w - rr)} ${f(y + h)}` +
    `H${f(x + rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x)} ${f(y + h - rr)}` +
    `V${f(y + rr)}A${f(rr)} ${f(rr)} 0 0 1 ${f(x + rr)} ${f(y)}Z`
  );
}

export function capsule(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r1: number,
  r2 = r1,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist <= Math.abs(r1 - r2) + 1e-6) {
    return r1 >= r2 ? circle(x1, y1, r1) : circle(x2, y2, r2);
  }
  const alpha = Math.atan2(dy, dx);
  const beta = Math.acos((r1 - r2) / dist);
  const p = (cx: number, cy: number, r: number, a: number): Pt => [
    cx + r * Math.cos(a),
    cy + r * Math.sin(a),
  ];
  const a1 = p(x1, y1, r1, alpha + beta);
  const a2 = p(x2, y2, r2, alpha + beta);
  const b2 = p(x2, y2, r2, alpha - beta);
  const b1 = p(x1, y1, r1, alpha - beta);
  const largeEnd = 2 * beta > Math.PI ? 1 : 0;
  const largeStart = 2 * Math.PI - 2 * beta > Math.PI ? 1 : 0;
  return (
    `M${f(a1[0])} ${f(a1[1])}L${f(a2[0])} ${f(a2[1])}` +
    `A${f(r2)} ${f(r2)} 0 ${largeEnd} 0 ${f(b2[0])} ${f(b2[1])}` +
    `L${f(b1[0])} ${f(b1[1])}` +
    `A${f(r1)} ${f(r1)} 0 ${largeStart} 0 ${f(a1[0])} ${f(a1[1])}Z`
  );
}

export function smooth(points: Pt[], closed = true, tension = 1): string {
  const n = points.length;
  if (n < 2) return '';
  const get = (i: number): Pt => {
    if (closed) return points[((i % n) + n) % n];
    return points[Math.max(0, Math.min(n - 1, i))];
  };
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  const segCount = closed ? n : n - 1;
  for (let i = 0; i < segCount; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1: Pt = [
      p1[0] + ((p2[0] - p0[0]) / 6) * tension,
      p1[1] + ((p2[1] - p0[1]) / 6) * tension,
    ];
    const c2: Pt = [
      p2[0] - ((p3[0] - p1[0]) / 6) * tension,
      p2[1] - ((p3[1] - p1[1]) / 6) * tension,
    ];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

export function poly(points: Pt[], closed = true): string {
  const d = points.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');
  return closed ? d + 'Z' : d;
}

export function scallop(
  cx: number,
  cy: number,
  r: number,
  n: number,
  bump: number,
  rot = 0,
  rx?: number,
  ry?: number,
): string {
  const ax = rx ?? r;
  const ay = ry ?? r;
  const start = (rot * Math.PI) / 180;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2;
    pts.push([cx + ax * Math.cos(a), cy + ay * Math.sin(a)]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const chord = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const h = Math.max(0.01, bump);
    const rb = (chord * chord) / 4 / (2 * h) + h / 2;
    const large = h > chord / 2 ? 1 : 0;
    d += `A${f(rb)} ${f(rb)} 0 ${large} 1 ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

export function spiky(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  n: number,
  rot = 0,
  tension = 0.7,
): string {
  const pts: Pt[] = [];
  const start = (rot * Math.PI) / 180;
  for (let i = 0; i < n * 2; i++) {
    const a = start + (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? rOuter : rInner;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return smooth(pts, true, tension);
}

export function curve(x1: number, y1: number, x2: number, y2: number, bend: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  return `M${f(x1)} ${f(y1)}Q${f(mx + nx * bend)} ${f(my + ny * bend)} ${f(x2)} ${f(y2)}`;
}

export function leaf(x: number, y: number, length: number, width: number, angle = 0): string {
  const a = (angle * Math.PI) / 180;
  const tx = x + Math.cos(a) * length;
  const ty = y + Math.sin(a) * length;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  const nx = -Math.sin(a) * width;
  const ny = Math.cos(a) * width;
  return `M${f(x)} ${f(y)}Q${f(mx + nx)} ${f(my + ny)} ${f(tx)} ${f(ty)}Q${f(mx - nx)} ${f(my - ny)} ${f(x)} ${f(y)}Z`;
}

export function join(...paths: string[]): string {
  return paths.filter(Boolean).join('');
}

export function spline(points: Pt[], samples: number): Pt[] {
  const n = points.length;
  if (n < 2) return points.slice();
  const get = (i: number) => points[Math.max(0, Math.min(n - 1, i))];
  const out: Pt[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = (k / samples) * (n - 1);
    const i = Math.min(n - 2, Math.floor(t));
    const u = t - i;
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const u2 = u * u;
    const u3 = u2 * u;
    const c = (a: number, b: number, cc: number, d: number) =>
      0.5 *
      (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u2 + (-a + 3 * b - 3 * cc + d) * u3);
    out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}

export function tube(
  centerline: Pt[],
  radius: number | ((t: number) => number),
  samples = Math.max(16, centerline.length * 8),
): string {
  const pts = spline(centerline, samples);
  const r = typeof radius === 'number' ? () => radius : radius;
  const m = pts.length;
  const left: Pt[] = [];
  const right: Pt[] = [];
  const normals: Pt[] = [];
  for (let i = 0; i < m; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(m - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    normals.push([nx, ny]);
    const rr = r(i / (m - 1));
    left.push([pts[i][0] + nx * rr, pts[i][1] + ny * rr]);
    right.push([pts[i][0] - nx * rr, pts[i][1] - ny * rr]);
  }
  const cap = (center: Pt, normal: Pt, rr: number, forward: boolean): Pt[] => {
    const out: Pt[] = [];
    const base = Math.atan2(normal[1], normal[0]);
    for (let k = 1; k < 8; k++) {
      const a = base + ((forward ? -1 : 1) * (Math.PI * k)) / 8;
      out.push([center[0] + Math.cos(a) * rr, center[1] + Math.sin(a) * rr]);
    }
    return out;
  };
  const endCap = cap(pts[m - 1], normals[m - 1], r(1), true);
  const startCap = cap(pts[0], [-normals[0][0], -normals[0][1]], r(0), true);
  const outline = [...left, ...endCap, ...right.reverse(), ...startCap];
  return poly(outline, true);
}
