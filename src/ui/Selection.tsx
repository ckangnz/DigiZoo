import { useLayoutEffect, useRef, useState } from 'react';
import { useCamera } from '../engine/camera';
import { frameOf, type Frame } from '../engine/geometry';
import { worldToScreen, type Transform } from '../engine/viewport';
import { getAnimal } from '../registry/animals';
import { selectedSticker, useStore } from '../store/store';
import {
  bringForward,
  duplicateSticker,
  flipSticker,
  playSticker,
  removeSticker,
  sendBackward,
  toggleWalk,
} from './actions';
import {
  BackwardIcon,
  CopyIcon,
  FlipIcon,
  ForwardIcon,
  PawsIcon,
  PlayIcon,
  RotateIcon,
  ScaleIcon,
  StopIcon,
  TrashIcon,
} from './icons';

function useSelectedFrame(): { id: string; name: string; frame: Frame } | null {
  const st = useStore(selectedSticker);
  const def = st ? getAnimal(st.animalId) : undefined;
  if (!st || !def) return null;
  return { id: st.id, name: def.name, frame: frameOf(st, def) };
}

function screenBox(frame: Frame, t: Transform) {
  const [cx, cy] = worldToScreen(t, frame.cx, frame.cy);
  const w = frame.w * t.s;
  const h = frame.h * t.s;
  const a = (frame.rotation * Math.PI) / 180;
  const ex = (Math.abs(Math.cos(a)) * w + Math.abs(Math.sin(a)) * h) / 2;
  const ey = (Math.abs(Math.sin(a)) * w + Math.abs(Math.cos(a)) * h) / 2;
  return { cx, cy, w, h, minX: cx - ex, maxX: cx + ex, minY: cy - ey, maxY: cy + ey };
}

export function SelectionOverlay() {
  const sel = useSelectedFrame();
  const t = useCamera((s) => s.t);
  if (!sel) return null;
  const { cx, cy, w, h } = screenBox(sel.frame, t);
  return (
    <div
      className="selection"
      style={{
        width: w,
        height: h,
        transform: `translate(${cx - w / 2}px, ${cy - h / 2}px) rotate(${sel.frame.rotation}deg)`,
      }}
    >
      <div className="selection-frame" />
      <div className="handle handle-rotate" data-handle="rotate" aria-label="Rotate">
        <RotateIcon size={22} />
      </div>
      <div className="handle handle-scale" data-handle="scale" aria-label="Resize">
        <ScaleIcon size={20} />
      </div>
    </div>
  );
}

export function Toolbar() {
  const sel = useSelectedFrame();
  const t = useCamera((s) => s.t);
  const vp = useCamera((s) => s.vp);
  const walking = useStore((s) => !!sel && s.walkingId === sel.id);
  const index = useStore((s) => (sel ? s.stickers.findIndex((x) => x.id === sel.id) : -1));
  const count = useStore((s) => s.stickers.length);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 420, h: 64 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [!!sel]);

  if (!sel) return null;
  const box = screenBox(sel.frame, t);
  const docked = vp.w < 560;
  const margin = 10;
  let left = Math.min(vp.w - size.w / 2 - margin, Math.max(size.w / 2 + margin, box.cx));
  let top = box.minY - size.h - 64;
  if (top < 84) top = box.maxY + 34;
  if (top + size.h > vp.h - margin)
    top = Math.max(84, Math.min(vp.h - size.h - margin, box.minY - size.h - 20));
  if (docked) {
    left = vp.w / 2;
    top = vp.h - size.h - 14;
  }
  const id = sel.id;
  return (
    <div
      ref={ref}
      className={`toolbar${docked ? ' docked' : ''}`}
      data-ui
      style={{ transform: `translate(${left - size.w / 2}px, ${top}px)` }}
    >
      <span className="toolbar-name">{sel.name}</span>
      <button className="tool tool-play" aria-label="Play sound" onClick={() => playSticker(id)}>
        <PlayIcon />
      </button>
      <button
        className={`tool tool-walk${walking ? ' active' : ''}`}
        aria-label={walking ? 'Stop walking' : 'Walk'}
        aria-pressed={walking}
        onClick={() => toggleWalk(id)}
      >
        {walking ? <StopIcon /> : <PawsIcon />}
      </button>
      <button className="tool" aria-label="Flip" onClick={() => flipSticker(id)}>
        <FlipIcon />
      </button>
      <button className="tool" aria-label="Duplicate" onClick={() => duplicateSticker(id)}>
        <CopyIcon />
      </button>
      <button
        className="tool"
        aria-label="Bring forward"
        disabled={index === count - 1}
        onClick={() => bringForward(id)}
      >
        <ForwardIcon />
      </button>
      <button
        className="tool"
        aria-label="Send backward"
        disabled={index <= 0}
        onClick={() => sendBackward(id)}
      >
        <BackwardIcon />
      </button>
      <button className="tool tool-delete" aria-label="Delete" onClick={() => removeSticker(id)}>
        <TrashIcon />
      </button>
    </div>
  );
}
