import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { playSfx } from '../audio/engine';
import { stickerUrl } from '../art/cache';
import { STYLES, type AnimalDef, type HabitatId, type StyleId } from '../art/core/types';
import { useCamera } from '../engine/camera';
import { screenToWorld } from '../engine/viewport';
import { ANIMALS, animalsIn, searchAnimals } from '../registry/animals';
import { THEMES, getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { addAnimal } from './actions';
import { AddAnimalIcon, ChevronLeftIcon, CloseIcon, SearchIcon } from './icons';

const STYLE_LABEL: Record<StyleId, string> = {
  cartoon: 'Cartoon',
  comic: 'Comic',
  painted: 'Painted',
};

type Chip = 'here' | 'all' | HabitatId;

const isNarrow = () => window.innerWidth < 720;

function useInView<T extends Element>(ref: React.RefObject<T | null>): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen]);
  return seen;
}

function dropToWorld(clientX: number, clientY: number): [number, number] | null {
  const map = document.querySelector('.map');
  const panel = document.querySelector('.panel');
  if (!map) return null;
  const pr = panel?.getBoundingClientRect();
  if (
    pr &&
    clientX >= pr.left &&
    clientX <= pr.right &&
    clientY >= pr.top &&
    clientY <= pr.bottom
  ) {
    return null;
  }
  const r = map.getBoundingClientRect();
  if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
  return screenToWorld(useCamera.getState().t, clientX - r.left, clientY - r.top);
}

function startTileGesture(e: ReactPointerEvent<HTMLButtonElement>, def: AnimalDef, style: StyleId) {
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const tile = e.currentTarget;
  const pointerId = e.pointerId;
  const startX = e.clientX;
  const startY = e.clientY;
  const isMouse = e.pointerType === 'mouse';
  let ghost: HTMLImageElement | null = null;

  const placeGhost = (x: number, y: number) => {
    if (ghost)
      ghost.style.transform = `translate(${x - 60}px, ${y - 60}px) rotate(-6deg) scale(1.08)`;
  };

  const cleanup = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    ghost?.remove();
    ghost = null;
    document.body.classList.remove('dragging-sticker');
  };

  const move = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!ghost) {
      const far = Math.hypot(dx, dy) > (isMouse ? 6 : 12);
      const sideways = Math.abs(dx) > Math.abs(dy) * 1.1;
      if (!far || (!isMouse && !sideways)) return;
      try {
        tile.setPointerCapture(pointerId);
      } catch {
        return;
      }
      ghost = document.createElement('img');
      ghost.src = stickerUrl(def, style);
      ghost.className = 'drag-ghost';
      ghost.alt = '';
      document.body.appendChild(ghost);
      document.body.classList.add('dragging-sticker');
      playSfx('click');
    }
    placeGhost(ev.clientX, ev.clientY);
  };

  const up = (ev: PointerEvent) => {
    if (ev.pointerId !== pointerId) return;
    const dragged = !!ghost;
    cleanup();
    if (dragged) {
      const at = dropToWorld(ev.clientX, ev.clientY);
      if (at) addAnimal(def.id, style, at);
      if (at && isNarrow()) useStore.getState().setPanelOpen(false);
      return;
    }
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 14) return;
    addAnimal(def.id, style);
    if (isNarrow()) useStore.getState().setPanelOpen(false);
  };

  const cancel = (ev: PointerEvent) => {
    if (ev.pointerId === pointerId) cleanup();
  };

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
}

const StickerTile = memo(function StickerTile({ def, style }: { def: AnimalDef; style: StyleId }) {
  const ref = useRef<HTMLButtonElement>(null);
  const visible = useInView(ref);
  return (
    <button
      ref={ref}
      className="tile"
      aria-label={`Add ${def.name} (${STYLE_LABEL[style]})`}
      onPointerDown={(e) => startTileGesture(e, def, style)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          addAnimal(def.id, style);
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {visible && <img src={stickerUrl(def, style)} alt="" draggable={false} decoding="async" />}
      <span className="tile-style">{STYLE_LABEL[style]}</span>
    </button>
  );
});

const AnimalRow = memo(function AnimalRow({ def }: { def: AnimalDef }) {
  return (
    <section className="animal-row">
      <h3>{def.name}</h3>
      <div className="variants">
        {STYLES.map((style) => (
          <StickerTile key={style} def={def} style={style} />
        ))}
      </div>
    </section>
  );
});

export function SidePanel() {
  const open = useStore((s) => s.panelOpen);
  const setOpen = useStore((s) => s.setPanelOpen);
  const themeId = useStore((s) => s.themeId);
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<Chip>('here');
  const listRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    if (query.trim()) return searchAnimals(query);
    if (chip === 'here') return animalsIn(themeId);
    if (chip === 'all') return ANIMALS;
    return animalsIn(chip);
  }, [query, chip, themeId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [chip, query, themeId]);

  const chips: { id: Chip; label: string }[] = [
    { id: 'here', label: `Here · ${getTheme(themeId).name}` },
    { id: 'all', label: 'All' },
    ...THEMES.filter((t) => t.id !== themeId).map((t) => ({ id: t.id as Chip, label: t.name })),
  ];

  return (
    <>
      {!open && (
        <button
          className="fab"
          data-ui
          aria-label="Add animals"
          onClick={() => {
            playSfx('swoosh');
            setOpen(true);
          }}
        >
          <AddAnimalIcon size={36} />
        </button>
      )}
      <aside className={`panel${open ? ' open' : ''}`} data-ui aria-hidden={!open} inert={!open}>
        <header className="panel-head">
          <h2>Animals</h2>
          <button className="btn small" aria-label="Close animals" onClick={() => setOpen(false)}>
            {isNarrowSafe() ? <CloseIcon size={22} /> : <ChevronLeftIcon size={22} />}
          </button>
        </header>
        <label className="search">
          <SearchIcon size={22} />
          <input
            type="search"
            value={query}
            placeholder="Find an animal…"
            onChange={(e) => setQuery(e.target.value)}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <CloseIcon size={18} />
            </button>
          )}
        </label>
        {!query.trim() && (
          <div className="chips" role="tablist">
            {chips.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={chip === c.id}
                className={`chip${chip === c.id ? ' on' : ''}`}
                onClick={() => setChip(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
        <div className="sticker-list" ref={listRef}>
          {list.map((def) => (
            <AnimalRow key={def.id} def={def} />
          ))}
          {!list.length && <p className="empty">No animals called “{query}” yet</p>}
        </div>
      </aside>
    </>
  );
}

function isNarrowSafe(): boolean {
  return typeof window !== 'undefined' && isNarrow();
}
