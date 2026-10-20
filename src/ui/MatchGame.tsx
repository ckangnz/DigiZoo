import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { create } from 'zustand';
import { cancelSpeech, playAnimal, playSfx, speak, stopAnimal } from '../audio/engine';
import { stickerUrl } from '../art/cache';
import { GRID_SIZES, buildDeck, pairsFor, pickAnimals, type GridSize } from '../game/deck';
import { ttsLang, useT } from '../i18n';
import { ANIMALS, animalsIn, getAnimal } from '../registry/animals';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { ChevronLeftIcon, PawsIcon, RefreshIcon } from './icons';

type Source = 'world' | 'all';

interface GamePrefs {
  size: GridSize;
  source: Source;
  best: Partial<Record<GridSize, number>>;
}

interface GameState extends GamePrefs {
  open: boolean;
}

const STORAGE_KEY = 'digizoo.match';

function loadPrefs(): GamePrefs {
  const fallback: GamePrefs = { size: 3, source: 'world', best: {} };
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as Partial<GamePrefs> | null;
    if (!saved) return fallback;
    return {
      size: GRID_SIZES.includes(saved.size as GridSize) ? (saved.size as GridSize) : fallback.size,
      source: saved.source === 'all' ? 'all' : 'world',
      best: saved.best && typeof saved.best === 'object' ? saved.best : {},
    };
  } catch {
    return fallback;
  }
}

export const useGame = create<GameState>(() => ({ open: false, ...loadPrefs() }));

function savePrefs(patch: Partial<GamePrefs>): void {
  useGame.setState(patch);
  const { size, source, best } = useGame.getState();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, source, best }));
  } catch {
    return;
  }
}

export function openGame(): void {
  playSfx('swoosh');
  useGame.setState({ open: true });
}

export function closeGame(): void {
  stopAnimal();
  cancelSpeech();
  useGame.setState({ open: false });
}

export function MatchGame() {
  const open = useGame((s) => s.open);
  return open ? <Game /> : null;
}

