import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  leaf,
  poly,
  roundRect,
  scallop,
  smooth,
  spiky,
  tube,
  type Pt,
} from '../core/paths';
import { range, rng } from './rng';

export const path = (d: string, fill: string, extra = ''): string =>
  `<path d="${d}" fill="${fill}"${extra}/>`;

export const stroke = (d: string, color: string, width: number, extra = ''): string =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${f(width)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;

export const group = (content: string, transform = '', extra = ''): string =>
  `<g${transform ? ` transform="${transform}"` : ''}${extra}>${content}</g>`;

export function linearGradient(
  id: string,
  stops: [number, string, number?][],
  vertical = true,
): string {
  const s = stops
    .map(
      ([o, c, a]) =>
        `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`,
    )
    .join('');
  return `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${s}</linearGradient>`;
}

export function radialGlow(id: string, color: string, opacity: number): string {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}

export function sky(w: number, h: number, top: string, bottom: string, id = 'sky'): string {
  return `<defs>${linearGradient(id, [
    [0, top],
    [1, bottom],
  ])}</defs><rect width="${w}" height="${h}" fill="url(#${id})"/>`;
}

export function sun(
  x: number,
  y: number,
  r: number,
  color: string,
  ray: string,
  face: string,
): string {
  let rays = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const len = i % 2 ? r * 0.42 : r * 0.6;
    rays += path(
      leaf(
        x + Math.cos(a) * r * 1.18,
        y + Math.sin(a) * r * 1.18,
        len,
        r * 0.13,
        (a * 180) / Math.PI,
      ),
      ray,
    );
  }
  return (
    `<defs>${radialGlow('sunGlow', color, 0.55)}</defs>` +
    `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="url(#sunGlow)"/>` +
    rays +
    path(circle(x, y, r), color) +
    path(ellipse(x - r * 0.34, y - r * 0.08, r * 0.08, r * 0.12), face) +
    path(ellipse(x + r * 0.34, y - r * 0.08, r * 0.08, r * 0.12), face) +
    path(ellipse(x - r * 0.55, y + r * 0.22, r * 0.14, r * 0.08), '#ff9a7a', ' opacity=".55"') +
    path(ellipse(x + r * 0.55, y + r * 0.22, r * 0.14, r * 0.08), '#ff9a7a', ' opacity=".55"') +
    stroke(curve(x - r * 0.24, y + r * 0.22, x + r * 0.24, y + r * 0.22, r * 0.16), face, r * 0.07)
  );
}

export function moon(
  x: number,
  y: number,
  r: number,
  color: string,
  glow: string,
  face: string,
): string {
  const r2 = r * 0.82;
  const cx2 = x + r * 0.55;
  const cy2 = y - r * 0.28;
  const d = Math.hypot(cx2 - x, cy2 - y);
  const a = (r * r - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r * r - a * a));
  const px = x + (a * (cx2 - x)) / d;
  const py = y + (a * (cy2 - y)) / d;
  const ox = (-(cy2 - y) / d) * h;
  const oy = ((cx2 - x) / d) * h;
  const p1: Pt = [px + ox, py + oy];
  const p2: Pt = [px - ox, py - oy];
  const crescent = `M${f(p1[0])} ${f(p1[1])}A${f(r)} ${f(r)} 0 1 1 ${f(p2[0])} ${f(p2[1])}A${f(r2)} ${f(r2)} 0 0 0 ${f(p1[0])} ${f(p1[1])}Z`;
  const ex = x - r * 0.45;
  const ey = y + r * 0.05;
  return (
    `<defs>${radialGlow('moonGlow', glow, 0.45)}</defs>` +
    `<circle cx="${x}" cy="${y}" r="${r * 2.6}" fill="url(#moonGlow)"/>` +
    path(crescent, color) +
    stroke(curve(ex - r * 0.12, ey, ex + r * 0.12, ey, -r * 0.1), face, r * 0.06) +
    path(ellipse(ex - r * 0.02, ey + r * 0.3, r * 0.1, r * 0.06), '#ffb0a0', ' opacity=".55"') +
    stroke(
      curve(ex - r * 0.1, ey + r * 0.42, ex + r * 0.14, ey + r * 0.38, r * 0.08),
      face,
      r * 0.05,
    )
  );
}

