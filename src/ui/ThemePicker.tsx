import { useEffect } from 'react';
import { playSfx } from '../audio/engine';
import { useT } from '../i18n';
import { animalsIn, getAnimal } from '../registry/animals';
import { THEMES } from '../registry/themes';
import { useInstall } from '../pwa';
import { StickerImage } from './StickerImage';
import { useStore } from '../store/store';
import { openInstallGuide } from './InstallGuide';
import { CloseIcon, InstallIcon, PawsIcon } from './icons';

const LETTERS = ['D', 'i', 'g', 'i', 'Z', 'o', 'o'];
const LETTER_COLORS = ['#f2a93b', '#6fb83a', '#22a38a', '#2f9fdd', '#e6574e', '#ee8848', '#9b6be0'];

export function ThemePicker() {
  const open = useStore((s) => s.pickerOpen);
  const firstRun = useStore((s) => s.firstRun);
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
  return <PickerContent />;
}

const thumbSrc = (id: string) => `${import.meta.env.BASE_URL}thumbs/${id}.png`;

function PickerContent() {
  const firstRun = useStore((s) => s.firstRun);
  const themeId = useStore((s) => s.themeId);
  const openTheme = useStore((s) => s.openTheme);
  const close = useStore((s) => s.setPickerOpen);
  const installed = useInstall((s) => s.installed);
  const tr = useT();
  const mascot = getAnimal('lion');
  return (
    <div className="picker" data-ui>
      <div className="picker-inner">
        <header className="picker-head">
          {mascot && (
            <StickerImage id={mascot.id} look="cartoon" className="picker-mascot" alt="" />
          )}
          <div>
            <h1 className="logo" aria-label="DigiZoo">
              {LETTERS.map((l, i) => (
                <span key={i} style={{ color: LETTER_COLORS[i], ['--i' as string]: i }}>
                  {l}
                </span>
              ))}
            </h1>
            <p className="picker-sub" dir="auto">
              {tr.t('pickWorld')}
            </p>
          </div>
          {!firstRun && (
            <button
              className="btn picker-close"
              aria-label={tr.t('close')}
              onClick={() => close(false)}
            >
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
                <img
                  src={thumbSrc(t.id)}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="world-name" dir="auto">
                {tr.world(t.id)}
              </span>
              <span className="world-count">
                <PawsIcon size={18} />
                {animalsIn(t.id).length}
              </span>
            </button>
          ))}
        </div>
        {!installed && (
          <button className="pill picker-install" onClick={openInstallGuide}>
            <InstallIcon />
            <span dir="auto">{tr.t('installHint')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
