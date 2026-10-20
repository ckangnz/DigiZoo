import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  leaf,
  mirrorPath,
  pathBounds,
  roundRect,
  rotatePath,
  smooth,
  spiky,
  tube,
  type Pt,
} from '../core/paths';
import { group, linearGradient, path, radialGlow, starField, stroke } from './props';
import { range, rng } from './rng';
import type { Interactive, Palette, SceneDef } from './types';

const W = 3600;
const H = 2000;
const CX = 1800;
const LINE = 7;

type Bezier = [Pt, Pt, Pt];
type Box = [number, number, number, number];
type Piece = { d: string; fill: string; alpha?: number };

const ARM: Bezier = [
  [1532, 712],
  [1444, 962],
  [1350, 1222],
];
const ARM_R: [number, number] = [76, 58];
const LEG: Bezier = [
  [1665, 1450],
  [1660, 1660],
  [1668, 1842],
];
const LEG_R: [number, number] = [118, 86];
const HEAD = { x: CX, y: 300, rx: 252, ry: 240 };
const TUMMY = { x: CX, y: 1262, rx: 226, ry: 236 };

function at([a, b, c]: Bezier, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
    u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
  ];
}

function dirAt([a, b, c]: Bezier, t: number): Pt {
  const dx = 2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]);
  const dy = 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1]);
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

function edge(
  c: Bezier,
  r: [number, number],
  t0: number,
  t1: number,
  n: number,
  side: number,
): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [x, y] = at(c, t);
    const [dx, dy] = dirAt(c, t);
    const rr = r[0] + (r[1] - r[0]) * t;
    out.push([x - dy * rr * side, y + dx * rr * side]);
  }
  return out;
}

const mirrorPts = (pts: Pt[]): Pt[] => pts.map(([x, y]): Pt => [2 * CX - x, y]);

function boxOf(ds: string[], pad: number): Box {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const d of ds) {
    const b = pathBounds(d);
    x0 = Math.min(x0, b.minX);
    y0 = Math.min(y0, b.minY);
    x1 = Math.max(x1, b.maxX);
    y1 = Math.max(y1, b.maxY);
  }
  return [
    Math.floor(x0 - pad),
    Math.floor(y0 - pad),
    Math.ceil(x1 - x0 + pad * 2),
    Math.ceil(y1 - y0 + pad * 2),
  ];
}

function outlined(ds: string[], fill: string, line: string, width = LINE): string {
  return (
    ds
      .map(
        (d) =>
          `<path d="${d}" fill="${line}" stroke="${line}" stroke-width="${f(width * 2)}" stroke-linejoin="round"/>`,
      )
      .join('') + ds.map((d) => path(d, fill)).join('')
  );
}

function clipped(id: string, ds: string[], content: string): string {
  return (
    `<defs><clipPath id="${id}">${ds.map((d) => `<path d="${d}"/>`).join('')}</clipPath></defs>` +
    group(content, '', ` clip-path="url(#${id})"`)
  );
}

const BODY_D = (() => {
  const left: Pt[] = [
    [1742, 504],
    [1738, 572],
    [1720, 616],
    [1644, 640],
    [1560, 658],
    ...edge(ARM, ARM_R, 0.02, 1.05, 7, 1),
    ...edge(ARM, ARM_R, 1.05, 0.3, 6, -1),
    [1542, 918],
    [1532, 1030],
    [1524, 1150],
    [1522, 1270],
    [1528, 1380],
    [1542, 1450],
    ...edge(LEG, LEG_R, 0.12, 1, 6, 1),
    [1668, 1882],
    ...edge(LEG, LEG_R, 1, 0.2, 5, -1),
  ];
  return smooth([[CX, 500], ...left, [CX, 1522], ...mirrorPts(left).reverse()], true);
})();

const HEAD_D = ellipse(HEAD.x, HEAD.y, HEAD.rx, HEAD.ry);
const EARS = [ellipse(1550, 326, 44, 62), ellipse(2050, 326, 44, 62)];
const CURL = `M${CX} ${HEAD.y - HEAD.ry + 6}C1790 22 1850 10 1852 44C1854 68 1822 68 1826 48`;

const HAND_L = (() => {
  const [wx, wy] = at(ARM, 1);
  const [dx, dy] = dirAt(ARM, 1);
  const nx = -dy;
  const ny = dx;
  const pt = (a: number, b: number): Pt => [wx + dx * a + nx * b, wy + dy * a + ny * b];
  const limb = (base: Pt, deg: number, len: number, r0: number, r1: number) => {
    const r = (deg * Math.PI) / 180;
    const ux = dx * Math.cos(r) + nx * Math.sin(r);
    const uy = dy * Math.cos(r) + ny * Math.sin(r);
    return capsule(base[0], base[1], base[0] + ux * len, base[1] + uy * len, r0, r1);
  };
  const crease = (a0: number, a1: number, b: number) => {
    const [x0, y0] = pt(a0, b);
    const [x1, y1] = pt(a1, b);
    return `M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`;
  };
  const palm = pt(56, 0);
  return {
    shapes: [
      ellipse(palm[0], palm[1], 68, 64, (Math.atan2(ny, nx) * 180) / Math.PI),
      limb(pt(84, 40), 14, 58, 20, 18),
      limb(pt(90, 13), 4, 68, 20, 18),
      limb(pt(88, -13), -5, 64, 20, 18),
      limb(pt(80, -38), -14, 52, 19, 17),
      limb(pt(50, 52), 48, 52, 21, 19),
    ],
    creases: [crease(140, 118, 33), crease(150, 126, 0), crease(132, 110, -33)],
  };
})();
const HAND_R = {
  shapes: HAND_L.shapes.map((d) => mirrorPath(d, CX)),
  creases: HAND_L.creases.map((d) => mirrorPath(d, CX)),
};
const WRIST_L = at(ARM, 1);
const WRIST_R: Pt = [2 * CX - WRIST_L[0], WRIST_L[1]];

