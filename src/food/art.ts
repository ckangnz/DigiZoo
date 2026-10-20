import { capsule, circle, ellipse, leaf, roundRect, smooth, spiky } from '../art/core/paths';
import type { FoodId } from './foods';

const p = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;
const line = (d: string, color: string, width: number) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

const ART: Record<FoodId, string> = {
  meat:
    p(capsule(40, 24, 50, 14, 4.5), '#f4ead8') +
    p(circle(52, 10, 5), '#f4ead8') +
    p(circle(55, 15, 5), '#f4ead8') +
    p(
      smooth([
        [10, 40],
        [14, 26],
        [28, 18],
        [42, 22],
        [46, 34],
        [38, 48],
        [22, 54],
        [12, 50],
      ]),
      '#c8673f',
    ) +
    p(ellipse(24, 34, 9, 6, -30), '#e48a5c') +
    p(ellipse(20, 30, 3, 2, -30), '#ffd2b0'),
  fish:
    p('M44 32 L60 20 L58 32 L60 44 Z', '#3f8fd6') +
    p(ellipse(28, 32, 20, 13), '#5fb0f0') +
    p(ellipse(26, 37, 13, 5), '#bfe4ff') +
    p(circle(16, 29, 3.6), '#22303f') +
    p(circle(17.2, 27.8, 1.2), '#ffffff') +
    line('M33 22 Q36 32 33 42', '#3f8fd6', 2.4),
  shrimp:
    p(
      smooth([
        [46, 16],
        [54, 26],
        [52, 40],
        [42, 50],
        [28, 54],
        [20, 48],
        [26, 42],
        [38, 38],
        [42, 28],
        [38, 20],
      ]),
      '#ff8a65',
    ) +
    p('M22 48 L8 44 L12 52 L8 58 L22 54 Z', '#ff7043') +
    line('M44 30 Q50 34 46 40 M38 40 Q44 44 38 48', '#e8603f', 2.2) +
    line('M46 16 Q56 6 62 8 M44 18 Q50 4 56 2', '#e8603f', 1.8) +
    p(circle(48, 22, 2.4), '#22303f'),
  bugs:
    p(circle(14, 40, 9), '#8fd14f') +
    p(circle(26, 36, 9.5), '#7cc242') +
    p(circle(38, 38, 9.5), '#8fd14f') +
    p(circle(50, 32, 10.5), '#9adb5a') +
    p(circle(47, 30, 2.4), '#22303f') +
    p(circle(54, 30, 2.4), '#22303f') +
    line('M47 23 Q44 14 40 14 M54 23 Q58 14 62 15', '#5a8f2c', 2) +
    line('M46 37 Q50 40 54 37', '#3d6b1f', 1.8),
  carrot:
    p('M18 22 Q30 16 40 24 L22 60 Q18 62 16 58 Z', '#ff9f2e') +
    line('M22 32 L28 33 M20 42 L26 43 M24 50 L28 51', '#e07a12', 2) +
    p(leaf(30, 22, 18, 5, -60), '#5cb85c') +
    p(leaf(30, 22, 20, 5, -95), '#4caf50') +
    p(leaf(30, 22, 16, 5, -130), '#66bb6a'),
  apple:
    p(
      smooth([
        [32, 20],
        [44, 14],
        [56, 24],
        [54, 44],
        [42, 58],
        [32, 54],
        [22, 58],
        [10, 44],
        [8, 24],
        [20, 14],
      ]),
      '#ef4b4b',
    ) +
    p(ellipse(20, 26, 5, 3, -30), '#ff8a8a') +
    line('M32 20 Q32 10 36 6', '#7a4a2a', 3) +
    p(leaf(34, 12, 14, 5, -20), '#5cb85c'),
  banana:
    p('M8 18 Q14 46 40 52 Q54 54 58 48 Q46 46 34 40 Q18 30 14 14 Z', '#ffd54a') +
    p('M14 14 Q18 30 34 40 Q46 46 58 48 Q50 44 40 38 Q24 28 18 12 Z', '#f6c22e') +
    p(roundRect(9, 10, 6, 8, 2), '#8a6a2e') +
    p(circle(58, 48, 2.6), '#6b4f22'),
  hay:
    p(
      smooth([
        [10, 54],
        [14, 28],
        [24, 12],
        [40, 12],
        [50, 28],
        [54, 54],
      ]),
      '#e8c35a',
    ) +
    line('M18 52 L24 18 M28 54 L30 14 M38 54 L36 14 M46 52 L42 18', '#c99a32', 2.4) +
    p(roundRect(12, 34, 40, 6, 3), '#a0522d'),
  leaves:
    p(leaf(10, 52, 44, 14, -50), '#5cb85c') +
    line('M10 52 L38 18', '#3e8e41', 2) +
    p(leaf(18, 56, 40, 12, -20), '#81c784') +
    line('M18 56 L55 42', '#4caf50', 2),
  seeds:
    p(ellipse(32, 50, 24, 8), '#c98d4f') +
    p(ellipse(20, 44, 5, 8, -30), '#7a5230') +
    p(ellipse(32, 40, 5, 8, 10), '#8a5a33') +
    p(ellipse(44, 44, 5, 8, 35), '#7a5230') +
    p(ellipse(26, 30, 4.5, 7, -15), '#8a5a33') +
    p(ellipse(38, 30, 4.5, 7, 20), '#7a5230') +
    line('M20 40 L20 47 M32 36 L32 44 M44 40 L44 47', '#f2e0c0', 1.4),
  flowers:
    line('M32 36 Q30 48 32 60', '#4caf50', 3) +
    p(leaf(32, 52, 12, 4, -150), '#66bb6a') +
    [0, 72, 144, 216, 288]
      .map((a) => {
        const r = (a * Math.PI) / 180;
        return p(circle(32 + Math.cos(r) * 11, 24 + Math.sin(r) * 11, 9), '#ff7eb6');
      })
      .join('') +
    p(circle(32, 24, 7), '#ffd54a'),
  honey:
    p(roundRect(12, 22, 40, 36, 12), '#f2a51a') +
    p(roundRect(14, 16, 36, 10, 4), '#c47a12') +
    p('M20 26 Q24 36 28 30 Q30 40 34 30 Q38 38 42 28 L44 26 Z', '#ffd54a') +
    p(ellipse(22, 44, 4, 6), '#ffd27a', ' opacity=".7"') +
    line('M46 14 L58 4', '#a06a2a', 3) +
    p(spiky(58, 4, 5, 3, 6), '#c47a12'),
  cheese:
    p('M6 44 L50 20 L58 30 L58 52 L6 52 Z', '#ffcc33') +
    p('M6 44 L50 20 L58 30 L14 46 Z', '#ffe066') +
    p(circle(24, 46, 3.5), '#e6a817') +
    p(circle(42, 42, 4.5), '#e6a817') +
    p(circle(50, 48, 2.5), '#e6a817') +
    p(ellipse(34, 36, 3, 2), '#e6b52e'),
  candy:
    p('M4 22 L18 32 L4 42 Z', '#c77dff') +
    p('M60 22 L46 32 L60 42 Z', '#c77dff') +
    p(ellipse(32, 32, 15, 12), '#ff6fb5') +
    line('M22 26 Q32 34 42 26 M22 38 Q32 30 42 38', '#ffffff', 2.2),
};

export function foodSvg(id: FoodId, size = 64): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 72 72" width="${size}" height="${size}">${ART[id]}</svg>`;
}
