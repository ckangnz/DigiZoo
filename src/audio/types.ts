export interface Voice {
  ctx: BaseAudioContext;
  out: AudioNode;
  t0: number;
  rand: () => number;
}

export type Recipe = (voice: Voice) => number;

export type SfxName =
  | 'pop'
  | 'poof'
  | 'boing'
  | 'whoosh'
  | 'click'
  | 'sparkle'
  | 'tick'
  | 'chime'
  | 'swoosh'
  | 'stepUp'
  | 'stepDown'
  | 'yum'
  | 'yuck'
  | 'munch'
  | 'rustle'
  | 'splash'
  | 'rumble'
  | 'rain'
  | 'twinkle'
  | 'creak'
  | 'honk'
  | 'coins'
  | 'bubble'
  | 'boo'
  | 'shine'
  | 'whirr'
  | 'giggle'
  | 'thump'
  | 'cardFlip'
  | 'match'
  | 'noMatch'
  | 'win';