const TOES: [number, number, number][] = [
  [1580, 1944, 14],
  [1608, 1952, 15],
  [1638, 1956, 16],
  [1670, 1957, 17],
  [1706, 1953, 20],
];
const FOOT_L = [
  smooth(
    [
      [1740, 1874],
      [1764, 1910],
      [1744, 1948],
      [1660, 1960],
      [1574, 1956],
      [1540, 1928],
      [1560, 1890],
      [1640, 1870],
    ],
    true,
  ),
  ...TOES.map(([x, y, r]) => circle(x, y, r)),
];
const FOOT_R = FOOT_L.map((d) => mirrorPath(d, CX));

const TUMMY_D = ellipse(TUMMY.x, TUMMY.y, TUMMY.rx, TUMMY.ry);

function blob(seed: number, x: number, y: number, rx: number, ry: number, jitter: number): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + range(r, -jitter, jitter);
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

function cell(
  x: number,
  y: number,
  r: number,
  fill: string,
  ring: string,
  core: string,
  light: string,
): string {
  return (
    `<path d="${circle(x, y, r)}" fill="${fill}" stroke="${ring}" stroke-width="${f(r * 0.14)}"/>` +
    path(circle(x + r * 0.16, y + r * 0.1, r * 0.38), core) +
    path(circle(x - r * 0.38, y + r * 0.34, r * 0.09), core) +
    path(circle(x + r * 0.46, y - r * 0.36, r * 0.07), core) +
    stroke(curve(x - r * 0.2, y - r * 0.64, x - r * 0.64, y - r * 0.16, r * 0.16), light, r * 0.1)
  );
}

function plus(x: number, y: number, s: number, color: string): string {
  return (
    path(roundRect(x - s, y - s * 0.34, s * 2, s * 0.68, s * 0.3), color) +
    path(roundRect(x - s * 0.34, y - s, s * 0.68, s * 2, s * 0.3), color)
  );
}

function heartShape(x: number, y: number, s: number): string {
  return `M${f(x)} ${f(y + s * 0.9)}C${f(x - s * 1.3)} ${f(y + s * 0.1)} ${f(x - s * 0.9)} ${f(y - s * 0.9)} ${f(x)} ${f(y - s * 0.35)}C${f(x + s * 0.9)} ${f(y - s * 0.9)} ${f(x + s * 1.3)} ${f(y + s * 0.1)} ${f(x)} ${f(y + s * 0.9)}Z`;
}

function sparkle(x: number, y: number, s: number, color: string): string {
  return path(spiky(x, y, s, s * 0.3, 4, -90, 0.4), color);
}

function backdrop(p: Palette, mode: string): string {
  let out =
    `<defs>${linearGradient('bodyBg', [
      [0, p.bgTop],
      [1, p.bgBottom],
    ])}${radialGlow('bodyHalo', p.halo, mode === 'day' ? 0.85 : 0.45)}</defs>` +
    `<rect width="${W}" height="${H}" fill="url(#bodyBg)"/>`;
  const blobs: [number, number, number, number, number, string][] = [
    [3, 380, 360, 420, 330, p.blobPink],
    [5, 3240, 330, 470, 320, p.blobMint],
    [7, 260, 1500, 420, 470, p.blobLilac],
    [9, 3330, 1560, 440, 420, p.blobLemon],
    [11, 2760, 1040, 330, 300, p.blobSky],
    [13, 760, 1060, 300, 330, p.blobPeach],
    [15, 1240, 220, 260, 190, p.blobMint],
    [17, 2380, 240, 280, 200, p.blobLilac],
    [19, 1080, 1760, 300, 220, p.blobSky],
    [21, 2560, 1800, 320, 220, p.blobPink],
  ];
  out += blobs.map(([s, x, y, rx, ry, c]) => path(blob(s, x, y, rx, ry, 0.12), c)).join('');
  out += `<ellipse cx="${CX}" cy="1010" rx="1120" ry="1060" fill="url(#bodyHalo)"/>`;
  const r = rng(41);
  for (let i = 0; i < 150; i++) {
    const x = range(r, 20, W - 20);
    const y = range(r, 20, H - 20);
    out += path(circle(x, y, range(r, 4, 9)), p.dot, ` fill-opacity="${f(range(r, 0.35, 0.8))}"`);
  }
  const cells: [number, number, number, number][] = [
    [140, 220, 54, 0],
    [620, 160, 40, 1],
    [930, 420, 34, 2],
    [190, 900, 70, 3],
    [520, 1180, 46, 1],
    [140, 1900, 60, 0],
    [856, 1878, 32, 2],
    [2560, 140, 46, 3],
    [3000, 120, 36, 0],
    [3530, 930, 50, 1],
    [3120, 760, 38, 2],
    [2470, 1560, 40, 3],
    [3480, 1940, 52, 2],
    [2980, 1930, 34, 1],
    [1180, 1500, 36, 2],
    [2420, 1300, 30, 0],
    [1170, 650, 30, 3],
    [2440, 620, 34, 1],
  ];
  const tints = [
    [p.cellPink, p.cellPinkRing, p.cellPinkCore],
    [p.cellMint, p.cellMintRing, p.cellMintCore],
    [p.cellLilac, p.cellLilacRing, p.cellLilacCore],
    [p.cellSky, p.cellSkyRing, p.cellSkyCore],
  ];
  out += cells
    .map(([x, y, rr, k]) => cell(x, y, rr, tints[k][0], tints[k][1], tints[k][2], p.gloss))
    .join('');
  const pluses: [number, number, number][] = [
    [420, 620, 22],
    [1010, 120, 16],
    [2700, 420, 18],
    [3380, 1180, 22],
    [300, 1240, 16],
    [2350, 1900, 18],
    [3060, 1500, 16],
  ];
  out += pluses.map(([x, y, s]) => plus(x, y, s, p.plus)).join('');
  const hearts: [number, number, number][] = [
    [880, 600, 18],
    [2900, 260, 18],
    [380, 1720, 22],
    [3200, 1300, 18],
    [1250, 900, 14],
    [2380, 980, 16],
  ];
  out += hearts.map(([x, y, s]) => path(heartShape(x, y, s), p.heartDeco)).join('');
  const sparks: [number, number, number][] = [
    [560, 460, 22],
    [3100, 560, 26],
    [1200, 1220, 18],
    [2420, 1120, 18],
    [420, 1380, 18],
    [3280, 1720, 22],
    [2200, 140, 20],
    [1400, 100, 16],
  ];
  out += sparks.map(([x, y, s]) => sparkle(x, y, s, p.sparkle)).join('');
  if (mode === 'night') out += starField(17, 70, 30, 30, W - 30, H - 120, '#fff6d6');
  return out;
}

