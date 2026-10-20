import { Synth } from '../synth';
import type { Recipe } from '../types';

const parasaurolophus: Recipe = (voice) => {
  const s = new Synth(voice, 0.42).stereo();
  const pitch = s.vary(0.03);
  const crest = s.bus(s.master, s.reverb({ seconds: 0.4, wet: 0.3, bright: 0.35 }));
  [
    [0, 1.1, 110, 130, 100, 1],
    [1.2, 0.35, 125, 140, 110, 0.75],
  ].forEach(([at, dur, from, peak, to, level]) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, from],
        [Math.min(0.12, dur * 0.3), peak],
        [dur * 0.7, peak * 0.98],
        [dur, to],
      ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [dur * 0.15, 'o'],
        [dur * 0.75, 'o'],
        [dur, 'u'],
      ],
      wave: 'reed',
      shift: 0.75,
      sub: 0.2,
      drive: 1.2,
      body: 0.1,
      breath: 0.1,
      vibrato: { rate: 5, depth: 18, delay: Math.min(0.35, dur * 0.5) },
      env: [
        [0, 0],
        [0.06, 0.8],
        [Math.min(0.2, dur * 0.4), 1],
        [dur * 0.75, 0.85],
        [dur, 0, 'exp'],
      ],
      tone: 2200,
      gain: 0.5 * level,
      dest: crest,
    });
  });
  return s.done();
};

export default parasaurolophus;
