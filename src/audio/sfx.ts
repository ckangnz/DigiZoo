import {
  GLASS_PARTIALS,
  MUSIC_BOX_PARTIALS,
  Synth,
  WOOD_PARTIALS,
  midiHz,
  pluck,
  sequence,
  vowelSequence,
  type Partials,
} from './synth';
import type { Recipe, SfxName } from './types';

const pop: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.06);
  s.note({
    dur: 0.12,
    freq: [
      [0, 360 * pitch],
      [0.045, 1150 * pitch, 'exp'],
      [0.12, 1300 * pitch, 'exp'],
    ],
    wave: 'soft',
    env: pluck(0.12, 1, 0.002),
    gain: 0.34,
  });
  s.click({ freq: 3200, q: 1.5, dur: 0.006, gain: 0.06 });
  return s.done();
};

const poof: Recipe = (voice) => {
  const s = new Synth(voice, 1.6);
  const pitch = s.vary(0.05);
  s.burst({
    dur: 0.32,
    color: 'pink',
    type: 'bandpass',
    freq: [
      [0, 1900 * pitch],
      [0.3, 420 * pitch, 'exp'],
    ],
    q: 0.8,
    env: [
      [0, 0],
      [0.012, 1],
      [0.32, 0, 'exp'],
    ],
    gain: 0.5,
  });
  s.thump({ from: 150 * pitch, to: 70 * pitch, dur: 0.2, gain: 0.14 });
  return s.done();
};

const boing: Recipe = (voice) => {
  const s = new Synth(voice, 1.1);
  const pitch = s.vary(0.05);
  const dur = 0.42;
  const amp = s.envelope(pluck(dur, 1, 0.004), 0.3);
  const spring = s.osc(
    'triangle',
    [
      [0, 210 * pitch],
      [0.06, 300 * pitch, 'exp'],
      [dur, 330 * pitch, 'exp'],
    ],
    { dur: dur + 0.02, dest: amp },
  );
  s.lfo(spring.detune, {
    rate: [
      [0, 15],
      [dur, 11],
    ],
    depth: [
      [0, 380],
      [dur, 30, 'exp'],
    ],
    dur: dur + 0.02,
  });
  return s.done();
};

const whoosh: Recipe = (voice) => {
  const s = new Synth(voice, 3.1);
  const pitch = s.vary(0.06);
  s.burst({
    dur: 0.32,
    color: 'white',
    type: 'bandpass',
    freq: [
      [0, 450 * pitch],
      [0.16, 2600 * pitch, 'exp'],
      [0.32, 800 * pitch, 'exp'],
    ],
    q: 1.3,
    swell: 0.4,
    gain: 0.42,
    pan: [
      [0, -0.6],
      [0.32, 0.6],
    ],
  });
  return s.done();
};

const click: Recipe = (voice) => {
  const s = new Synth(voice, 0.9);
  const pitch = s.vary(0.04);
  s.click({ freq: 2300 * pitch, q: 2.5, dur: 0.012, gain: 0.22 });
  s.note({ dur: 0.04, freq: 1450 * pitch, wave: 'soft', env: pluck(0.04, 1, 0.001), gain: 0.12 });
  return s.done();
};

const sparkle: Recipe = (voice) => {
  const s = new Synth(voice, 1.9);
  const pitch = s.vary(0.03);
  const notes = [1319, 1568, 1760, 2093, 2637];
  notes.forEach((freq, index) => {
    s.bell({
      at: index * 0.055 + s.jitter(0.006) + 0.006,
      freq: freq * pitch,
      dur: 0.3,
      gain: 0.12 - index * 0.012,
      pan: -0.5 + index * 0.25,
    });
  });
  return s.done();
};

const tick: Recipe = (voice) => {
  const s = new Synth(voice, 0.9);
  const pitch = s.vary(0.03);
  s.click({ freq: 1900 * pitch, q: 7, dur: 0.02, gain: 0.2 });
  s.note({ dur: 0.03, freq: 1250 * pitch, wave: 'sine', env: pluck(0.03, 1, 0.001), gain: 0.08 });
  return s.done();
};