export function starField(
  seed: number,
  count: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string,
): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = range(r, x0, x1);
    const y = range(r, y0, y1);
    const s = range(r, 3, 9);
    out +=
      r() < 0.3
        ? path(
            spiky(x, y, s * 1.8, s * 0.45, 4, 45, 0.35),
            color,
            ` fill-opacity="${f(range(r, 0.6, 1))}"`,
          )
        : path(circle(x, y, s * 0.45), color, ` fill-opacity="${f(range(r, 0.4, 0.9))}"`);
  }
  return out;
}

export function cloud(x: number, y: number, s: number, color: string, shade: string): string {
  const puffs: [number, number, number][] = [
    [-70, 0, 46],
    [-20, -30, 60],
    [40, -18, 52],
    [85, 6, 38],
  ];
  const under = puffs
    .map(([dx, dy, r]) => path(circle(x + dx * s, y + (dy + 8) * s, r * s), shade))
    .join('');
  const top = puffs
    .map(([dx, dy, r]) => path(circle(x + dx * s, y + dy * s, r * s), color))
    .join('');
  return (
    under +
    path(roundRect(x - 110 * s, y + 4 * s, 230 * s, 42 * s, 21 * s), shade) +
    top +
    path(roundRect(x - 110 * s, y - 4 * s, 230 * s, 40 * s, 20 * s), color)
  );
}

export function hills(
  seed: number,
  baseY: number,
  amp: number,
  w: number,
  h: number,
  color: string,
  bumps = 6,
): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const step = (w + 400) / bumps;
  for (let i = 0; i <= bumps; i++) {
    const x = -200 + i * step + range(r, -step * 0.2, step * 0.2);
    const y = baseY - amp * (i % 2 ? range(r, 0.55, 1) : range(r, 0, 0.35));
    pts.push([x, y]);
  }
  return path(`${smooth(pts, false)}L${w + 200} ${h + 50}L-200 ${h + 50}Z`, color);
}

export function mountain(
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  snow?: string,
): string {
  const peak: Pt = [x, baseY - h];
  const body = smooth(
    [
      [x - w / 2, baseY + 20],
      [x - w * 0.28, baseY - h * 0.45],
      [x - w * 0.08, baseY - h * 0.92],
      peak,
      [x + w * 0.1, baseY - h * 0.9],
      [x + w * 0.3, baseY - h * 0.42],
      [x + w / 2, baseY + 20],
    ],
    false,
  );
  const shadeD = smooth(
    [
      peak,
      [x + w * 0.1, baseY - h * 0.9],
      [x + w * 0.3, baseY - h * 0.42],
      [x + w / 2, baseY + 20],
      [x + w * 0.05, baseY + 20],
      [x + w * 0.08, baseY - h * 0.5],
    ],
    false,
  );
  let out = path(body + 'Z', color) + path(shadeD + 'Z', shade);
  if (snow) {
    out += path(
      smooth(
        [
          [x - w * 0.13, baseY - h * 0.76],
          [x - w * 0.06, baseY - h * 0.93],
          peak,
          [x + w * 0.07, baseY - h * 0.92],
          [x + w * 0.14, baseY - h * 0.74],
          [x + w * 0.07, baseY - h * 0.79],
          [x + w * 0.01, baseY - h * 0.72],
          [x - w * 0.06, baseY - h * 0.8],
        ],
        true,
      ),
      snow,
    );
  }
  return out;
}

export function acacia(
  x: number,
  y: number,
  s: number,
  trunk: string,
  leaves: string,
  leavesDark: string,
): string {
  const t = (pts: Pt[], r0: number, r1: number) =>
    path(
      tube(
        pts.map(([px, py]) => [x + px * s, y + py * s]),
        (u) => (r0 + (r1 - r0) * u) * s,
      ),
      trunk,
    );
  return (
    t(
      [
        [0, 6],
        [-6, -70],
        [4, -150],
      ],
      16,
      10,
    ) +
    t(
      [
        [4, -140],
        [-40, -190],
        [-90, -222],
      ],
      9,
      5,
    ) +
    t(
      [
        [4, -140],
        [48, -192],
        [96, -224],
      ],
      9,
      5,
    ) +
    t(
      [
        [2, -150],
        [6, -200],
        [0, -236],
      ],
      7,
      4,
    ) +
    path(scallop(x, y - 236 * s, 1, 16, 18 * s, 0, 188 * s, 44 * s), leavesDark) +
    path(scallop(x - 6 * s, y - 250 * s, 1, 14, 16 * s, 8, 170 * s, 34 * s), leaves)
  );
}

