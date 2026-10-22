import { Synth } from '../synth';
import type { Recipe } from '../types';

const chinchilla: Recipe = (voice) => {
  const s = new Synth(voice, 1.3).stereo();
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const voiceBox = s.filter('highpass', 500, 0.7, { dest: s.master });
  [0, 0.14, 0.28].forEach((offset, index) => {
    s.vocal({
      at: offset * pace,
      dur: 0.07,
      pitch: [
        [0, 1400],
        [0.02, 1700],
        [0.07, 1300],
      ],
      transpose: pitch * [1, 1.05, 1.1][index],
      vowel: [
        [0, 'i'],
        [0.07, 'e'],
      ],
      shift: 1.6,
      breath: 0.3,
      env: [
        [0, 0],
        [0.008, 1],
        [0.04, 0.6],
        [0.07, 0, 'exp'],
      ],
      tone: 7000,
      gain: 0.45,
      dest: voiceBox,
    });
  });
  const bath = 0.5 * pace;
  const roll = s.tremolo({
    rate: 9,
    depth: 0.6,
    at: bath,
    dur: 0.92,
    dest: s.panner(
      [
        [0, -0.4],
        [0.45, 0.4],
        [0.9, -0.2],
      ],
      { at: bath },
    ),
  });
  s.burst({
    at: bath,
    dur: 0.9,
    color: 'pink',
    freq: 3000,
    q: 0.8,
    env: [
      [0, 0],
      [0.1, 1],
      [0.7, 0.8],
      [0.9, 0, 'exp'],
    ],
    gain: 1.0,
    dest: roll,
  });
  const grains = Array.from({ length: 20 }, () => bath + s.range(0.05, 0.85));
  s.clicks({
    times: grains,
    freq: grains.map(() => s.range(3000, 6000)),
    gain: grains.map(() => s.range(0.12, 0.22)),
    q: 1.5,
    dur: 0.004,
    pan: s.range(-0.3, 0.3),
  });
  return s.done();
};

export default chinchilla;