const chime: Recipe = (voice) => {
  const s = new Synth(voice, 1.7);
  const pitch = s.vary(0.02);
  [1047, 1319, 1568].forEach((freq, index) => {
    s.bell({
      at: index * 0.07,
      freq: freq * pitch,
      dur: 0.42,
      gain: 0.14,
      pan: -0.25 + index * 0.25,
    });
  });
  return s.done();
};

const swoosh: Recipe = (voice) => {
  const s = new Synth(voice, 1.45);
  const pitch = s.vary(0.05);
  s.burst({
    dur: 0.36,
    color: 'pink',
    type: 'lowpass',
    freq: [
      [0, 300 * pitch],
      [0.2, 2300 * pitch, 'exp'],
      [0.36, 900 * pitch, 'exp'],
    ],
    q: 3,
    swell: 0.45,
    gain: 0.4,
    pan: [
      [0, -0.35],
      [0.36, 0.25],
    ],
  });
  return s.done();
};

const yum: Recipe = (voice) => {
  const s = new Synth(voice, 0.8).stereo();
  const pitch = s.vary(0.02);
  [84, 88, 91].forEach((note, index) => {
    s.mallet({
      at: index * 0.075,
      freq: midiHz(note) * pitch,
      dur: 0.32,
      gain: 0.16,
      partials: MUSIC_BOX_PARTIALS,
      hit: 0.08,
      pan: -0.2 + index * 0.2,
    });
  });
  const twinkle = s.tremolo({ rate: 12, depth: 0.5, at: 0.22, dur: 0.33 });
  [96, 100].forEach((note, index) => {
    s.bell({
      at: 0.24 + index * 0.06,
      freq: midiHz(note) * pitch,
      dur: 0.26,
      gain: 0.05,
      partials: GLASS_PARTIALS,
      pan: index === 0 ? 0.35 : -0.35,
      dest: twinkle,
    });
  });
  return s.done();
};

const yuck: Recipe = (voice) => {
  const s = new Synth(voice, 0.42);
  const pitch = s.vary(0.03);
  [
    [0, 0.16, 523, 523],
    [0.18, 0.3, 440, 410],
  ].forEach(([at, dur, from, to], index) => {
    s.note({
      at,
      dur,
      freq: [
        [0, from * pitch],
        [dur * 0.45, from * pitch],
        [dur, to * pitch],
      ],
      wave: [1, 0.15, 0.04],
      vibrato: index === 1 ? { rate: 5.5, depth: 18, delay: 0.06 } : undefined,
      env: [
        [0, 0],
        [0.02, 1],
        [dur, 0, 'exp'],
      ],
      lowpass: 1400,
      gain: 0.3,
    });
  });
  return s.done();
};

const munch: Recipe = (voice) => {
  const s = new Synth(voice, 0.38);
  const pitch = s.vary(0.05);
  [0, 0.13, 0.26].forEach((offset, index) => {
    const at = offset === 0 ? 0 : offset + s.jitter(0.01);
    const lift = pitch * [1, 1.12, 1.04][index];
    s.note({
      at,
      dur: 0.08,
      freq: [
        [0, 330 * lift],
        [0.03, 560 * lift],
        [0.08, 500 * lift],
      ],
      wave: 'soft',
      env: [
        [0, 0],
        [0.008, 1],
        [0.08, 0, 'exp'],
      ],
      gain: 0.4,
    });
    s.mallet({
      at,
      freq: 740 * lift,
      dur: 0.07,
      gain: 0.08,
      partials: WOOD_PARTIALS,
      hit: 0.1,
    });
  });
  return s.done();
};