function heightChart(p: Palette): string {
  const x = 1036;
  const w = 118;
  const top = 168;
  const bottom = 1950;
  const colors = [p.chart1, p.chart2, p.chart3, p.chart4, p.chart5, p.chart6, p.chart7];
  const inner = roundRect(x - w / 2, top, w, bottom - top, 34);
  const bh = (bottom - top) / colors.length;
  let bands = '';
  colors.forEach((c, i) => {
    bands += `<rect x="${f(x - w / 2)}" y="${f(bottom - (i + 1) * bh)}" width="${w}" height="${f(bh + 1)}" fill="${c}"/>`;
  });
  let ticks = '';
  for (let k = 1; (bottom - top) / 50 > k; k++) {
    const y = bottom - k * 50;
    const long = k % 4 === 0;
    ticks += stroke(
      `M${f(x + w / 2 - (long ? 60 : 32))} ${f(y)}L${f(x + w / 2 - 4)} ${f(y)}`,
      p.chartTick,
      long ? 9 : 6,
    );
    if (long) ticks += path(circle(x - w / 2 + 26, y, 9), p.chartTick);
  }
  const sx = x;
  const sy = top - 52;
  return (
    path(roundRect(x - w / 2 - 14, top - 14, w + 28, bottom - top + 28, 46), p.chartFrame) +
    clipped('bodyChartClip', [inner], bands + ticks) +
    path(spiky(sx, sy, 84, 40, 5, -90, 0.55), p.chartFrame) +
    path(spiky(sx, sy, 70, 33, 5, -90, 0.55), p.star) +
    path(ellipse(sx - 18, sy - 2, 7, 9), p.face) +
    path(ellipse(sx + 18, sy - 2, 7, 9), p.face) +
    stroke(curve(sx - 12, sy + 14, sx + 12, sy + 14, 7), p.face, 5) +
    path(ellipse(sx - 32, sy + 12, 9, 6), p.blush, ' fill-opacity=".6"') +
    path(ellipse(sx + 32, sy + 12, 9, 6), p.blush, ' fill-opacity=".6"')
  );
}

function toothpaste(x: number, y: number, p: Palette): string {
  const body = `M${x} ${y - 62}L${x + 40} ${y - 60}C${x + 150} ${y - 54} ${x + 226} ${y - 46} ${x + 258} ${y - 30}Q${x + 280} ${y - 20} ${x + 280} ${y - 10}L${x + 280} ${y + 10}Q${x + 280} ${y + 20} ${x + 258} ${y + 30}C${x + 226} ${y + 46} ${x + 150} ${y + 54} ${x + 40} ${y + 60}L${x} ${y + 62}Z`;
  const tooth = `M${x + 104} ${y - 26}C${x + 116} ${y - 34} ${x + 128} ${y - 30} ${x + 134} ${y - 24}C${x + 140} ${y - 30} ${x + 152} ${y - 34} ${x + 164} ${y - 26}C${x + 176} ${y - 14} ${x + 168} ${y + 8} ${x + 162} ${y + 28}C${x + 158} ${y + 38} ${x + 148} ${y + 36} ${x + 146} ${y + 26}L${x + 142} ${y + 12}Q${x + 134} ${y + 4} ${x + 126} ${y + 12}L${x + 122} ${y + 26}C${x + 120} ${y + 36} ${x + 110} ${y + 38} ${x + 106} ${y + 28}C${x + 100} ${y + 8} ${x + 92} ${y - 14} ${x + 104} ${y - 26}Z`;
  let zig = `M${x - 18} ${y - 54}`;
  for (let i = 1; i <= 8; i++) zig += `L${x - 18 + (i % 2 ? 8 : 0)} ${y - 54 + i * 13.5}`;
  return (
    path(body, p.tube) +
    path(
      `M${x + 70} ${y - 58}L${x + 200} ${y - 50}L${x + 200} ${y + 50}L${x + 70} ${y + 58}Z`,
      p.tubeStripe,
    ) +
    path(tooth, p.tube) +
    path(roundRect(x + 276, y - 16, 24, 32, 6), p.tubeCrimp) +
    path(roundRect(x + 296, y - 30, 60, 60, 14), p.tubeCap) +
    [312, 326, 340]
      .map((dx) => stroke(`M${x + dx} ${y - 20}L${x + dx} ${y + 20}`, p.tubeCapDark, 5))
      .join('') +
    path(roundRect(x - 30, y - 68, 36, 136, 8), p.tubeCrimp) +
    stroke(zig, p.tubeCapDark, 4, ' stroke-opacity=".5"')
  );
}