export function baobab(
  x: number,
  y: number,
  s: number,
  trunk: string,
  trunkDark: string,
  leaves: string,
): string {
  const body = smooth([
    [x - 70 * s, y + 4],
    [x - 62 * s, y - 120 * s],
    [x - 48 * s, y - 230 * s],
    [x - 58 * s, y - 300 * s],
    [x - 20 * s, y - 318 * s],
    [x + 24 * s, y - 318 * s],
    [x + 60 * s, y - 300 * s],
    [x + 50 * s, y - 230 * s],
    [x + 64 * s, y - 120 * s],
    [x + 74 * s, y + 4],
  ]);
  const branch = (pts: Pt[]) =>
    path(
      tube(
        pts.map(([px, py]) => [x + px * s, y + py * s]),
        (u) => (12 - 7 * u) * s,
      ),
      trunk,
    );
  return (
    branch([
      [-30, -300],
      [-70, -350],
      [-110, -362],
    ]) +
    branch([
      [0, -310],
      [-6, -370],
      [-24, -404],
    ]) +
    branch([
      [30, -300],
      [74, -346],
      [118, -350],
    ]) +
    branch([
      [16, -310],
      [36, -372],
      [60, -400],
    ]) +
    path(body, trunk) +
    path(
      smooth([
        [x + 20 * s, y - 300 * s],
        [x + 56 * s, y - 290 * s],
        [x + 48 * s, y - 220 * s],
        [x + 62 * s, y - 110 * s],
        [x + 72 * s, y + 4],
        [x + 34 * s, y + 4],
        [x + 30 * s, y - 150 * s],
      ]),
      trunkDark,
      ' opacity=".55"',
    ) +
    path(scallop(x - 116 * s, y - 370 * s, 34 * s, 7, 10 * s), leaves) +
    path(scallop(x - 26 * s, y - 414 * s, 38 * s, 7, 11 * s), leaves) +
    path(scallop(x + 70 * s, y - 408 * s, 34 * s, 7, 10 * s), leaves) +
    path(scallop(x + 124 * s, y - 356 * s, 32 * s, 7, 9 * s), leaves)
  );
}

export function roundTree(
  x: number,
  y: number,
  s: number,
  trunk: string,
  leaves: string,
  leavesDark: string,
  fruit?: string,
): string {
  const trunkD = tube(
    [
      [x, y + 4],
      [x - 4 * s, y - 80 * s],
      [x + 2 * s, y - 160 * s],
    ],
    (u) => (22 - 8 * u) * s,
  );
  const blobs: [number, number, number][] = [
    [-70, -190, 70],
    [60, -200, 74],
    [-10, -250, 86],
    [0, -170, 70],
  ];
  let out =
    path(trunkD, trunk) +
    blobs
      .map(([dx, dy, r]) => path(circle(x + dx * s, y + (dy + 12) * s, r * s), leavesDark))
      .join('') +
    blobs
      .map(([dx, dy, r]) => path(circle(x + (dx - 6) * s, y + dy * s, r * s * 0.94), leaves))
      .join('');
  if (fruit) {
    const r = rng(Math.round(x * 7 + y));
    for (let i = 0; i < 7; i++) {
      out += path(circle(x + range(r, -110, 110) * s, y + range(r, -300, -150) * s, 11 * s), fruit);
    }
  }
  return out;
}

export function palm(
  x: number,
  y: number,
  s: number,
  lean: number,
  trunk: string,
  trunkDark: string,
  frond: string,
  frondDark: string,
  coconut?: string,
): string {
  const top: Pt = [x + lean * s, y - 330 * s];
  const spine: Pt[] = [
    [x, y + 4],
    [x + lean * 0.25 * s, y - 120 * s],
    [x + lean * 0.65 * s, y - 240 * s],
    top,
  ];
  let out = path(
    tube(spine, (u) => (20 - 8 * u) * s),
    trunk,
  );
  for (let k = 1; k < 9; k++) {
    const u = k / 9;
    const px = x + lean * s * (u * u * 0.9 + u * 0.1);
    const py = y - 330 * s * u;
    out += stroke(curve(px - 15 * s, py, px + 15 * s, py, 5 * s), trunkDark, 4 * s);
  }
  const fronds = [-170, -140, -110, -70, -40, -10, 20];
  for (const a of fronds) {
    out += path(leaf(top[0], top[1], 150 * s, 30 * s, a + 10), frondDark);
  }
  for (const a of fronds) {
    out += path(leaf(top[0], top[1] - 6 * s, 140 * s, 26 * s, a), frond);
  }
  if (coconut) {
    out +=
      path(circle(top[0] - 12 * s, top[1] + 16 * s, 14 * s), coconut) +
      path(circle(top[0] + 12 * s, top[1] + 18 * s, 14 * s), coconut);
  }
  return out;
}

