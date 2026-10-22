import { Synth, type Formant } from '../synth';
import type { Recipe } from '../types';

const NASAL_E: readonly Formant[] = [
  { freq: 300, bw: 80, amp: 0.5 },
  { freq: 620, bw: 120, amp: 1 },
  { freq: 1900, bw: 150, amp: 0.6 },
  { freq: 2700, bw: 200, amp: 0.3 },
];

const deer: Recipe = (voice) => {
  const s = new Synth(voice, 0.457).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const meadow = s.bus(s.master, s.reverb({ seconds: 0.35, wet: 0.2, bright: 0.4 }));
  [
    [0, 0.3, 1],
    [0.42, 0.34, 1.05],
  ].forEach(([offset, dur, lift]) => {
    s.vocal({
      at: offset * pace,
      dur,
      pitch: [
        [0, 540],
        [0.05, 700],
        [0.2, 640],
        [dur, 480],
      ],
      transpose: pitch * lift,
      vowel: [
        [0, 'n'],
        [0.04, NASAL_E],
        [dur * 0.7, NASAL_E],
        [dur, 'u'],
      ],
      wave: 'reed',
      shift: 1.25,
      breath: 0.25,
      vibrato: { rate: 7, depth: 20 },
      env: [
        [0, 0],
        [0.03, 1],
        [dur * 0.6, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 5500,
      gain: 0.5,
      dest: meadow,
    });
  });
  [0.95, 1.15].forEach((offset, index) => {
    const at = offset * pace;
    const pan = index === 0 ? -0.3 : 0.3;
    s.burst({
      at,
      dur: 0.1,
      color: 'white',
      freq: 3500,
      q: 0.8,
      env: [
        [0, 0],
        [0.008, 1],
        [0.1, 0, 'exp'],
      ],
      gain: 0.25,
      pan,
    });
    const times = Array.from({ length: 6 }, () => at + s.range(0, 0.06));
    s.clicks({
      times,
      freq: times.map(() => s.range(3000, 6000)),
      gain: times.map(() => s.range(0.08, 0.18)),
      q: 1.5,
      dur: 0.004,
      pan,
    });
    s.thump({ at, from: 240, to: 120, dur: 0.05, gain: 0.15, pan });
  });
  return s.done();
};

export default deer;