function monitor(x: number, y: number, p: Palette): string {
  const w = 500;
  const h = 290;
  const sx = x + 34;
  const sy = y + 30;
  const sw = w - 68;
  const sh = h - 92;
  const mid = sy + sh * 0.58;
  const ecg = `M${sx + 10} ${mid}L${sx + 90} ${mid}Q${sx + 104} ${mid - 26} ${sx + 118} ${mid}L${sx + 140} ${mid}L${sx + 160} ${mid + 30}L${sx + 186} ${mid - 92}L${sx + 214} ${mid + 50}L${sx + 236} ${mid}L${sx + 262} ${mid}Q${sx + 282} ${mid - 34} ${sx + 302} ${mid}L${sx + sw - 10} ${mid}`;
  return (
    path(roundRect(x + 70, y + h - 8, 70, 40, 14), p.monitorDark) +
    path(roundRect(x + w - 140, y + h - 8, 70, 40, 14), p.monitorDark) +
    path(roundRect(x, y, w, h, 46), p.monitor) +
    path(roundRect(sx, sy, sw, sh, 28), p.screen) +
    stroke(ecg, p.ecg, 10) +
    path(heartShape(sx + sw - 50, sy + 46, 22), p.ecgHeart) +
    path(circle(x + 70, y + h - 32, 13), p.monitorDark) +
    path(circle(x + 110, y + h - 32, 13), p.monitorDark) +
    path(roundRect(x + w - 170, y + h - 44, 120, 24, 12), p.monitorDark)
  );
}

function appleAndMilk(x: number, y: number, p: Palette): string {
  const apple =
    path(
      `M${x} ${y - 70}C${x - 40} ${y - 104} ${x - 112} ${y - 86} ${x - 112} ${y - 10}C${x - 112} ${y + 64} ${x - 50} ${y + 104} ${x} ${y + 84}C${x + 50} ${y + 104} ${x + 112} ${y + 64} ${x + 112} ${y - 10}C${x + 112} ${y - 86} ${x + 40} ${y - 104} ${x} ${y - 70}Z`,
      p.apple,
    ) +
    path(ellipse(x - 54, y - 30, 20, 30, 20), p.gloss, ' fill-opacity=".45"') +
    stroke(`M${x} ${y - 66}Q${x + 4} ${y - 100} ${x + 16} ${y - 116}`, p.stem, 12) +
    path(leaf(x + 12, y - 98, 70, 22, -28), p.leaf);
  const gx = x + 170;
  const gy = y + 92;
  const glass = `M${gx - 66} ${gy - 230}L${gx + 66} ${gy - 230}L${gx + 54} ${gy - 12}Q${gx + 52} ${gy} ${gx + 40} ${gy}L${gx - 40} ${gy}Q${gx - 52} ${gy} ${gx - 54} ${gy - 12}Z`;
  const milk = `M${gx - 60} ${gy - 170}Q${gx - 30} ${gy - 184} ${gx} ${gy - 170}Q${gx + 30} ${gy - 156} ${gx + 60} ${gy - 170}L${gx + 50} ${gy - 14}Q${gx + 48} ${gy - 6} ${gx + 38} ${gy - 6}L${gx - 38} ${gy - 6}Q${gx - 48} ${gy - 6} ${gx - 50} ${gy - 14}Z`;
  return (
    stroke(`M${gx + 10} ${gy - 120}L${gx + 44} ${gy - 290}L${gx + 92} ${gy - 300}`, p.straw, 18) +
    path(glass, p.glass) +
    path(milk, p.milk) +
    stroke(`M${gx - 40} ${gy - 200}L${gx - 34} ${gy - 40}`, p.gloss, 10, ' stroke-opacity=".8"') +
    apple
  );
}

function soap(x: number, y: number, p: Palette): string {
  const w = 240;
  const h = 116;
  const bubbles: [number, number, number][] = [
    [x - 72, y - 92, 30],
    [x + 8, y - 118, 22],
    [x + 84, y - 98, 36],
    [x - 22, y - 182, 17],
    [x + 58, y - 196, 25],
    [x - 96, y - 160, 12],
  ];
  return (
    path(roundRect(x - w / 2, y - h / 2 + 16, w, h, 46), p.soapDark) +
    path(roundRect(x - w / 2, y - h / 2, w, h, 46), p.soap) +
    path(roundRect(x - w / 2 + 28, y - h / 2 + 16, w - 56, h - 46, 30), p.soapLight) +
    path(heartShape(x, y - 8, 18), p.soap) +
    bubbles
      .map(
        ([bx, by, r]) =>
          `<path d="${circle(bx, by, r)}" fill="${p.bubble}" fill-opacity=".45" stroke="${p.bubbleLine}" stroke-width="${f(r * 0.16)}"/>` +
          stroke(
            curve(bx - r * 0.55, by - r * 0.1, bx - r * 0.1, by - r * 0.55, r * 0.14),
            p.gloss,
            r * 0.16,
          ),
      )
      .join('')
  );
}