export function bush(
  x: number,
  y: number,
  s: number,
  color: string,
  dark: string,
  dot?: string,
): string {
  const dome = (cx: number, cy: number, rx: number, ry: number, fill: string) => {
    const pts: Pt[] = [];
    const n = 9;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI;
      const k = i % 2 ? 1 : 0.86;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
    return path(
      `${smooth(pts, false)}L${f(cx + rx)} ${f(cy + 6)}L${f(cx - rx)} ${f(cy + 6)}Z`,
      fill,
    );
  };
  let out = dome(x, y, 120 * s, 90 * s, dark) + dome(x - 8 * s, y - 6 * s, 108 * s, 82 * s, color);
  if (dot) {
    const r = rng(Math.round(x + y * 3));
    for (let i = 0; i < 6; i++) {
      out += path(circle(x + range(r, -80, 70) * s, y - range(r, 15, 70) * s, 7 * s), dot);
    }
  }
  return out;
}

export function grassTuft(x: number, y: number, s: number, color: string): string {
  return [-112, -96, -84, -68]
    .map((a, i) =>
      path(leaf(x + (i - 1.5) * 4 * s, y + 2, (34 + (i % 2) * 14) * s, 6 * s, a), color),
    )
    .join('');
}

export function tallGrass(x: number, y: number, s: number, color: string, dark: string): string {
  let out = '';
  const angles = [-118, -108, -100, -94, -88, -80, -72, -62];
  angles.forEach((a, i) => {
    const len = (70 + ((i * 37) % 50)) * s;
    out += path(leaf(x + (i - 3.5) * 5 * s, y + 2, len, 7 * s, a), i % 2 ? dark : color);
  });
  return out;
}

