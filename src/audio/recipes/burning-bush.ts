import { Synth, midiHz } from '../synth';
import type { Recipe } from '../types';

const burningBush: Recipe = (voice) => {
  const s = new Synth(voice, 1.7).stereo();
  const pitch = s.vary(0.02);
  const holy = s.bus(s.master, s.reverb({ seconds: 0.45, wet: 0.35, bright: 0.5 }));
  const dur = 1.3;
  const flicker = s.tremolo({ rate: 5, depth: 0.4, dur: dur + 0.02, dest: holy });
  s.burst({
    dur,
    color: 'pink',
    freq: [
      [0, 600],
      [0.6, 1100],
      [dur, 700],
    ],
    q: 1.2,
    swell: 0.4,
    gain: 0.35,
    dest: flicker,
  });
  const times = Array.from({ length: 16 }, () => s.range(0.05, 1.2));
  s.clicks({
    times,
    freq: times.map(() => s.range(1500, 4000)),
    gain: times.map(() => s.range(0.15, 0.3)),
    q: 2.5,
    dur: 0.006,
    dest: holy,
  });
  s.choir({
    at: 0.2,
    dur: 1.1,
    freqs: [76, 80, 83].map((n) => midiHz(n) * pitch),
    vowel: 'u',
    attack: 0.4,
    release: 0.4,
    shimmer: { rate: 6, depth: 0.3 },
    gain: 0.25,
    dest: holy,
  });
  return s.done();
};

export default burningBush;