function dna(x: number, top: number, bottom: number, p: Palette): string {
  const n = 64;
  const a: Pt[] = [];
  const b: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const y = top + ((bottom - top) * i) / n;
    const ph = (i / n) * Math.PI * 5;
    a.push([x + Math.sin(ph) * 62, y]);
    b.push([x - Math.sin(ph) * 62, y]);
  }
  let rungs = '';
  const colors = [p.rung1, p.rung2, p.rung3, p.rung4];
  for (let i = 2; i < n; i += 4) {
    rungs += stroke(
      `M${f(a[i][0])} ${f(a[i][1])}L${f(b[i][0])} ${f(b[i][1])}`,
      colors[(i / 2) % 4],
      12,
    );
  }
  return rungs + stroke(smooth(a, false), p.dnaA, 18) + stroke(smooth(b, false), p.dnaB, 18);
}

function figure(p: Palette): string {
  const knees = [1663, 1937]
    .map((x) => stroke(curve(x - 40, 1690, x + 40, 1690, 16), p.bodyRim, 8))
    .join('');
  const details =
    stroke(curve(1690, 662, 1770, 676, -10), p.bodyRim, 8) +
    stroke(curve(1830, 676, 1910, 662, -10), p.bodyRim, 8) +
    knees +
    path(ellipse(1630, 790, 60, 100, -12), p.gloss, ' fill-opacity=".4"') +
    path(ellipse(1442, 850, 24, 86, 18), p.gloss, ' fill-opacity=".4"') +
    path(ellipse(1606, 1620, 26, 100, 2), p.gloss, ' fill-opacity=".4"');
  return (
    path(ellipse(CX, 1960, 330, 30), p.shadow, ' fill-opacity=".45"') +
    `<path d="${BODY_D}" fill="${p.bodyLine}" stroke="${p.bodyLine}" stroke-width="${LINE * 2}" stroke-linejoin="round"/>` +
    path(BODY_D, p.body) +
    clipped('bodyClip', [BODY_D], stroke(BODY_D, p.bodyRim, 64) + details)
  );
}

function headArt(p: Palette, mode: string): string {
  const { x, y } = HEAD;
  const ey = y + 52;
  const eyes =
    mode === 'day'
      ? [x - 88, x + 88]
          .map(
            (ex) =>
              path(ellipse(ex, ey, 25, 33), p.eye) +
              path(circle(ex + 9, ey - 12, 8.5), p.gloss) +
              path(circle(ex - 7, ey + 12, 4), p.gloss),
          )
          .join('')
      : [x - 88, x + 88]
          .map((ex) => stroke(curve(ex - 30, ey, ex + 30, ey, 16), p.eye, 9))
          .join('');
  const my = y + 138;
  const mouth =
    mode === 'day'
      ? path(
          `M${x - 64} ${my}Q${x} ${my + 12} ${x + 64} ${my}Q${x + 58} ${my + 70} ${x} ${my + 74}Q${x - 58} ${my + 70} ${x - 64} ${my}Z`,
          p.mouth,
        ) +
        path(
          `M${x - 36} ${my + 52}Q${x} ${my + 30} ${x + 36} ${my + 52}Q${x + 20} ${my + 70} ${x} ${my + 71}Q${x - 20} ${my + 70} ${x - 36} ${my + 52}Z`,
          p.tongue,
        ) +
        path(roundRect(x - 44, my + 4, 88, 16, 8), p.teeth)
      : stroke(curve(x - 40, my + 20, x + 40, my + 20, 22), p.mouth, 9);
  return (
    outlined(EARS, p.body, p.bodyLine) +
    clipped('earClip', EARS, EARS.map((d) => stroke(d, p.bodyRim, 36)).join('')) +
    stroke(curve(1546, 300, 1546, 356, 18), p.bodyLine, 7, ' stroke-opacity=".6"') +
    stroke(curve(2054, 356, 2054, 300, 18), p.bodyLine, 7, ' stroke-opacity=".6"') +
    outlined([HEAD_D], p.body, p.bodyLine) +
    clipped(
      'headClip',
      [HEAD_D],
      stroke(HEAD_D, p.bodyRim, 64) +
        path(ellipse(x - 124, y - 112, 66, 40, -32), p.gloss, ' fill-opacity=".45"'),
    ) +
    stroke(CURL, p.bodyLine, 11) +
    path(ellipse(x - 150, ey + 74, 44, 26), p.blush, ' fill-opacity=".55"') +
    path(ellipse(x + 150, ey + 74, 44, 26), p.blush, ' fill-opacity=".55"') +
    eyes +
    stroke(curve(x - 14, y + 104, x + 14, y + 104, 8), p.bodyLine, 7) +
    mouth
  );
}

function handArt(hand: { shapes: string[]; creases: string[] }, p: Palette): string {
  return (
    outlined(hand.shapes, p.body, p.bodyLine) +
    hand.creases.map((d) => stroke(d, p.bodyLine, 6, ' stroke-opacity=".5"')).join('')
  );
}

