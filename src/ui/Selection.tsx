import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { create } from 'zustand';
import { playSfx } from '../audio/engine';
import { useCamera } from '../engine/camera';
import { frameOf, type Frame } from '../engine/geometry';
import { worldToScreen, type Transform } from '../engine/viewport';
import { foodSvg } from '../food/art';
import { dietOf } from '../food/diets';
import { FOOD_IDS, type FoodId } from '../food/foods';
import { useT } from '../i18n';
import type { StyleId } from '../art/core/types';
import { getAnimal } from '../registry/animals';
import { selectedSticker, useStore } from '../store/store';
import {
  bringForward,
  duplicateSticker,
  feedSticker,
  flipSticker,
  playSticker,
  removeSticker,
  sendBackward,
  toggleWalk,
} from './actions';
import { openInfo } from './InfoCard';
import {
  BackwardIcon,
  BowlIcon,
  CopyIcon,
  FlipIcon,
  ForwardIcon,
  InfoIcon,
  PawsIcon,
  PlayIcon,
  RotateIcon,
  ScaleIcon,
  SparkleIcon,
  StopIcon,
  TrashIcon,
} from './icons';

interface Selected {
  id: string;
  animalId: string;
  style: StyleId;
  name: string;
  isAnimal: boolean;
  canEat: boolean;
  frame: Frame;
}

function useSelected(): Selected | null {
  const st = useStore(selectedSticker);
  const { name } = useT();
  const def = st ? getAnimal(st.animalId) : undefined;
  if (!st || !def) return null;
  return {
    id: st.id,
    animalId: def.id,
    style: st.style,
    name: name(def.id, def.name),
    isAnimal: (def.kind ?? 'animal') === 'animal',
    canEat: !!dietOf(def.id),
    frame: frameOf(st, def),
  };
}

const useFeedingView = create<{ resting: boolean }>(() => ({ resting: false }));
const setResting = (resting: boolean) => useFeedingView.setState({ resting });

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
  const sel = useSelected();
  const t = useCamera((s) => s.t);
  const resting = useFeedingView((s) => s.resting);
  const tr = useT();
  if (!sel) return null;
  const { cx, cy, w, h } = screenBox(sel.frame, t);
  return (
    <div
      className={`selection${resting ? ' resting' : ''}`}
      style={{
        width: w,
        height: h,
        transform: `translate(${cx - w / 2}px, ${cy - h / 2}px) rotate(${sel.frame.rotation}deg)`,
      }}
    >
      <div className="selection-frame" />
      <div className="handle handle-rotate" data-handle="rotate" aria-label={tr.t('rotate')}>
        <RotateIcon size={22} />
      </div>
      <div className="handle handle-scale" data-handle="scale" aria-label={tr.t('resize')}>
        <ScaleIcon size={20} />
      </div>
    </div>
  );
}

