import { Synth } from '../synth';
import type { Recipe } from '../types';

const NOTES = [1568, 1760, 2093, 2349, 2637, 3136, 3520, 4186];

const butterfly: Recipe = (voice) => {
  const s = new Synth(voice, 3.6);
  const pitch = s.vary(0.03);
  const dur = 1.3;
  const wings = s.tremolo({ rate: 16, depth: 0.85, dur: dur + 0.02 });
  s.burst({
    dur,
    color: 'pink',
    freq: 2600,
    q: 0.9,
    env: [
      [0, 0],
      [0.2, 1],
      [1.0, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.3,
    dest: wings,
    pan: [
      [0, -0.6],
      [0.65, 0.6],
      [dur, -0.3],
    ],
  });
  const sparkle = s.bus(s.master, s.echo({ time: 0.09, feedback: 0.25, wet: 0.3 }));
  const count = 10;
  for (let i = 0; i < count; i++) {
    const at = 0.05 + (i + s.range(0.1, 0.9)) * (1.1 / count);
    const step = Math.min(
      NOTES.length - 1,
      Math.floor((i / count) * 5) + Math.floor(s.random() * 4),
    );
    s.bell({
      at,
      freq: NOTES[step] * pitch,
      dur: 0.25,
      gain: s.range(0.06, 0.1),
      pan: s.range(-0.7, 0.7),
      dest: sparkle,
    });
  }
  return s.done();
};

export default butterfly;
