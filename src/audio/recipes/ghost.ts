import { Synth } from '../synth';
import type { Recipe } from '../types';

const ghost: Recipe = (voice) => {
  const s = new Synth(voice, 0.1).stereo();
  const pitch = s.vary(0.04);
  const haunt = s.bus(s.master, s.reverb({ seconds: 0.5, wet: 0.35, bright: 0.4 }));
  [
    [0, 0.68, 330, 520, 440],
    [0.72, 0.7, 470, 380, 300],
  ].forEach(([at, dur, from, peak, to], index) => {
    s.vocal({
      at,
      dur,
      pitch: [
        [0, from],
        [dur * 0.45, peak],
        [dur, to],
      ],
      transpose: pitch,
      vowel: [
        [0, 'u'],
        [dur * 0.4, 'o'],
        [dur, 'u'],
      ],
      wave: 'glottal',
      breath: 0.6,
      vibrato: { rate: 5, depth: 70, delay: 0.1 },
      jitter: 5,
      env: [
        [0, 0],
        [dur * 0.25, 1],
        [dur * 0.7, 0.8],
        [dur, 0, 'exp'],
      ],
      tone: 3200,
      gain: index === 0 ? 0.5 : 0.42,
      pan: index === 0 ? -0.2 : 0.2,
      dest: haunt,
    });
  });
  return s.done();
};

export default ghost;