function feetArt(p: Palette): string {
  const creases = TOES.slice(1)
    .map(([x, y, r], i) => {
      const gx = (x - r + TOES[i][0] + TOES[i][2]) / 2;
      const d = `M${f(gx)} ${f(y + r * 0.2)}L${f(gx + 2)} ${f(y - r * 0.9)}`;
      return (
        stroke(d, p.bodyLine, 5, ' stroke-opacity=".5"') +
        stroke(mirrorPath(d, CX), p.bodyLine, 5, ' stroke-opacity=".5"')
      );
    })
    .join('');
  return outlined([...FOOT_L, ...FOOT_R], p.body, p.bodyLine) + creases;
}

function tummyArt(p: Palette): string {
  const { x, y } = TUMMY;
  return (
    path(TUMMY_D, p.tummy) +
    stroke(TUMMY_D, p.tummyLine, 8, ' stroke-dasharray="2 22"') +
    stroke(curve(x - 16, y + 70, x + 16, y + 70, 12), p.bodyLine, 7) +
    path(ellipse(x - 96, y - 110, 50, 30, -30), p.gloss, ' fill-opacity=".55"')
  );
}

const STETH = { x: 700, y: 330 };
const STETH_HEADSET = `M${STETH.x - 110} ${STETH.y + 20}C${STETH.x - 112} ${STETH.y + 190} ${STETH.x - 70} ${STETH.y + 300} ${STETH.x} ${STETH.y + 320}C${STETH.x + 70} ${STETH.y + 300} ${STETH.x + 112} ${STETH.y + 190} ${STETH.x + 110} ${STETH.y + 20}`;
const STETH_TUBE = `M${STETH.x} ${STETH.y + 320}C${STETH.x} ${STETH.y + 430} ${STETH.x - 120} ${STETH.y + 470} ${STETH.x - 120} ${STETH.y + 560}C${STETH.x - 120} ${STETH.y + 660} ${STETH.x + 20} ${STETH.y + 680} ${STETH.x + 70} ${STETH.y + 610}`;
const STETH_BELL: Pt = [STETH.x + 96, STETH.y + 580];

function stethoscopeArt(p: Palette): string {
  const { x, y } = STETH;
  const [bx, by] = STETH_BELL;
  return (
    stroke(STETH_HEADSET, p.metalDark, 26) +
    stroke(STETH_HEADSET, p.metal, 16) +
    path(circle(x - 110, y + 14, 24), p.tip) +
    path(circle(x + 110, y + 14, 24), p.tip) +
    stroke(STETH_TUBE, p.stethTubeDark, 34) +
    stroke(STETH_TUBE, p.stethTube, 24) +
    path(roundRect(x - 22, y + 296, 44, 50, 14), p.metalDark) +
    path(circle(bx, by, 74), p.metalDark) +
    path(circle(bx, by, 62), p.metal) +
    path(circle(bx, by, 40), p.bell) +
    path(heartShape(bx, by + 2, 18), p.heartDeco) +
    path(ellipse(bx - 22, by - 24, 14, 8, -35), p.gloss, ' fill-opacity=".8"')
  );
}

const BRUSH = { x: 2540, y: 690, angle: -32 };

const BRUSH_PIECES: Piece[] = (() => {
  const { x, y } = BRUSH;
  const pieces: Piece[] = [
    { d: capsule(x, y, x + 330, y, 26, 22), fill: 'brush' },
    { d: roundRect(x + 30, y - 28, 130, 56, 26), fill: 'grip' },
    { d: capsule(x + 320, y, x + 420, y - 4, 16, 14), fill: 'brush' },
    { d: roundRect(x + 404, y - 30, 176, 48, 22), fill: 'brush' },
    { d: ellipse(x + 92, y - 10, 42, 8), fill: 'gloss', alpha: 0.55 },
  ];
  for (let i = 0; i < 6; i++) {
    const bx = x + 422 + i * 25;
    pieces.push({ d: roundRect(bx, y - 84, 20, 60, 8), fill: 'bristle' });
    pieces.push({ d: roundRect(bx, y - 84, 20, 26, 8), fill: 'bristleTip' });
  }
  const paste: Pt[] = [
    [x + 424, y - 100],
    [x + 456, y - 114],
    [x + 490, y - 102],
    [x + 524, y - 116],
    [x + 556, y - 104],
    [x + 578, y - 112],
  ];
  pieces.push({ d: tube(paste, 18), fill: 'paste' });
  pieces.push({ d: tube(paste, 6), fill: 'pasteStripe' });
  return pieces.map((pc) => ({ ...pc, d: rotatePath(pc.d, BRUSH.angle, x, y) }));
})();

function brushArt(p: Palette): string {
  return BRUSH_PIECES.map(({ d, fill, alpha }) =>
    path(d, p[fill], alpha ? ` fill-opacity="${alpha}"` : ''),
  ).join('');
}

const LENS = { x: 700, y: 1420, r: 138 };
const LENS_HANDLE = capsule(
  LENS.x + LENS.r * 0.72 + 20,
  LENS.y + LENS.r * 0.72 + 20,
  LENS.x + LENS.r * 0.72 + 150,
  LENS.y + LENS.r * 0.72 + 150,
  30,
  34,
);

