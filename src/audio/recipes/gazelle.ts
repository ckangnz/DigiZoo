import { Synth } from '../synth';
import type { Recipe } from '../types';

const gazelle: Recipe = (voice) => {
  const s = new Synth(voice, 0.66);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.05);
  s.burst({ dur: 0.07, color: 'pink', freq: 2000, q: 1.2, gain: 0.25 });
  const dur = 0.32;
  s.vocal({
    at: 0.06,
    dur,
    pitch: [
      [0, 400],
      [0.06, 480],
      [0.2, 450],
      [dur, 360],
    ],
    transpose: pitch,
    vowel: [
      [0, 'n'],
      [0.05, 'e'],
      [0.22, 'e'],
      [dur, 'a'],
    ],
    wave: 'reed',
    shift: 1.15,
    breath: 0.2,
    vibrato: { rate: 9, depth: 40, delay: 0.06 },
    growl: { rate: 9, depth: 0.3 },
    env: [
      [0, 0],
      [0.03, 1],
      [0.2, 0.8],
      [dur, 0, 'exp'],
    ],
    tone: 5000,
    gain: 0.45,
  });
  [0.52, 0.6, 0.76, 0.84].forEach((offset, index) => {
    const at = offset * pace;
    s.click({
      at,
      freq: (index % 2 === 0 ? 1700 : 1450) * pitch,
      q: 6,
      dur: 0.025,
      gain: 0.3,
      ring: 0.5,
    });
    s.thump({ at, from: 260, to: 150, dur: 0.05, gain: 0.18 });
  });
  return s.done();
};

export default gazelle;
