import { Mp3Encoder } from '@breezystack/lamejs';
import { SR } from './audio';

export const MP3_KBPS = 96;

const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const RATES = [44100, 48000, 32000];

export function encodeMp3(x: Float32Array, kbps = MP3_KBPS): Buffer {
  const encoder = new Mp3Encoder(1, SR, kbps);
  const pcm = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) {
    pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));
  }
  const chunks: Buffer[] = [];
  const push = (data: Uint8Array | Int8Array) => {
    if (data.length) chunks.push(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
  };
  for (let i = 0; i < pcm.length; i += 1152) push(encoder.encodeBuffer(pcm.subarray(i, i + 1152)));
  push(encoder.flush());
  return Buffer.concat(chunks);
}

export interface Mp3Summary {
  frames: number;
  bitrates: number[];
  sampleRates: number[];
  mono: boolean;
  mpeg1Layer3: boolean;
}

export function inspectMp3(bytes: Buffer): Mp3Summary {
  const bitrates = new Set<number>();
  const sampleRates = new Set<number>();
  let frames = 0;
  let mono = true;
  let mpeg1Layer3 = true;
  let offset = 0;
  while (offset + 4 <= bytes.length) {
    if (bytes[offset] !== 0xff || (bytes[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }
    const version = (bytes[offset + 1] >> 3) & 3;
    const layer = (bytes[offset + 1] >> 1) & 3;
    const bitrate = BITRATES[(bytes[offset + 2] >> 4) & 15] ?? 0;
    const rate = RATES[(bytes[offset + 2] >> 2) & 3] ?? 0;
    const padding = (bytes[offset + 2] >> 1) & 1;
    const mode = (bytes[offset + 3] >> 6) & 3;
    if (!bitrate || !rate) {
      offset++;
      continue;
    }
    if (version !== 3 || layer !== 1) mpeg1Layer3 = false;
    if (mode !== 3) mono = false;
    bitrates.add(bitrate);
    sampleRates.add(rate);
    frames++;
    offset += Math.floor((144000 * bitrate) / rate) + padding;
  }
  return { frames, bitrates: [...bitrates], sampleRates: [...sampleRates], mono, mpeg1Layer3 };
}