const rustle: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pace = s.vary(0.06);
  const dur = 0.5 * pace;
  s.burst({
    dur,
    color: 'white',
    freq: 4200 * s.vary(0.05),
    q: 0.7,
    env: [
      [0, 0],
      [0.04 * pace, 1],
      [0.11 * pace, 0.15],
      [0.18 * pace, 0.9],
      [0.26 * pace, 0.12],
      [0.33 * pace, 0.7],
      [dur, 0, 'exp'],
    ],
    gain: 0.5,
    pan: [
      [0, -0.3],
      [dur, 0.3],
    ],
  });
  const times = Array.from({ length: 22 }, (_, i) => (i / 22) * 0.42 * pace + s.range(0, 0.02));
  s.clicks({
    times,
    freq: times.map(() => s.range(3000, 7000)),
    gain: times.map(() => s.range(0.08, 0.22)),
    q: 1.5,
    dur: 0.004,
  });
  return s.done();
};

const splash: Recipe = (voice) => {
  const s = new Synth(voice, 0.85).stereo();
  const pitch = s.vary(0.05);
  s.bubble({ freq: 260 * pitch, rise: 3, dur: 0.07, gain: 0.24 });
  s.burst({
    at: 0.015,
    dur: 0.4,
    color: 'white',
    freq: [
      [0, 3200 * pitch],
      [0.35, 900 * pitch, 'exp'],
    ],
    q: 0.9,
    env: [
      [0, 0],
      [0.012, 1],
      [0.08, 0.55],
      [0.4, 0, 'exp'],
    ],
    gain: 1.2,
  });
  for (let i = 0; i < 6; i++) {
    s.bubble({
      at: 0.1 + i * 0.06 + s.range(0, 0.04),
      freq: s.range(900, 2200),
      rise: s.range(1.4, 2),
      dur: 0.03,
      gain: s.range(0.1, 0.18),
      pan: s.range(-0.5, 0.5),
    });
  }
  return s.done();
};

const rumble: Recipe = (voice) => {
  const s = new Synth(voice, 0.88);
  const pitch = s.vary(0.05);
  const dur = 0.56;
  const shake = s.tremolo({ rate: 11, depth: 0.55, dur: dur + 0.02 });
  s.burst({
    dur,
    color: 'brown',
    type: 'lowpass',
    freq: [
      [0, 600 * pitch],
      [0.2, 900 * pitch],
      [dur, 420 * pitch],
    ],
    q: 1.5,
    swell: 0.3,
    gain: 0.5,
    dest: shake,
  });
  s.thump({ from: 170 * pitch, to: 70 * pitch, dur: 0.22, gain: 0.3, thud: 0.6 });
  s.thump({ at: 0.2, from: 150 * pitch, to: 65 * pitch, dur: 0.22, gain: 0.24, thud: 0.5 });
  const times = Array.from({ length: 10 }, () => s.range(0.12, 0.48));
  s.clicks({
    times,
    freq: times.map(() => s.range(800, 1800)),
    gain: times.map(() => s.range(0.08, 0.15)),
    q: 4,
    dur: 0.012,
    ring: 0.3,
  });
  return s.done();
};

