import { useEffect } from 'react';
import { playSfx } from '../audio/engine';
import { sceneUrls, stickerUrl } from '../art/cache';
import { animalsIn, getAnimal } from '../registry/animals';
import { THEMES } from '../registry/themes';
import { useStore } from '../store/store';
import { CloseIcon, PawsIcon } from './icons';

const LETTERS = ['D', 'i', 'g', 'i', 'Z', 'o', 'o'];
const LETTER_COLORS = ['#f2a93b', '#6fb83a', '#22a38a', '#2f9fdd', '#e6574e', '#ee8848', '#9b6be0'];

export function ThemePicker() {
  const open = useStore((s) => s.pickerOpen);
  const firstRun = useStore((s) => s.firstRun);
  const themeId = useStore((s) => s.themeId);
  const openTheme = useStore((s) => s.openTheme);
  const close = useStore((s) => s.setPickerOpen);

  useEffect(() => {
    if (!open || firstRun) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, firstRun, close]);

  if (!open) return null;
  const mascot = getAnimal('lion');
  return (
    <div className="picker" data-ui>
      <div className="picker-inner">
        <header className="picker-head">
          {mascot && <img className="picker-mascot" src={stickerUrl(mascot, 'cartoon')} alt="" />}
          <div>
            <h1 className="logo" aria-label="DigiZoo">
              {LETTERS.map((l, i) => (
                <span key={i} style={{ color: LETTER_COLORS[i], ['--i' as string]: i }}>
                  {l}
                </span>
              ))}
            </h1>
            <p className="picker-sub">Pick a world!</p>
          </div>
          {!firstRun && (
            <button className="btn picker-close" aria-label="Close" onClick={() => close(false)}>
              <CloseIcon />
            </button>
          )}
        </header>
        <div className="picker-grid">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`world-card${t.id === themeId && !firstRun ? ' current' : ''}`}
              style={{ ['--accent' as string]: t.accent }}
              onClick={() => {
                playSfx('chime');
                openTheme(t.id);
              }}
            >
              <span className="world-thumb">
                <img src={sceneUrls(t.scene, 'day').back} alt="" draggable={false} />
                <img src={sceneUrls(t.scene, 'day').front} alt="" draggable={false} />
              </span>
              <span className="world-name">{t.name}</span>
              <span className="world-count">
                <PawsIcon size={18} />
                {animalsIn(t.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