const STAR = (
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <path
      d="M50 8 61.8 35.8 91.8 38.4 69 58.2 75.9 87.6 50 72 24.1 87.6 31 58.2 8.2 38.4 38.2 35.8Z"
      fill="#ffc93c"
      stroke="#f29d0f"
      strokeWidth="7"
      strokeLinejoin="round"
    />
    <circle cx="42" cy="51" r="4.2" fill="#5a3a12" />
    <circle cx="58" cy="51" r="4.2" fill="#5a3a12" />
    <path
      d="M43.5 60.5q6.5 6 13 0"
      fill="none"
      stroke="#5a3a12"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 7) * 0.12}s`,
  hue: (i * 47) % 360,
  spin: `${(i % 2 ? 1 : -1) * (240 + ((i * 53) % 300))}deg`,
}));

function Game() {
  const tr = useT();
  const themeId = useStore((s) => s.themeId);
  const sayNames = useStore((s) => s.sayNames);
  const size = useGame((s) => s.size);
  const source = useGame((s) => s.source);
  const best = useGame((s) => s.best);
  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    const all = ANIMALS.map((a) => a.id);
    const local = source === 'world' ? animalsIn(themeId).map((a) => a.id) : all;
    return { cards: buildDeck(pickAnimals(local, all, pairsFor(size)), size), round };
  }, [themeId, size, source, round]).cards;
  const [up, setUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{ moves: number; newBest: boolean } | null>(null);
  const locked = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    locked.current = false;
    setUp([]);
    setMatched(new Set());
    setMoves(0);
    setResult(null);
  }, [deck]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeGame();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const finish = (total: number) => {
    const previous = useGame.getState().best[size];
    const newBest = previous === undefined || total < previous;
    if (newBest) savePrefs({ best: { ...useGame.getState().best, [size]: total } });
    setResult({ moves: total, newBest });
    playSfx('win');
  };

  const flip = (index: number) => {
    const card = deck[index];
    if (!card.animalId) {
      playSfx('twinkle');
      return;
    }
    if (locked.current || result || up.includes(index) || matched.has(card.animalId)) return;
    playSfx('cardFlip');
    const open = [...up, index];
    setUp(open);
    if (open.length < 2) return;
    const total = moves + 1;
    setMoves(total);
    const [a, b] = open.map((i) => deck[i].animalId);
    if (a === b && a) {
      const found = new Set(matched).add(a);
      setMatched(found);
      setUp([]);
      playSfx('match');
      later(() => {
        const def = getAnimal(a);
        const duration = playAnimal(def?.sound || a);
        if (sayNames) speak(tr.name(a, def?.name), duration * 1000 + 120, ttsLang(tr.lang));
      }, 260);
      if (found.size === pairsFor(size)) later(() => finish(total), 1100);
      return;
    }
    locked.current = true;
    later(() => {
      setUp([]);
      locked.current = false;
      playSfx('noMatch');
    }, 950);
  };

  const restart = () => {
    playSfx('swoosh');
    setRound((r) => r + 1);
  };

  const theme = getTheme(themeId);
  const bestMoves = best[size];
  return (
    <div
      className="game"
      data-ui
      role="dialog"
      aria-modal="true"
      aria-label={tr.t('matchingGame')}
      style={{ ['--accent' as string]: theme.accent } as CSSProperties}
    >
      <header className="game-bar">
        <button className="btn" aria-label={tr.t('backToMap')} onClick={closeGame}>
          <ChevronLeftIcon />
        </button>
        <div className="game-title">
          <h2 dir="auto">{tr.t('matchingGame')}</h2>
          <p dir="auto">{tr.t('findPairs')}</p>
        </div>
        <span className="game-moves" dir="auto" aria-live="polite">
          {tr.t('moves', { n: String(moves) })}
        </span>
        <button className="btn" aria-label={tr.t('newGame')} onClick={restart}>
          <RefreshIcon />
        </button>
      </header>
      <div className="game-options">
        <div className="seg" role="group" aria-label={tr.t('gridSize')}>
          {GRID_SIZES.map((n) => (
            <button
              key={n}
              className={n === size ? 'on' : ''}
              aria-pressed={n === size}
              onClick={() => {
                playSfx('click');
                savePrefs({ size: n });
              }}
            >
              {n} × {n}
            </button>
          ))}
        </div>
        <div className="seg" role="group" aria-label={tr.t('cardsFrom')}>
          {(['world', 'all'] as const).map((s) => (
            <button
              key={s}
              className={s === source ? 'on' : ''}
              aria-pressed={s === source}
              dir="auto"
              onClick={() => {
                playSfx('click');
                savePrefs({ source: s });
              }}
            >
              {s === 'world' ? tr.world(themeId) : tr.t('allWorlds')}
            </button>
          ))}
        </div>
      </div>
      <div className="game-board" style={{ ['--n' as string]: size } as CSSProperties}>
        {deck.map((card, i) => {
          if (!card.animalId)
            return (
              <button
                key={card.key}
                className="card card-star up"
                aria-label={tr.t('freeStar')}
                onClick={() => flip(i)}
              >
                <span className="card-inner">
                  <span className="card-face card-front">{STAR}</span>
                </span>
              </button>
            );
          const def = getAnimal(card.animalId);
          const isMatched = matched.has(card.animalId);
          const faceUp = isMatched || up.includes(i);
          return (
            <button
              key={card.key}
              className={`card${faceUp ? ' up' : ''}${isMatched ? ' matched' : ''}`}
              data-card={card.animalId}
              aria-label={
                faceUp ? tr.name(card.animalId, def?.name) : tr.t('card', { n: String(i + 1) })
              }
              onClick={() => flip(i)}
            >
              <span className="card-inner">
                <span className="card-face card-back">
                  <PawsIcon size={36} />
                </span>
                <span className="card-face card-front">
                  {def && <img src={stickerUrl(def, 'cartoon')} alt="" draggable={false} />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {result && (
        <div className="game-win" role="status">
          <div className="confetti" aria-hidden="true">
            {CONFETTI.map((c, i) => (
              <span
                key={i}
                style={
                  {
                    left: c.left,
                    animationDelay: c.delay,
                    ['--hue' as string]: c.hue,
                    ['--spin' as string]: c.spin,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="game-win-card">
            <div className="game-win-star">{STAR}</div>
            <h2 dir="auto">{tr.t('youDidIt')}</h2>
            <p dir="auto">{tr.t('foundAllPairs', { n: String(result.moves) })}</p>
            <p className="game-best" dir="auto">
              {result.newBest
                ? tr.t('newBest')
                : bestMoves !== undefined && tr.t('bestScore', { n: String(bestMoves) })}
            </p>
            <div className="game-win-actions">
              <button className="pill game-again" onClick={restart}>
                <RefreshIcon />
                <span dir="auto">{tr.t('playAgain')}</span>
              </button>
              <button className="pill" onClick={closeGame}>
                <ChevronLeftIcon />
                <span dir="auto">{tr.t('backToMap')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