const rain: Recipe = (voice) => {
  const s = new Synth(voice, 1.8).stereo();
  const dur = 0.56;
  s.burst({
    dur,
    color: 'pink',
    type: 'highpass',
    freq: 3200,
    q: 0.5,
    env: [
      [0, 0],
      [0.1, 1],
      [0.42, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.08,
  });
  const count = 18;
  for (let i = 0; i < count; i++) {
    s.bubble({
      at: (i / count) * 0.5 + s.range(0, 0.025),
      freq: i % 3 === 1 ? s.range(950, 1500) : s.range(1700, 3800),
      rise: s.range(1.2, 1.6),
      dur: 0.022,
      gain: s.range(0.08, 0.17),
      pan: s.range(-0.7, 0.7),
    });
  }
  return s.done();
};

const twinkle: Recipe = (voice) => {
  const s = new Synth(voice, 1.9);
  const pitch = s.vary(0.03);
  const flicker = s.tremolo({ rate: 13, depth: 0.5, dur: 0.58 });
  [1319, 1976, 1661, 2637].forEach((freq, index) => {
    s.bell({
      at: index * 0.085 + (index > 0 ? s.jitter(0.008) : 0),
      freq: freq * pitch,
      dur: 0.3,
      gain: 0.13 - index * 0.012,
      partials: GLASS_PARTIALS,
      pan: index % 2 === 0 ? -0.35 : 0.35,
      dest: flicker,
    });
  });
  s.bell({ at: 0.3, freq: 3520 * pitch, dur: 0.24, gain: 0.05, dest: flicker });
  return s.done();
};

const creak: Recipe = (voice) => {
  const s = new Synth(voice, 1.6);
  const pitch = s.vary(0.06);
  const dur = 0.5;
  const amp = s.envelope(
    [
      [0, 0],
      [0.04, 0.8],
      [0.14, 0.5],
      [0.22, 1],
      [0.36, 0.7],
      [dur, 0, 'exp'],
    ],
    0.5,
  );
  const wood = s.gain(1);
  wood.connect(s.filter('bandpass', 750 * pitch, 7, { dest: amp }));
  wood.connect(s.filter('bandpass', 1650 * pitch, 6, { dest: s.gain(0.6, { dest: amp }) }));
  const saw = s.osc(
    'sawtooth',
    [
      [0, 38],
      [0.2, 95],
      [0.34, 120],
      [dur, 70],
    ],
    { dur: dur + 0.02, dest: wood },
  );
  s.wander(saw.detune, { depth: 160, rate: 3, dur: dur + 0.02 });
  return s.done();
};

const honk: Recipe = (voice) => {
  const s = new Synth(voice, 1.8);
  const pitch = s.vary(0.03);
  [
    [0, 0.16],
    [0.23, 0.33],
  ].forEach(([at, dur]) => {
    [185, 233].forEach((freq, index) => {
      s.note({
        at,
        dur,
        freq: [
          [0, freq * pitch * 0.94],
          [0.03, freq * pitch],
        ],
        wave: 'reed',
        env: [
          [0, 0],
          [0.02, 1],
          [dur - 0.05, 0.85],
          [dur, 0, 'exp'],
        ],
        lowpass: 1500,
        gain: index === 0 ? 0.24 : 0.16,
      });
    });
  });
  return s.done();
};

const COIN_PARTIALS: Partials = [
  [1, 1, 1],
  [1.47, 0.6, 0.8],
  [2.18, 0.35, 0.5],
  [3.1, 0.2, 0.3],
];

const coins: Recipe = (voice) => {
  const s = new Synth(voice, 1.4);
  const pitch = s.vary(0.04);
  const hits = [0, 0.06, 0.1, 0.16, 0.21, 0.28, 0.34];
  hits.forEach((offset, index) => {
    const at = offset === 0 ? 0 : offset + s.jitter(0.01);
    const freq = s.range(2300, 3600) * pitch;
    s.bell({
      at,
      freq,
      dur: 0.2,
      gain: index === 0 ? 0.12 : s.range(0.06, 0.1),
      partials: COIN_PARTIALS,
      pan: s.range(-0.5, 0.5),
    });
    s.click({ at, freq: freq * 1.5, q: 3, dur: 0.004, gain: 0.08 });
  });
  return s.done();
};

const bubble: Recipe = (voice) => {
  const s = new Synth(voice, 1.0);
  const pitch = s.vary(0.06);
  [
    [0, 330, 2.2, 0.09, 0.4],
    [0.13, 500, 2, 0.07, 0.3],
    [0.23, 280, 2.4, 0.1, 0.36],
  ].forEach(([at, freq, rise, dur, gain]) => {
    s.bubble({ at, freq: freq * pitch, rise, dur, gain });
    s.thump({
      at,
      from: freq * pitch * 0.6,
      to: freq * pitch * 0.4,
      dur: dur * 0.6,
      gain: gain * 0.3,
    });
  });
  return s.done();
};

const boo: Recipe = (voice) => {
  const s = new Synth(voice, 0.6);
  const pitch = s.vary(0.04);
  s.thump({ from: 220, to: 120, dur: 0.04, gain: 0.15 });
  s.vocal({
    at: 0.01,
    dur: 0.52,
    pitch: [
      [0, 330],
      [0.12, 440],
      [0.34, 410],
      [0.52, 300],
    ],
    transpose: pitch,
    vowel: [
      [0, 'u'],
      [0.12, 'o'],
      [0.35, 'u'],
      [0.52, 'u'],
    ],
    wave: 'glottal',
    breath: 0.5,
    vibrato: { rate: 5.5, depth: 45, delay: 0.12 },
    env: [
      [0, 0],
      [0.05, 0.8],
      [0.15, 1],
      [0.38, 0.7],
      [0.52, 0, 'exp'],
    ],
    tone: 3500,
    gain: 0.03,
  });
  return s.done();
};

const shine: Recipe = (voice) => {
  const s = new Synth(voice, 0.45).stereo();
  const pitch = s.vary(0.02);
  s.pad({
    dur: 0.56,
    freqs: [523, 659, 784, 1047].map((f) => f * pitch),
    wave: 'soft',
    spread: 10,
    env: [
      [0, 0],
      [0.12, 1],
      [0.3, 0.8],
      [0.56, 0, 'exp'],
    ],
    shimmer: { rate: 9, depth: 0.45 },
    gain: 0.36,
  });
  [2637, 3136, 3951].forEach((freq, index) => {
    s.bell({
      at: 0.08 + index * 0.11,
      freq: freq * pitch,
      dur: 0.2,
      gain: 0.06,
      pan: -0.4 + index * 0.4,
    });
  });
  return s.done();
};

const whirr: Recipe = (voice) => {
  const s = new Synth(voice, 1.5);
  const pitch = s.vary(0.05);
  const dur = 0.56;
  const blades = s.tremolo({
    rate: [
      [0, 8],
      [0.3, 14],
      [dur, 10],
    ],
    depth: 0.85,
    dur: dur + 0.02,
  });
  s.burst({
    dur,
    color: 'pink',
    freq: [
      [0, 1000 * pitch],
      [0.3, 1900 * pitch],
      [dur, 1250 * pitch],
    ],
    q: 1.4,
    swell: 0.45,
    gain: 0.6,
    dest: blades,
  });
  s.note({
    dur,
    freq: [
      [0, 165 * pitch],
      [0.3, 220 * pitch],
      [dur, 185 * pitch],
    ],
    wave: 'triangle',
    env: [
      [0, 0],
      [0.15, 1],
      [0.4, 0.8],
      [dur, 0, 'exp'],
    ],
    gain: 0.06,
    dest: blades,
  });
  return s.done();
};

const giggle: Recipe = (voice) => {
  const s = new Synth(voice, 0.55);
  const pitch = s.vary(0.05);
  const starts = [0, 0.085, 0.17, 0.255, 0.35];
  starts.forEach((at) => {
    s.burst({ at, dur: 0.025, color: 'pink', freq: 2500, q: 1, gain: 0.02 });
  });
  s.vocal({
    at: 0.01,
    dur: starts[starts.length - 1] + 0.12,
    pitch: sequence(
      [
        [0, 640],
        [0.025, 760],
        [0.07, 620],
      ],
      starts,
      (i) => [1.08, 1.02, 0.98, 0.94, 1.12][i],
    ),
    transpose: pitch,
    vowel: vowelSequence(
      [
        [0, 'i'],
        [0.04, 'e'],
        [0.07, 'e'],
      ],
      starts,
    ),
    shift: 1.3,
    breath: 0.35,
    env: sequence(
      [
        [0, 0],
        [0.01, 1],
        [0.045, 0.6],
        [0.07, 0, 'exp'],
      ],
      starts,
      (i) => [1, 0.9, 0.85, 0.8, 0.95][i],
    ),
    tone: 6000,
    gain: 0.45,
  });
  return s.done();
};

const thump: Recipe = (voice) => {
  const s = new Synth(voice, 0.68);
  const pitch = s.vary(0.05);
  s.thump({ from: 300 * pitch, to: 120 * pitch, dur: 0.24, gain: 0.32, thud: 0.7 });
  s.mallet({ freq: 340 * pitch, dur: 0.16, gain: 0.3, partials: WOOD_PARTIALS, hit: 0.35 });
  return s.done();
};

const cardFlip: Recipe = (voice) => {
  const s = new Synth(voice, 2.5);
  const pitch = s.vary(0.06);
  s.burst({
    dur: 0.06,
    color: 'white',
    freq: [
      [0, 1800 * pitch],
      [0.06, 4200 * pitch],
    ],
    q: 1.2,
    env: [
      [0, 0],
      [0.006, 1],
      [0.025, 0.5],
      [0.06, 0, 'exp'],
    ],
    gain: 0.3,
  });
  s.click({ at: 0.045, freq: 2600 * pitch, q: 2.5, dur: 0.008, gain: 0.07 });
  return s.done();
};

const match: Recipe = (voice) => {
  const s = new Synth(voice, 1.6).stereo();
  const pitch = s.vary(0.02);
  [
    [0, 784],
    [0.11, 1047],
  ].forEach(([at, freq], index) => {
    s.bell({ at, freq: freq * pitch, dur: 0.42, gain: 0.15, pan: index === 0 ? -0.25 : 0.25 });
  });
  [3136, 3951, 4699].forEach((freq, index) => {
    s.bell({
      at: 0.18 + index * 0.05,
      freq: freq * pitch,
      dur: 0.18,
      gain: 0.04,
      pan: -0.4 + index * 0.4,
    });
  });
  return s.done();
};

const noMatch: Recipe = (voice) => {
  const s = new Synth(voice, 0.5);
  const pitch = s.vary(0.02);
  [
    [0, 523, 494],
    [0.15, 392, 370],
  ].forEach(([at, from, to]) => {
    s.note({
      at,
      dur: 0.12,
      freq: [
        [0, from * pitch],
        [0.12, to * pitch],
      ],
      wave: [1, 0.3, 0.1],
      env: [
        [0, 0],
        [0.012, 1],
        [0.07, 0.7],
        [0.12, 0, 'exp'],
      ],
      gain: 0.3,
    });
  });
  return s.done();
};

const win: Recipe = (voice) => {
  const s = new Synth(voice, 1.0).stereo();
  const pitch = s.vary(0.015);
  const party = s.bus(s.master, s.reverb({ seconds: 0.25, wet: 0.2, bright: 0.5 }));
  [72, 76, 79, 84].forEach((note, index) => {
    s.mallet({
      at: index * 0.09,
      freq: midiHz(note) * pitch,
      dur: 0.32,
      gain: 0.22,
      hit: 0.25,
      pan: -0.45 + index * 0.3,
      dest: party,
    });
  });
  s.mallet({ at: 0.4, freq: midiHz(79) * pitch, dur: 0.2, gain: 0.18, hit: 0.25, dest: party });
  [84, 88, 91].forEach((note) => {
    s.bell({ at: 0.5, freq: midiHz(note) * pitch, dur: 0.45, gain: 0.09, dest: party });
  });
  [96, 100, 103, 108, 103].forEach((note, index) => {
    s.bell({
      at: 0.56 + index * 0.06,
      freq: midiHz(note) * pitch,
      dur: 0.2,
      gain: 0.035,
      pan: index % 2 === 0 ? -0.4 : 0.4,
      dest: party,
    });
  });
  return s.done();
};

function steps(freqs: readonly number[]): Recipe {
  return (voice) => {
    const s = new Synth(voice, 1.4);
    const pitch = s.vary(0.02);
    freqs.forEach((freq, index) => {
      s.note({
        at: index * 0.085,
        dur: 0.11,
        freq: freq * pitch,
        wave: 'soft',
        env: pluck(0.11, 1, 0.004),
        gain: 0.22,
      });
    });
    return s.done();
  };
}

export const SFX: Record<SfxName, Recipe> = {
  pop,
  poof,
  boing,
  whoosh,
  click,
  sparkle,
  tick,
  chime,
  swoosh,
  stepUp: steps([660, 880]),
  stepDown: steps([880, 660]),
  yum,
  yuck,
  munch,
  rustle,
  splash,
  rumble,
  rain,
  twinkle,
  creak,
  honk,
  coins,
  bubble,
  boo,
  shine,
  whirr,
  giggle,
  thump,
  cardFlip,
  match,
  noMatch,
  win,
};