function magnifierArt(p: Palette): string {
  const { x, y, r } = LENS;
  const hx = x + r * 0.72;
  const hy = y + r * 0.72;
  return (
    path(LENS_HANDLE, p.handle) +
    path(capsule(hx + 6, hy + 6, hx + 44, hy + 44, 30, 30), p.frameDark) +
    path(circle(x, y, r + 26), p.frame) +
    path(circle(x, y, r), p.glass) +
    clipped(
      'lensClip',
      [circle(x, y, r)],
      cell(x + 18, y + 22, 92, p.cellPink, p.cellPinkRing, p.cellPinkCore, p.gloss) +
        path(ellipse(x - 62, y - 66, 46, 22, -40), p.gloss, ' fill-opacity=".8"'),
    ) +
    path(circle(x - 98, y - 20, 9), p.gloss, ' fill-opacity=".9"')
  );
}

const interactives: Interactive[] = [
  {
    id: 'face',
    box: boxOf([HEAD_D, ...EARS, CURL], LINE + 14),
    kind: 'pulse',
    effect: 'hearts',
    effectAt: [CX, 150],
    sound: 'giggle',
    night: { effect: 'stars', sound: 'twinkle' },
    render: (p, mode) => headArt(p, mode),
  },
  {
    id: 'tummy',
    box: boxOf([TUMMY_D], 24),
    kind: 'wiggle',
    origin: [TUMMY.x, TUMMY.y + TUMMY.ry * 0.6],
    effect: 'bubbles',
    sound: 'giggle',
    render: (p) => tummyArt(p),
  },
  {
    id: 'hand-left',
    box: boxOf(HAND_L.shapes, LINE + 14),
    kind: 'rock',
    origin: WRIST_L,
    effect: 'sparkle',
    sound: 'boing',
    render: (p) => handArt(HAND_L, p),
  },
  {
    id: 'hand-right',
    box: boxOf(HAND_R.shapes, LINE + 14),
    kind: 'rock',
    origin: WRIST_R,
    effect: 'sparkle',
    sound: 'boing',
    render: (p) => handArt(HAND_R, p),
  },
  {
    id: 'feet',
    box: boxOf([...FOOT_L, ...FOOT_R], LINE + 12),
    kind: 'bounce',
    effect: 'stars',
    sound: 'thump',
    render: (p) => feetArt(p),
  },
  {
    id: 'stethoscope',
    box: boxOf(
      [
        STETH_HEADSET,
        STETH_TUBE,
        circle(STETH.x - 110, STETH.y + 14, 24),
        circle(STETH.x + 110, STETH.y + 14, 24),
        circle(...STETH_BELL, 74),
      ],
      22,
    ),
    kind: 'rock',
    origin: [STETH.x, STETH.y + 320],
    effect: 'notes',
    sound: 'thump',
    render: (p) => stethoscopeArt(p),
  },
  {
    id: 'toothbrush',
    box: boxOf(
      BRUSH_PIECES.map((pc) => pc.d),
      20,
    ),
    kind: 'wiggle',
    origin: [BRUSH.x + 230, BRUSH.y - 150],
    effect: 'sparkle',
    sound: 'swoosh',
    render: (p) => brushArt(p),
  },
  {
    id: 'magnifier',
    box: boxOf([circle(LENS.x, LENS.y, LENS.r + 26), LENS_HANDLE], 20),
    kind: 'glow',
    effect: 'stars',
    sound: 'twinkle',
    render: (p) => magnifierArt(p),
  },
];