export function flower(
  x: number,
  y: number,
  s: number,
  petal: string,
  center: string,
  stem?: string,
): string {
  let out = stem ? stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y + 30 * s)}`, stem, 4 * s) : '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    out += path(circle(x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 7.5 * s), petal);
  }
  return out + path(circle(x, y, 6 * s), center);
}

export function rock(
  x: number,
  y: number,
  s: number,
  color: string,
  shade: string,
  light: string,
): string {
  const body = smooth([
    [x - 70 * s, y + 4],
    [x - 64 * s, y - 36 * s],
    [x - 30 * s, y - 64 * s],
    [x + 20 * s, y - 68 * s],
    [x + 60 * s, y - 40 * s],
    [x + 74 * s, y + 4],
  ]);
  return (
    path(body, color) +
    path(
      smooth([
        [x + 20 * s, y - 66 * s],
        [x + 60 * s, y - 40 * s],
        [x + 74 * s, y + 4],
        [x + 10 * s, y + 4],
        [x + 30 * s, y - 30 * s],
      ]),
      shade,
    ) +
    path(ellipse(x - 26 * s, y - 44 * s, 18 * s, 9 * s, -20), light, ' opacity=".7"')
  );
}

export function cactus(
  x: number,
  y: number,
  s: number,
  color: string,
  dark: string,
  bloom?: string,
): string {
  const parts = [
    capsule(x, y - 10 * s, x, y - 250 * s, 30 * s),
    capsule(x - 30 * s, y - 120 * s, x - 70 * s, y - 120 * s, 18 * s),
    capsule(x - 70 * s, y - 120 * s, x - 70 * s, y - 190 * s, 18 * s),
    capsule(x + 30 * s, y - 160 * s, x + 68 * s, y - 160 * s, 16 * s),
    capsule(x + 68 * s, y - 160 * s, x + 68 * s, y - 220 * s, 16 * s),
  ];
  let out = parts.map((d) => path(d, color)).join('');
  out += path(roundRect(x - 30 * s, y - 20 * s, 60 * s, 24 * s, 4 * s), color);
  out += stroke(
    `M${f(x - 12 * s)} ${f(y - 30 * s)}L${f(x - 12 * s)} ${f(y - 245 * s)}`,
    dark,
    5 * s,
  );
  out += stroke(
    `M${f(x + 12 * s)} ${f(y - 30 * s)}L${f(x + 12 * s)} ${f(y - 245 * s)}`,
    dark,
    5 * s,
  );
  if (bloom) out += flower(x, y - 278 * s, s * 0.9, bloom, '#ffe066');
  return out;
}

export function barrelCactus(
  x: number,
  y: number,
  s: number,
  color: string,
  dark: string,
  bloom: string,
): string {
  return (
    path(ellipse(x, y - 40 * s, 46 * s, 44 * s), color) +
    stroke(curve(x - 16 * s, y - 4 * s, x - 16 * s, y - 78 * s, 6 * s), dark, 4 * s) +
    stroke(curve(x + 16 * s, y - 4 * s, x + 16 * s, y - 78 * s, -6 * s), dark, 4 * s) +
    flower(x, y - 86 * s, s * 0.8, bloom, '#ffe066')
  );
}

export function mesa(
  x: number,
  baseY: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  stripe: string,
): string {
  const top = baseY - h;
  const body = smooth(
    [
      [x - w / 2 - 40, baseY + 10],
      [x - w / 2, baseY - h * 0.3],
      [x - w / 2 + 20, top + 24],
      [x - w / 2 + 70, top],
      [x + w / 2 - 70, top],
      [x + w / 2 - 20, top + 24],
      [x + w / 2, baseY - h * 0.3],
      [x + w / 2 + 40, baseY + 10],
    ],
    false,
  );
  return (
    path(body + 'Z', color) +
    path(
      roundRect(x - w / 2 + 6, top + h * 0.34, w - 12, h * 0.08, h * 0.04),
      stripe,
      ' opacity=".7"',
    ) +
    path(
      roundRect(x - w / 2 - 4, top + h * 0.6, w + 8, h * 0.07, h * 0.035),
      stripe,
      ' opacity=".6"',
    ) +
    path(
      smooth(
        [
          [x + w * 0.18, top],
          [x + w / 2 - 70, top],
          [x + w / 2 - 20, top + 24],
          [x + w / 2, baseY - h * 0.3],
          [x + w / 2 + 40, baseY + 10],
          [x + w * 0.24, baseY + 10],
        ],
        true,
      ),
      shade,
      ' opacity=".55"',
    )
  );
}

export function pond(
  x: number,
  y: number,
  rx: number,
  ry: number,
  water: string,
  light: string,
  rim: string,
): string {
  return (
    path(ellipse(x, y + ry * 0.12, rx * 1.06, ry * 1.12), rim) +
    path(ellipse(x, y, rx, ry), water) +
    stroke(
      curve(x - rx * 0.5, y - ry * 0.2, x - rx * 0.1, y - ry * 0.2, -ry * 0.12),
      light,
      ry * 0.12,
    ) +
    stroke(
      curve(x + rx * 0.1, y + ry * 0.25, x + rx * 0.45, y + ry * 0.25, -ry * 0.1),
      light,
      ry * 0.1,
    )
  );
}

export function fence(x1: number, x2: number, y: number, post: string, rail: string): string {
  let out =
    path(roundRect(x1, y - 74, x2 - x1, 14, 7), rail) +
    path(roundRect(x1, y - 40, x2 - x1, 14, 7), rail);
  for (let x = x1 + 10; x < x2; x += 80) {
    out += path(
      `M${x - 11} ${y + 4}L${x - 11} ${y - 86}L${x} ${y - 100}L${x + 11} ${y - 86}L${x + 11} ${y + 4}Z`,
      post,
    );
  }
  return out;
}

export function barn(
  x: number,
  y: number,
  s: number,
  wall: string,
  roof: string,
  trim: string,
  glass: string,
): string {
  const W = 340 * s;
  const H = 210 * s;
  const left = x - W / 2;
  const top = y - H;
  const roofD = `M${f(left - 20 * s)} ${f(top + 6 * s)}L${f(left + 40 * s)} ${f(top - 90 * s)}L${f(x)} ${f(top - 150 * s)}L${f(left + W - 40 * s)} ${f(top - 90 * s)}L${f(left + W + 20 * s)} ${f(top + 6 * s)}Z`;
  const gable = `M${f(left)} ${f(top)}L${f(left + 50 * s)} ${f(top - 80 * s)}L${f(x)} ${f(top - 132 * s)}L${f(left + W - 50 * s)} ${f(top - 80 * s)}L${f(left + W)} ${f(top)}Z`;
  const doorW = 120 * s;
  const doorH = 140 * s;
  const dl = x - doorW / 2;
  const dt = y - doorH;
  return (
    path(roofD, roof) +
    path(gable, wall) +
    path(roundRect(left, top - 2, W, H + 2, 6 * s), wall) +
    path(roundRect(dl - 8 * s, dt - 8 * s, doorW + 16 * s, doorH + 8 * s, 6 * s), trim) +
    path(roundRect(dl, dt, doorW, doorH, 4 * s), wall) +
    stroke(
      `M${f(dl)} ${f(dt)}L${f(dl + doorW)} ${f(y)}M${f(dl + doorW)} ${f(dt)}L${f(dl)} ${f(y)}`,
      trim,
      10 * s,
    ) +
    path(roundRect(x - 34 * s, top - 76 * s, 68 * s, 54 * s, 8 * s), trim) +
    path(roundRect(x - 26 * s, top - 68 * s, 52 * s, 38 * s, 5 * s), glass) +
    path(roundRect(left + 26 * s, top + 34 * s, 52 * s, 42 * s, 6 * s), trim) +
    path(roundRect(left + 32 * s, top + 40 * s, 40 * s, 30 * s, 4 * s), glass) +
    path(roundRect(left + W - 78 * s, top + 34 * s, 52 * s, 42 * s, 6 * s), trim) +
    path(roundRect(left + W - 72 * s, top + 40 * s, 40 * s, 30 * s, 4 * s), glass)
  );
}

export function silo(
  x: number,
  y: number,
  s: number,
  wall: string,
  roof: string,
  band: string,
): string {
  const W = 110 * s;
  const H = 300 * s;
  return (
    path(roundRect(x - W / 2, y - H, W, H + 2, 8 * s), wall) +
    path(
      `M${f(x - W / 2 - 6 * s)} ${f(y - H + 4 * s)}A${f(W / 2 + 6 * s)} ${f(70 * s)} 0 0 1 ${f(x + W / 2 + 6 * s)} ${f(y - H + 4 * s)}Z`,
      roof,
    ) +
    [0.25, 0.5, 0.75]
      .map((k) => path(roundRect(x - W / 2, y - H + H * k, W, 10 * s, 3 * s), band))
      .join('')
  );
}

export function haystack(x: number, y: number, s: number, color: string, dark: string): string {
  const d = `M${f(x - 110 * s)} ${f(y + 4)}C${f(x - 110 * s)} ${f(y - 140 * s)} ${f(x + 110 * s)} ${f(y - 140 * s)} ${f(x + 110 * s)} ${f(y + 4)}Z`;
  let out = path(d, color);
  for (let i = -3; i <= 3; i++) {
    out += stroke(
      curve(x + i * 26 * s, y - 6 * s, x + i * 18 * s, y - 80 * s, i * 4 * s),
      dark,
      4 * s,
    );
  }
  return out;
}

export function sunflower(
  x: number,
  y: number,
  s: number,
  petal: string,
  center: string,
  stem: string,
): string {
  return (
    stroke(`M${f(x)} ${f(y)}L${f(x)} ${f(y - 150 * s)}`, stem, 9 * s) +
    path(leaf(x, y - 60 * s, 46 * s, 12 * s, -30), stem) +
    path(leaf(x, y - 90 * s, 42 * s, 11 * s, -150), stem) +
    path(spiky(x, y - 170 * s, 46 * s, 26 * s, 14, 0, 0.55), petal) +
    path(circle(x, y - 170 * s, 22 * s), center)
  );
}

export function vine(
  x: number,
  y: number,
  len: number,
  s: number,
  color: string,
  leafColor: string,
  seed: number,
): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  for (let i = 0; i <= 6; i++) pts.push([x + Math.sin(i * 1.3 + seed) * 18 * s, y + (len * i) / 6]);
  let out = path(tube(pts, 4.5 * s), color);
  for (let i = 1; i < 12; i++) {
    const k = i / 12;
    const px = x + Math.sin(k * 6 * 1.3 + seed) * 18 * s;
    const py = y + len * k;
    out += path(
      leaf(px, py, 30 * s, 9 * s, r() < 0.5 ? 30 + range(r, -20, 20) : 150 + range(r, -20, 20)),
      leafColor,
    );
  }
  return out;
}

export function fern(x: number, y: number, s: number, color: string, dark: string): string {
  let out = '';
  [-150, -125, -100, -78, -55, -30].forEach((a, i) => {
    const len = (120 + (i % 3) * 30) * s;
    const rad = (a * Math.PI) / 180;
    const tx = x + Math.cos(rad) * len;
    const ty = y + Math.sin(rad) * len;
    out += path(leaf(x, y, len, 18 * s, a), i % 2 ? dark : color);
    out += stroke(curve(x, y, tx, ty, 0), dark, 2.5 * s, ' opacity=".5"');
  });
  return out;
}

export function bigLeaf(
  x: number,
  y: number,
  s: number,
  angle: number,
  color: string,
  vein: string,
): string {
  const len = 180 * s;
  const rad = (angle * Math.PI) / 180;
  const tx = x + Math.cos(rad) * len;
  const ty = y + Math.sin(rad) * len;
  return (
    path(leaf(x, y, len, 56 * s, angle), color) +
    stroke(`M${f(x)} ${f(y)}L${f(tx)} ${f(ty)}`, vein, 4 * s)
  );
}

export function waterfall(
  x: number,
  top: number,
  w: number,
  h: number,
  water: string,
  light: string,
  foam: string,
): string {
  let out = path(roundRect(x - w / 2, top, w, h, w * 0.1), water);
  for (let i = 0; i < 5; i++) {
    const lx = x - w / 2 + (w * (i + 0.5)) / 5;
    out += stroke(
      `M${f(lx)} ${f(top + 30)}L${f(lx)} ${f(top + h - 40)}`,
      light,
      w * 0.05,
      ' opacity=".6"',
    );
  }
  out += path(scallop(x, top + h, 1, 10, w * 0.12, 0, w * 0.75, w * 0.22), foam);
  return out;
}

export function ruins(
  x: number,
  y: number,
  s: number,
  stone: string,
  shade: string,
  moss: string,
): string {
  const block = (bx: number, by: number, bw: number, bh: number) =>
    path(roundRect(x + bx * s, y + by * s, bw * s, bh * s, 8 * s), stone) +
    path(roundRect(x + bx * s, y + (by + bh - 12) * s, bw * s, 12 * s, 6 * s), shade);
  return (
    block(-180, -60, 120, 60) +
    block(-160, -120, 90, 60) +
    block(60, -60, 120, 60) +
    block(70, -120, 100, 60) +
    block(80, -180, 80, 60) +
    path(
      `M${f(x - 70 * s)} ${f(y + 2)}L${f(x - 70 * s)} ${f(y - 170 * s)}Q${f(x)} ${f(y - 250 * s)} ${f(x + 70 * s)} ${f(y - 170 * s)}L${f(x + 70 * s)} ${f(y + 2)}L${f(x + 40 * s)} ${f(y + 2)}L${f(x + 40 * s)} ${f(y - 150 * s)}Q${f(x)} ${f(y - 200 * s)} ${f(x - 40 * s)} ${f(y - 150 * s)}L${f(x - 40 * s)} ${f(y + 2)}Z`,
      stone,
    ) +
    path(scallop(x - 120 * s, y - 124 * s, 1, 6, 8 * s, 0, 46 * s, 12 * s), moss) +
    path(scallop(x + 110 * s, y - 182 * s, 1, 6, 8 * s, 0, 40 * s, 10 * s), moss) +
    path(scallop(x - 10 * s, y - 214 * s, 1, 6, 8 * s, 0, 42 * s, 12 * s), moss)
  );
}

export function coral(
  x: number,
  y: number,
  s: number,
  color: string,
  kind: 'branch' | 'fan' | 'brain',
): string {
  if (kind === 'brain') {
    return (
      path(
        `M${f(x - 70 * s)} ${f(y + 4)}C${f(x - 70 * s)} ${f(y - 100 * s)} ${f(x + 70 * s)} ${f(y - 100 * s)} ${f(x + 70 * s)} ${f(y + 4)}Z`,
        color,
      ) +
      stroke(
        `M${f(x - 46 * s)} ${f(y - 20 * s)}q12 -30 24 0t24 0t24 0`,
        '#ffffff',
        5 * s,
        ' opacity=".35"',
      )
    );
  }
  if (kind === 'fan') {
    let out = path(scallop(x, y - 90 * s, 1, 12, 12 * s, 0, 84 * s, 80 * s), color);
    out += path(roundRect(x - 10 * s, y - 40 * s, 20 * s, 44 * s, 8 * s), color);
    return out;
  }
  const branch = (pts: Pt[], r0: number) =>
    path(
      tube(
        pts.map(([px, py]) => [x + px * s, y + py * s]),
        (u) => (r0 - r0 * 0.35 * u) * s,
      ),
      color,
    );
  return (
    branch(
      [
        [0, 4],
        [0, -80],
        [-10, -150],
      ],
      18,
    ) +
    branch(
      [
        [0, -60],
        [-50, -100],
        [-60, -150],
      ],
      13,
    ) +
    branch(
      [
        [0, -50],
        [50, -90],
        [62, -140],
      ],
      13,
    ) +
    branch(
      [
        [-8, -120],
        [24, -160],
        [28, -190],
      ],
      10,
    )
  );
}

export function seaweed(
  x: number,
  y: number,
  h: number,
  s: number,
  color: string,
  seed: number,
): string {
  const pts: Pt[] = [];
  for (let i = 0; i <= 6; i++) pts.push([x + Math.sin(i * 1.1 + seed) * 22 * s, y - (h * i) / 6]);
  return path(
    tube(pts, (u) => (16 - 10 * u) * s),
    color,
  );
}

export function shell(x: number, y: number, s: number, color: string, ridge: string): string {
  let out = path(
    `M${f(x - 40 * s)} ${f(y)}A${f(40 * s)} ${f(40 * s)} 0 0 1 ${f(x + 40 * s)} ${f(y)}L${f(x + 8 * s)} ${f(y + 14 * s)}L${f(x - 8 * s)} ${f(y + 14 * s)}Z`,
    color,
  );
  for (let i = -2; i <= 2; i++) {
    out += stroke(
      `M${f(x)} ${f(y + 10 * s)}L${f(x + i * 15 * s)} ${f(y - 30 * s + Math.abs(i) * 8 * s)}`,
      ridge,
      3 * s,
    );
  }
  return out;
}

export function lightRays(
  x: number,
  w: number,
  h: number,
  color: string,
  count: number,
  seed: number,
): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) {
    const cx = x + range(r, 0, w);
    const tw = range(r, 60, 140);
    const lean = range(r, 120, 260);
    out += path(
      poly([
        [cx - tw / 2, 0],
        [cx + tw / 2, 0],
        [cx + lean + tw, h],
        [cx + lean - tw * 0.3, h],
      ]),
      color,
      ` opacity="${f(range(r, 0.06, 0.14))}"`,
    );
  }
  return out;
}

export function termiteMound(
  x: number,
  y: number,
  s: number,
  color: string,
  shade: string,
): string {
  const body = smooth([
    [x - 70 * s, y + 4],
    [x - 52 * s, y - 80 * s],
    [x - 40 * s, y - 160 * s],
    [x - 20 * s, y - 230 * s],
    [x - 2 * s, y - 250 * s],
    [x + 18 * s, y - 220 * s],
    [x + 26 * s, y - 170 * s],
    [x + 44 * s, y - 150 * s],
    [x + 50 * s, y - 80 * s],
    [x + 74 * s, y + 4],
  ]);
  return (
    path(body, color) +
    path(
      smooth([
        [x + 4 * s, y - 240 * s],
        [x + 18 * s, y - 220 * s],
        [x + 26 * s, y - 170 * s],
        [x + 44 * s, y - 150 * s],
        [x + 50 * s, y - 80 * s],
        [x + 74 * s, y + 4],
        [x + 20 * s, y + 4],
        [x + 12 * s, y - 120 * s],
      ]),
      shade,
      ' opacity=".6"',
    )
  );
}

export function layered(items: [number, string][]): string {
  return items
    .slice()
    .sort((a, b) => a[0] - b[0])
    .map(([, svg]) => svg)
    .join('');
}

export function scatterItems(
  seed: number,
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): [number, string][] {
  const r = rng(seed);
  const out: [number, string][] = [];
  for (let i = 0; i < count; i++) {
    const x = range(r, x0, x1);
    const y = range(r, y0, y1);
    out.push([y, draw(x, y, r)]);
  }
  return out;
}

export function scatter(
  seed: number,
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  draw: (x: number, y: number, r: () => number) => string,
): string {
  const r = rng(seed);
  let out = '';
  for (let i = 0; i < count; i++) out += draw(range(r, x0, x1), range(r, y0, y1), r);
  return out;
}
