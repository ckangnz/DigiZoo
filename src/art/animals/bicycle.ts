import {
  capsule,
  circle,
  curve,
  ellipse,
  f,
  roundRect,
  smooth,
  tube,
  type Pt,
} from '../core/paths';
import type { AnimalDef, PartNode, Shape } from '../core/types';

const W = 300;
const H = 262;
const R = 46;
const WY = H - R;
const RX = 64;
const FX = 236;
const BB: Pt = [146, 206];
const CRANK = 17;
const START = (20 * Math.PI) / 180;
const HIP: Pt = [112, 146];
const THIGH = 46;
const SHIN = 44;
const TAU = Math.PI * 2;

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function pedal(phase: number, far: boolean): Pt {
  const a = TAU * (phase - Math.floor(phase)) + START + (far ? Math.PI : 0);
  return [BB[0] + CRANK * Math.cos(a), BB[1] + CRANK * Math.sin(a)];
}

function knee(foot: Pt): Pt {
  const dx = foot[0] - HIP[0];
  const dy = foot[1] - HIP[1];
  const d = Math.min(Math.hypot(dx, dy), THIGH + SHIN - 0.5);
  const a = Math.atan2(dy, dx);
  const c = (THIGH ** 2 + d ** 2 - SHIN ** 2) / (2 * THIGH * d);
  const b = Math.acos(Math.max(-1, Math.min(1, c)));
  return [HIP[0] + THIGH * Math.cos(a - b), HIP[1] + THIGH * Math.sin(a - b)];
}

const leg = (id: string, far: boolean): PartNode => ({
  id,
  frames: (phase) => {
    const foot = pedal(phase, far);
    const k = knee(foot);
    const hem = lerp(HIP, k, 0.6);
    const tone = far ? 'Dark' : '';
    return [
      { d: capsule(k[0], k[1], foot[0], foot[1], 7.5, 6.5), fill: `skin${tone}` },
      { d: capsule(HIP[0], HIP[1], k[0], k[1], 10, 8.5), fill: `skin${tone}` },
      { d: capsule(HIP[0], HIP[1], hem[0], hem[1], 13, 11), fill: `shorts${tone}` },
      { d: ellipse(foot[0] + 4, foot[1] + 1, 12.5, 7.5), fill: `shoe${tone}` },
    ];
  },
});

const crankArm = (angle: number, fill: string): Shape[] => {
  const x = BB[0] + CRANK * Math.cos(angle);
  const y = BB[1] + CRANK * Math.sin(angle);
  return [
    { d: capsule(BB[0], BB[1], x, y, 4, 3.5), fill },
    { d: circle(x, y, 5.5), fill: 'pedal' },
  ];
};

const wheel = (id: string, x: number): PartNode => ({
  id,
  pivot: [x, WY],
  shapes: [
    { d: circle(x, WY, R), fill: 'tyre' },
    { d: circle(x, WY, R - 6), kind: 'detail', fill: 'rim' },
    { d: circle(x, WY, R - 10), kind: 'detail', fill: 'wheelIn' },
  ],
  children: [
    {
      id: `${id}Spin`,
      role: 'spinner',
      pivot: [x, WY],
      shapes: [
        ...Array.from({ length: 7 }, (_, i): Shape => {
          const a = (i / 7) * TAU - Math.PI / 2;
          return {
            d: `M${f(x)} ${f(WY)}L${f(x + (R - 10) * Math.cos(a))} ${f(WY + (R - 10) * Math.sin(a))}`,
            kind: 'line',
            stroke: 'spoke',
            width: 2.6,
          };
        }),
        { d: circle(x, WY, 6.5), kind: 'feature', fill: 'hub', stroke: 'auto' },
      ],
    },
  ],
});

const fender = (x: number, from: number, to: number): Shape => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 12; i++) {
    const a = ((from + ((to - from) * i) / 12) * Math.PI) / 180;
    pts.push([x + (R + 5) * Math.cos(a), WY + (R + 5) * Math.sin(a)]);
  }
  return { d: tube(pts, 3.6, 48), fill: 'paint' };
};

const SPROCKET = 7;
const RING = 13;

