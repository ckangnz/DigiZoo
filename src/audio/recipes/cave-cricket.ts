import { Synth } from '../synth';
import type { Recipe } from '../types';

const caveCricket: Recipe = (voice) => {
  const s = new Synth(voice, 3.08).stereo();
  const pitch = s.vary(0.03);
  const pace = s.vary(0.04);
  const cave = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.4 }));
  const echo = s.bus(
    cave,
    s.echo({ time: 0.12, feedback: 0.2, wet: 0.35, tone: 4000, dest: cave }),
  );
  [0, 0.4].forEach((chirp, index) => {
    for (let i = 0; i < 4; i++) {
      s.note({
        at: (chirp + i * 0.03) * pace,
        dur: 0.018,
        freq: 3600 * pitch * (index === 0 ? 1 : 0.98),
        wave: [1, 0.08],
        env: [
          [0, 0],
          [0.003, 1],
          [0.012, 0.7],
          [0.018, 0, 'exp'],
        ],
        gain: 0.18 * (i === 0 ? 0.8 : 1),
        pan: 0.2,
        dest: echo,
      });
    }
  });
  const jump = 0.85 * pace;
  s.spring({
    at: jump,
    dur: 0.22,
    freq: [
      [0, 500 * pitch],
      [0.22, 650 * pitch],
    ],
    depth: 350,
    rate: 18,
    gain: 0.07,
    pan: [
      [0, 0.2],
      [0.22, -0.3],
    ],
    dest: cave,
  });
  const land = 1.1 * pace;
  s.click({ at: land, freq: 2500, q: 3, dur: 0.008, gain: 0.2, pan: -0.3, dest: cave });
  s.thump({ at: land, from: 300, to: 160, dur: 0.04, gain: 0.12, pan: -0.3, dest: cave });
  return s.done();
};

export default caveCricket;