function FoodTray({ stickerId, onFed }: { stickerId: string; onFed: () => void }) {
  const tr = useT();
  const icons = useMemo(() => FOOD_IDS.map((id) => [id, foodSvg(id, 44)] as const), []);
  return (
    <div className="food-tray" role="dialog" aria-label={tr.t('whatToEat')}>
      <h3>{tr.t('whatToEat')}</h3>
      <div className="food-grid">
        {icons.map(([id, svg]) => (
          <button
            key={id}
            className="food-btn"
            aria-label={tr.t('feedFood', { food: tr.food(id as FoodId) })}
            onClick={() => {
              feedSticker(stickerId, id);
              onFed();
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: svg }} />
            <span dir="auto">{tr.food(id)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toolbar() {
  const sel = useSelected();
  const t = useCamera((s) => s.t);
  const vp = useCamera((s) => s.vp);
  const tr = useT();
  const walking = useStore((s) => !!sel && s.walkingId === sel.id);
  const index = useStore((s) => (sel ? s.stickers.findIndex((x) => x.id === sel.id) : -1));
  const count = useStore((s) => s.stickers.length);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [trayFor, setTrayFor] = useState<string | null>(null);
  const resting = useFeedingView((s) => s.resting);
  const restTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const selected = !!sel;
  const selectedId = sel?.id ?? null;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [selected]);

  useEffect(() => {
    if (trayFor && trayFor !== selectedId) setTrayFor(null);
  }, [selectedId, trayFor]);

  useEffect(() => {
    clearTimeout(restTimer.current);
    setResting(false);
  }, [selectedId]);

  useEffect(() => () => clearTimeout(restTimer.current), []);

  const watchFeeding = () => {
    setTrayFor(null);
    setResting(true);
    clearTimeout(restTimer.current);
    restTimer.current = setTimeout(() => setResting(false), 2000);
  };

  if (!sel) return null;
  const docked = vp.w < 560;
  let style: CSSProperties | undefined;
  let top = 0;
  if (!docked) {
    if (!size) {
      style = { visibility: 'hidden' };
    } else {
      const box = screenBox(sel.frame, t);
      const margin = 10;
      const left = Math.min(vp.w - size.w / 2 - margin, Math.max(size.w / 2 + margin, box.cx));
      top = box.minY - size.h - 64;
      if (top < 84) top = box.maxY + 34;
      if (top + size.h > vp.h - margin)
        top = Math.max(84, Math.min(vp.h - size.h - margin, box.minY - size.h - 20));
      style = { transform: `translate(${left - size.w / 2}px, ${top}px)` };
    }
  }
  const trayOpen = trayFor === sel.id && sel.canEat;
  const trayBelow = !docked && top < 320;
  const id = sel.id;
  return (
    <div
      ref={ref}
      className={`toolbar${docked ? ' docked' : ''}${trayBelow ? ' tray-below' : ''}${resting ? ' resting' : ''}`}
      data-ui
      style={style}
    >
      <span className="toolbar-name" dir="auto">
        {sel.name}
      </span>
      <button
        className="tool tool-play"
        aria-label={tr.t('playSound')}
        onClick={() => playSticker(id)}
      >
        <PlayIcon />
      </button>
      <button
        className={`tool tool-walk${walking ? ' active' : ''}`}
        aria-label={
          walking
            ? tr.t(sel.isAnimal ? 'stopWalking' : 'stop')
            : tr.t(sel.isAnimal ? 'walk' : 'move')
        }
        aria-pressed={walking}
        onClick={() => toggleWalk(id)}
      >
        {walking ? <StopIcon /> : sel.isAnimal ? <PawsIcon /> : <SparkleIcon />}
      </button>
      {sel.canEat && (
        <button
          className={`tool tool-feed${trayOpen ? ' active' : ''}`}
          aria-label={tr.t('feed')}
          aria-expanded={trayOpen}
          onClick={() => {
            playSfx('click');
            setTrayFor(trayOpen ? null : id);
          }}
        >
          <BowlIcon />
        </button>
      )}
      <button
        className="tool tool-info"
        aria-label={tr.t('aboutName', { name: sel.name })}
        onClick={() => openInfo(sel.animalId, sel.style)}
      >
        <InfoIcon />
      </button>
      <button className="tool" aria-label={tr.t('flip')} onClick={() => flipSticker(id)}>
        <FlipIcon />
      </button>
      <button className="tool" aria-label={tr.t('duplicate')} onClick={() => duplicateSticker(id)}>
        <CopyIcon />
      </button>
      <button
        className="tool"
        aria-label={tr.t('bringForward')}
        disabled={index === count - 1}
        onClick={() => bringForward(id)}
      >
        <ForwardIcon />
      </button>
      <button
        className="tool"
        aria-label={tr.t('sendBackward')}
        disabled={index <= 0}
        onClick={() => sendBackward(id)}
      >
        <BackwardIcon />
      </button>
      <button
        className="tool tool-delete"
        aria-label={tr.t('delete')}
        onClick={() => removeSticker(id)}
      >
        <TrashIcon />
      </button>
      {trayOpen && <FoodTray stickerId={id} onFed={watchFeeding} />}
    </div>
  );
}