const body: SceneDef = {
  id: 'body',
  world: [W, H],
  horizon: 700,
  ambient: { cells: 16, sparkles: 12, stars: 13 },
  defaults: [
    { animal: 'kidneys', x: CX, y: 1190, scale: 1.45 },
    { animal: 'intestines', x: CX, y: 1330, scale: 1.25 },
    { animal: 'bladder', x: CX, y: 1452 },
    { animal: 'stomach', x: 1930, y: 1042, scale: 1.12 },
    { animal: 'liver', x: 1705, y: 1036, scale: 1.12 },
    { animal: 'lungs', x: CX, y: 792, scale: 1.42 },
    { animal: 'heart', x: 1844, y: 888, scale: 1.14 },
    { animal: 'brain', x: CX, y: 178, scale: 1.05 },
    { animal: 'eye', x: 1712, y: 352, scale: 1.05 },
    { animal: 'eye', x: 1888, y: 352, scale: 1.05 },
    { animal: 'tooth', x: 2052, y: 486, scale: 1.1 },
    { animal: 'bone', x: 1662, y: 1664, scale: 1.24, rotation: 100 },
    { animal: 'red-blood-cell', x: 1330, y: 600, scale: 0.9, rotation: -15 },
    { animal: 'red-blood-cell', x: 2300, y: 770, rotation: 20 },
    { animal: 'red-blood-cell', x: 2150, y: 1620, scale: 0.85, rotation: 40 },
  ],
  day: {
    bgTop: '#fff0f5',
    bgBottom: '#fff6ea',
    halo: '#ffffff',
    blobPink: '#ffe2ec',
    blobMint: '#ddf5e9',
    blobLilac: '#ece6ff',
    blobLemon: '#fff1c7',
    blobSky: '#ddefff',
    blobPeach: '#ffe7d8',
    dot: '#ffd0dd',
    cellPink: '#ffdbe5',
    cellPinkRing: '#ffb9cb',
    cellPinkCore: '#ff9fb9',
    cellMint: '#d6f3e4',
    cellMintRing: '#a9e3c6',
    cellMintCore: '#8fd8b4',
    cellLilac: '#e7defe',
    cellLilacRing: '#c9b8f6',
    cellLilacCore: '#b7a2f0',
    cellSky: '#d8ecff',
    cellSkyRing: '#acd3f7',
    cellSkyCore: '#93c3f1',
    plus: '#ffc4d4',
    heartDeco: '#ffb0c4',
    sparkle: '#ffd66b',
    gloss: '#ffffff',
    body: '#e2f5ff',
    bodyRim: '#c3e7fa',
    bodyLine: '#6cbde8',
    tummy: '#f0faff',
    tummyLine: '#8fd0f0',
    shadow: '#efc7d5',
    eye: '#3b3050',
    mouth: '#b04a72',
    tongue: '#ff9ab3',
    teeth: '#ffffff',
    blush: '#ff9fb6',
    face: '#8a4b1f',
    chartFrame: '#ffffff',
    chartTick: '#ffffff',
    chart1: '#ffb3c4',
    chart2: '#ffcc9e',
    chart3: '#ffe78f',
    chart4: '#bfe9a6',
    chart5: '#9fdfe0',
    chart6: '#a9cdf7',
    chart7: '#c9b6f5',
    star: '#ffd34d',
    metal: '#c6d1e4',
    metalDark: '#97a6c2',
    tip: '#6d7fa3',
    bell: '#e9eef8',
    stethTube: '#7fd0c8',
    stethTubeDark: '#5bb5ad',
    brush: '#7fcfee',
    grip: '#ff9fc0',
    bristle: '#ffffff',
    bristleTip: '#aee0ff',
    paste: '#ffffff',
    pasteStripe: '#8fe8c8',
    tube: '#ffffff',
    tubeStripe: '#6fb8ff',
    tubeCrimp: '#d9e2f2',
    tubeCap: '#ff8fb0',
    tubeCapDark: '#e8709a',
    monitor: '#dccfff',
    monitorDark: '#b9a6f2',
    screen: '#2f4b66',
    ecg: '#7ff0c8',
    ecgHeart: '#ff7096',
    apple: '#ff6f6f',
    stem: '#8b5a3c',
    leaf: '#6fcf7c',
    glass: '#e3f2ff',
    milk: '#ffffff',
    straw: '#ff9fc0',
    frame: '#ffb547',
    frameDark: '#e8952c',
    handle: '#a77ee0',
    dnaA: '#ff9fc0',
    dnaB: '#8fcfff',
    rung1: '#ffe07a',
    rung2: '#a6e6b8',
    rung3: '#c9b6f5',
    rung4: '#ffc09a',
    soap: '#ffc4dd',
    soapLight: '#ffe2ef',
    soapDark: '#f2a0c6',
    bubble: '#ffffff',
    bubbleLine: '#a9dcff',
  },
  night: {
    bgTop: '#1c1d48',
    bgBottom: '#2e2a5e',
    halo: '#6f7fdc',
    blobPink: '#352c66',
    blobMint: '#233c66',
    blobLilac: '#30307a',
    blobLemon: '#3a3666',
    blobSky: '#263c76',
    blobPeach: '#3b2f66',
    dot: '#57579c',
    cellPink: '#4a3a78',
    cellPinkRing: '#6a539a',
    cellPinkCore: '#8a68b0',
    cellMint: '#2c4c74',
    cellMintRing: '#3e6a8c',
    cellMintCore: '#5590a2',
    cellLilac: '#3e3a84',
    cellLilacRing: '#5a52a6',
    cellLilacCore: '#7568c2',
    cellSky: '#2c4684',
    cellSkyRing: '#4062a8',
    cellSkyCore: '#5a82c6',
    plus: '#4c4a90',
    heartDeco: '#7a5aa0',
    sparkle: '#ffe9a0',
    gloss: '#dfe8ff',
    body: '#a3b9ee',
    bodyRim: '#8ca5e2',
    bodyLine: '#e0eaff',
    tummy: '#b2c6f2',
    tummyLine: '#e0eaff',
    shadow: '#15163a',
    eye: '#2a2450',
    teeth: '#e8edff',
    screen: '#14243f',
    ecg: '#8dffd6',
    ecgHeart: '#ff7aa2',
    star: '#ffe48a',
    chartFrame: '#3f3f7a',
    chartTick: '#cdd3f2',
    chart1: '#9c6690',
    chart2: '#9c7a7c',
    chart3: '#9a9376',
    chart4: '#6c977e',
    chart5: '#5a9098',
    chart6: '#5f7fb4',
    chart7: '#7868bc',
    dnaA: '#9a6fb0',
    dnaB: '#6283c4',
    brush: '#6a8fd0',
  },
  back: (p, mode) =>
    backdrop(p, mode) +
    dna(3380, 260, 1720, p) +
    heightChart(p) +
    toothpaste(2620, 840, p) +
    monitor(2560, 960, p) +
    appleAndMilk(2780, 1660, p) +
    soap(640, 1830, p) +
    figure(p),
  front: (p) =>
    path(blob(31, 120, 2010, 260, 130, 0.1), p.blobLilac) +
    cell(250, 1930, 50, p.cellMint, p.cellMintRing, p.cellMintCore, p.gloss) +
    path(blob(33, 3480, 2020, 260, 130, 0.1), p.blobPink) +
    cell(3340, 1940, 44, p.cellSky, p.cellSkyRing, p.cellSkyCore, p.gloss),
  interactives,
};

export default body;