const bicycle: AnimalDef = {
  id: 'bicycle',
  name: 'Bicycle',
  kind: 'object',
  aliases: ['bike', 'cycle', 'push bike', 'pedal bike'],
  group: 'vehicle',
  habitats: ['vehicles'],
  box: [W, H],
  size: 130,
  locomotion: 'drive',
  gait: { period: 0.8, stride: Math.PI * 2 * R },
  sound: 'bicycle',
  palette: {
    paint: '#22b8a7',
    metal: '#d3d8e2',
    metalDark: '#9aa3b8',
    seat: '#4a4458',
    tyre: '#45425a',
    rim: '#c9ced9',
    wheelIn: '#f3f5fa',
    spoke: '#a3abbd',
    hub: '#c6ccd8',
    chain: '#6b7184',
    pedal: '#5d6478',
    bell: '#ffd23f',
    skin: '#b97a52',
    skinDark: '#a56a44',
    hair: '#2f211d',
    shirt: '#ffd23f',
    shorts: '#ff7b7b',
    shortsDark: '#e86565',
    shoe: '#5d6bd6',
    shoeDark: '#4a57bd',
    helmet: '#ff6f91',
    reflector: '#ff6b6b',
  },
  parts: [
    {
      id: 'bike',
      pivot: [W / 2, H],
      children: [
        leg('legF', true),
        {
          id: 'crankF',
          role: 'spinner',
          pivot: BB,
          shapes: crankArm(START + Math.PI, 'metalDark'),
        },
        wheel('wheelB', RX),
        wheel('wheelF', FX),
        {
          id: 'frame',
          shapes: [
            { d: capsule(BB[0], BB[1], 114, 150, 5.5, 5.5), fill: 'paint' },
            { d: capsule(118, 160, 204, 146, 5.5, 5.5), fill: 'paint' },
            { d: capsule(206, 152, BB[0], BB[1], 6, 6), fill: 'paint' },
            { d: capsule(BB[0], BB[1], RX, WY, 4.5, 4.5), fill: 'paint' },
            { d: capsule(116, 156, RX, WY, 4.5, 4.5), fill: 'paint' },
            { d: capsule(203, 138, 210, 162, 7, 7), fill: 'paint' },
            fender(RX, -158, -78),
            fender(FX, -112, -48),
            { d: circle(92, 182, 4.5), kind: 'feature', fill: 'reflector', stroke: 'auto' },
          ],
        },
        {
          id: 'fork',
          shapes: [{ d: capsule(208, 152, FX, WY, 4.5, 4.5), fill: 'metal' }],
        },
        {
          id: 'chain',
          shapes: [
            {
              d: `M${BB[0]} ${BB[1] - RING}L${RX} ${WY - SPROCKET}`,
              kind: 'line',
              stroke: 'chain',
              width: 2.6,
            },
            {
              d: `M${BB[0]} ${BB[1] + RING}L${RX} ${WY + SPROCKET}`,
              kind: 'line',
              stroke: 'chain',
              width: 2.6,
            },
            { d: circle(RX, WY, SPROCKET), kind: 'feature', fill: 'metalDark', stroke: 'auto' },
          ],
        },
        {
          id: 'crankN',
          role: 'spinner',
          pivot: BB,
          shapes: [
            { d: circle(BB[0], BB[1], RING), fill: 'metal' },
            ...[0, 1, 2, 3, 4].map((i): Shape => ({
              d: circle(
                BB[0] + 7 * Math.cos(START + (i * TAU) / 5),
                BB[1] + 7 * Math.sin(START + (i * TAU) / 5),
                2.2,
              ),
              kind: 'feature',
              fill: 'metalDark',
            })),
            ...crankArm(START, 'metalDark'),
          ],
        },
        {
          id: 'seat',
          shapes: [
            { d: capsule(114, 150, 110, 136, 4, 4), fill: 'metal' },
            {
              d: smooth([
                [88, 134],
                [110, 128],
                [132, 130],
                [126, 138],
                [100, 140],
              ]),
              fill: 'seat',
            },
          ],
        },
        {
          id: 'bars',
          shapes: [
            { d: capsule(205, 140, 203, 114, 4.5, 4.5), fill: 'metal' },
            { d: capsule(203, 114, 186, 112, 4.5, 4.5), fill: 'metal' },
            { d: roundRect(176, 106, 16, 12, 6), fill: 'seat' },
            { d: 'M204 112Q204 97 213 97Q222 97 222 112Z', fill: 'bell' },
            { d: circle(213, 95, 3), fill: 'bell' },
            {
              d: 'M208 104Q210 100 213 100',
              kind: 'line',
              stroke: 'white',
              width: 2.2,
              opacity: 0.9,
            },
          ],
        },
        {
          id: 'rider',
          shapes: [
            {
              d: smooth([
                [98, 104],
                [126, 94],
                [148, 104],
                [150, 128],
                [138, 150],
                [104, 152],
                [94, 130],
              ]),
              fill: 'shirt',
            },
          ],
        },
        leg('legN', false),
        {
          id: 'arm',
          shapes: [
            { d: capsule(130, 108, 182, 112, 8.5, 7.5), fill: 'skin' },
            { d: capsule(130, 108, 150, 110, 11.5, 10.5), fill: 'shirt' },
            { d: circle(184, 112, 8.5), fill: 'skin' },
          ],
        },
        {
          id: 'head',
          role: 'head',
          pivot: [128, 98],
          shapes: [
            { d: circle(128, 64, 36), fill: 'skin' },
            { d: circle(128, 64, 35), kind: 'feature', fill: 'skin' },
            { d: circle(94, 58, 11), kind: 'feature', fill: 'hair' },
            { d: circle(98, 72, 9), kind: 'feature', fill: 'hair' },
            {
              d: 'M88 56Q92 22 130 18Q168 20 172 52L176 58Q150 50 128 50Q104 50 88 60Z',
              kind: 'feature',
              fill: 'helmet',
              stroke: 'auto',
            },
            { d: 'M112 30Q122 26 132 26', kind: 'line', stroke: 'white', width: 4, opacity: 0.9 },
            { d: 'M140 27Q150 29 158 34', kind: 'line', stroke: 'white', width: 4, opacity: 0.9 },
            { d: ellipse(110, 80, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: ellipse(152, 80, 6.5, 4), kind: 'feature', fill: 'blush', opacity: 0.6 },
            { d: circle(119, 69, 6.4), kind: 'feature', fill: 'eye' },
            { d: circle(143, 69, 6.4), kind: 'feature', fill: 'eye' },
            { d: circle(121.4, 66.4, 2.4), kind: 'feature', fill: 'shine' },
            { d: circle(145.4, 66.4, 2.4), kind: 'feature', fill: 'shine' },
            { d: curve(124, 82, 138, 82, 5.5), kind: 'line', stroke: 'mouth', width: 2.6 },
          ],
        },
      ],
    },
  ],
};

export default bicycle;
