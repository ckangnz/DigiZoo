import { GLASS_PARTIALS, Synth } from '../synth';
import type { Recipe } from '../types';

const kakapo: Recipe = (voice) => {
  const s = new Synth(voice, 0.232);
  const pitch = s.vary(0.04);
  const pace = s.vary(0.04);
  const bush = s.bus(s.master, s.reverb({ seconds: 0.32, wet: 0.3, bright: 0.3 }));
  [0, 0.45, 0.9].forEach((offset, index) => {
    const at = offset * pace;
    const level = [0.8, 0.9, 1][index];
    s.vocal({
      at,
      dur: 0.32,
      pitch: [
        [0, 85],
        [0.08, 95],
        [0.32, 88],
      ],
      transpose: pitch,
      vowel: 'u',
      wave: 'hollow',
      shift: 0.9,
      breath: 0.15,
      jitter: 4,
      env: [
        [0, 0],
        [0.06, 1],
        [0.22, 0.8],
        [0.32, 0, 'exp'],
      ],
      tone: 1200,
      gain: 0.5 * level,
      dest: bush,
    });
    s.thump({ at, from: 140, to: 85, dur: 0.25, gain: 0.3 * level, dest: bush });
  });
  const ching = 1.32 * pace;
  s.chirp({
    at: ching,
    dur: 0.12,
    freq: [
      [0, 2000 * pitch],
      [0.04, 2400 * pitch],
      [0.12, 2200 * pitch],
    ],
    wave: [1, 0.2],
    gain: 0.25,
    dest: bush,
  });
  s.bell({
    at: ching,
    freq: 2200 * pitch,
    dur: 0.4,
    gain: 0.15,
    partials: GLASS_PARTIALS,
    dest: bush,
  });
  return s.done();
};

export default kakapo;
