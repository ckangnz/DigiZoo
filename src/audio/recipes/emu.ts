import { Synth, sequence } from '../synth';
import type { Recipe } from '../types';

const LEVELS = [0.5, 0.7, 0.85, 1, 1, 0.9, 0.75, 0.6];

const emu: Recipe = (voice) => {
  const s = new Synth(voice, 0.156);
  const pitch = s.vary(0.05);
  const pace = s.vary(0.04);
  const plains = s.bus(s.master, s.reverb({ seconds: 0.3, wet: 0.22, bright: 0.3 }));
  const starts = LEVELS.map((_, i) => i * 0.15 * pace);
  s.vocal({
    dur: starts[starts.length - 1] + 0.12,
    pitch: sequence(
      [
        [0, 135],
        [0.03, 150],
        [0.11, 130],
      ],
      starts,
    ),
    transpose: pitch,
    vowel: 'u',
    wave: 'hollow',
    shift: 0.95,
    body: 0.4,
    sub: 0.2,
    breath: 0.2,
    jitter: 5,
    env: sequence(
      [
        [0, 0],
        [0.02, 1],
        [0.06, 0.6],
        [0.12, 0, 'exp'],
      ],
      starts,
      (i) => LEVELS[i],
    ),
    tone: 1500,
    gain: 0.5,
    dest: plains,
  });
  starts.forEach((at, i) => {
    s.thump({ at, from: 190, to: 110, dur: 0.08, gain: 0.25 * LEVELS[i], dest: plains });
  });
  return s.done();
};

export default emu;
