import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { listVoices, playSfx, soundCredits, speak, type VoiceOption } from '../audio/engine';
import { resetCamera, zoomBy } from '../engine/camera';
import { availableLanguages, ttsLang, useT } from '../i18n';
import { LANGUAGE_BY_CODE } from '../i18n/languages';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { HoldButton } from './HoldButton';
import { openGame } from './MatchGame';
import {
  BroomIcon,
  CardsIcon,
  CloseIcon,
  FitIcon,
  GearIcon,
  GlobeIcon,
  InfoIcon,
  LanguageIcon,
  MinusIcon,
  MoonIcon,
  PawsIcon,
  PlusIcon,
  SoundOffIcon,
  SoundOnIcon,
  SpeechIcon,
  SunIcon,
  UndoIcon,
} from './icons';

function DayNightToggle() {
  const night = useStore((s) => s.night);
  const toggle = useStore((s) => s.toggleNight);
  const tr = useT();
  return (
    <button
      className={`daynight${night ? ' is-night' : ''}`}
      role="switch"
      aria-checked={night}
      aria-label={night ? tr.t('nightTime') : tr.t('dayTime')}
      onClick={() => {
        playSfx('whoosh');
        toggle();
      }}
    >
      <span className="daynight-icon sun">
        <SunIcon size={22} />
      </span>
      <span className="daynight-icon moon">
        <MoonIcon size={20} />
      </span>
      <span className="daynight-knob">
        {night ? <MoonIcon size={22} /> : <SunIcon size={24} />}
      </span>
    </button>
  );
}

export function Modal({
  title,
  onClose,
  children,
  className,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const tr = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div
      className="modal-backdrop"
      data-ui
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`dialog${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="btn dialog-close" aria-label={tr.t('close')} onClick={onClose}>
          <CloseIcon />
        </button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function LanguageDialog({ onClose }: { onClose: () => void }) {
  const tr = useT();
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  return (
    <Modal title={tr.t('language')} onClose={onClose}>
      <div className="lang-list">
        {availableLanguages().map((l) => (
          <button
            key={l.code}
            className={`lang-btn${l.code === lang ? ' on' : ''}`}
            lang={l.code}
            dir="auto"
            onClick={() => {
              playSfx('click');
              void setLang(l.code).then(onClose);
            }}
          >
            {l.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}

function voiceName(uri: string | null, lang: string): string | null {
  return (uri && listVoices(lang).find((v) => v.uri === uri)?.name) || null;
}

function useVoices(lang: string): VoiceOption[] {
  const [voices, setVoices] = useState(() => listVoices(lang));
  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return;
    const refresh = () => setVoices(listVoices(lang));
    refresh();
    speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, [lang]);
  return voices;
}

function VoiceDialog({ onClose }: { onClose: () => void }) {
  const tr = useT();
  const lang = useStore((s) => s.lang);
  const chosen = useStore((s) => s.voices[s.lang] ?? null);
  const setVoice = useStore((s) => s.setVoice);
  const tts = ttsLang(lang);
  const voices = useVoices(tts);
  const choose = (uri: string | null) => {
    setVoice(lang, uri);
    setTimeout(() => speak(tr.name('lion'), 0, tts), 0);
  };
  return (
    <Modal title={tr.t('voice')} onClose={onClose}>
      <div className="voice-list">
        <button className={`voice-btn${chosen === null ? ' on' : ''}`} onClick={() => choose(null)}>
          <span dir="auto">{tr.t('automaticVoice')}</span>
        </button>
        {voices.map((v) => (
          <button
            key={v.uri}
            className={`voice-btn${chosen === v.uri ? ' on' : ''}`}
            onClick={() => choose(v.uri)}
          >
            <span>{v.name}</span>
            {v.quality === 'natural' && <span className="voice-badge">★</span>}
          </button>
        ))}
      </div>
      <p className="voice-tip" dir="auto">
        {tr.t('voiceTip')}
      </p>
    </Modal>
  );
}

function CreditsDialog({ onClose }: { onClose: () => void }) {
  const tr = useT();
  const credits = soundCredits();
  return (
    <Modal title={tr.t('credits')} onClose={onClose}>
      <div className="credits">
        <p>{tr.t('creditsIntro')}</p>
        <ul>
          {credits.map((c) => (
            <li key={c.id}>
              <strong>{tr.name(c.id)}</strong> —{' '}
              <a href={c.source} target="_blank" rel="noreferrer">
                {c.title}
              </a>{' '}
              · {c.author} ·{' '}
              {c.licenseUrl ? (
                <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                  {c.license}
                </a>
              ) : (
                c.license
              )}
              {c.sources?.length ? (
                <ul>
                  {c.sources.map((s) => (
                    <li key={s.source}>
                      <a href={s.source} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>{' '}
                      · {s.author} · {s.license}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

function Settings() {
  const [open, setOpen] = useState(false);
  const [dialog, setDialog] = useState<'language' | 'voice' | 'credits' | null>(null);
  const muted = useStore((s) => s.muted);
  const sayNames = useStore((s) => s.sayNames);
  const lang = useStore((s) => s.lang);
  const voiceUri = useStore((s) => s.voices[s.lang] ?? null);
  const setMuted = useStore((s) => s.setMuted);
  const setSayNames = useStore((s) => s.setSayNames);
  const tr = useT();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close, true);
    return () => window.removeEventListener('pointerdown', close, true);
  }, [open]);

  return (
    <div className="settings" ref={ref}>
      <button
        className="btn"
        aria-label={tr.t('settings')}
        aria-expanded={open}
        onClick={() => {
          playSfx('click');
          setOpen(!open);
        }}
      >
        <GearIcon />
      </button>
      {open && (
        <div className="popover" role="menu">
          <button
            className={`toggle-row${muted ? '' : ' on'}`}
            role="menuitemcheckbox"
            aria-checked={!muted}
            onClick={() => setMuted(!muted)}
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
            <span>{tr.t('sounds')}</span>
            <span className="switch" />
          </button>
          <button
            className={`toggle-row${sayNames ? ' on' : ''}`}
            role="menuitemcheckbox"
            aria-checked={sayNames}
            onClick={() => setSayNames(!sayNames)}
          >
            <SpeechIcon />
            <span>{tr.t('sayNames')}</span>
            <span className="switch" />
          </button>
          <button
            className="toggle-row"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDialog('language');
            }}
          >
            <LanguageIcon />
            <span>{tr.t('language')}</span>
            <span className="row-value" dir="auto">
              {LANGUAGE_BY_CODE.get(lang)?.name}
            </span>
          </button>
          <button
            className="toggle-row"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDialog('voice');
            }}
          >
            <SpeechIcon />
            <span>{tr.t('voice')}</span>
            <span className="row-value" dir="auto">
              {voiceName(voiceUri, ttsLang(lang)) ?? tr.t('automaticVoice')}
            </span>
          </button>
          <button
            className="toggle-row"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              setDialog('credits');
            }}
          >
            <InfoIcon />
            <span>{tr.t('credits')}</span>
          </button>
        </div>
      )}
      {dialog === 'language' && <LanguageDialog onClose={() => setDialog(null)} />}
      {dialog === 'voice' && <VoiceDialog onClose={() => setDialog(null)} />}
      {dialog === 'credits' && <CreditsDialog onClose={() => setDialog(null)} />}
    </div>
  );
}

export function TopBar({ onStartOver }: { onStartOver: () => void }) {
  const themeId = useStore((s) => s.themeId);
  const canUndo = useStore((s) => s.canUndo);
  const undo = useStore((s) => s.undo);
  const setPickerOpen = useStore((s) => s.setPickerOpen);
  const tr = useT();
  const theme = getTheme(themeId);
  const worldName = tr.world(theme.id);
  return (
    <div className="topbar" data-ui>
      <div className="topbar-group">
        <button
          className="pill theme-pill"
          style={{ ['--accent' as string]: theme.accent }}
          onClick={() => {
            playSfx('swoosh');
            setPickerOpen(true);
          }}
          aria-label={tr.t('chooseAnotherWorld', { world: worldName })}
        >
          <GlobeIcon />
          <span dir="auto">{worldName}</span>
        </button>
        <button
          className="btn"
          aria-label={tr.t('undo')}
          disabled={!canUndo}
          onClick={() => {
            playSfx('click');
            undo();
          }}
        >
          <UndoIcon />
        </button>
        <button className="btn btn-game" aria-label={tr.t('matchingGame')} onClick={openGame}>
          <CardsIcon />
        </button>
      </div>
      <div className="topbar-group">
        <DayNightToggle />
        <button
          className="btn"
          aria-label={tr.t('startOver')}
          onClick={() => {
            playSfx('click');
            onStartOver();
          }}
        >
          <BroomIcon />
        </button>
        <Settings />
      </div>
    </div>
  );
}

export function ZoomControls() {
  const tr = useT();
  return (
    <div className="zoom" data-ui>
      <button className="btn" aria-label={tr.t('zoomIn')} onClick={() => zoomBy(1.45)}>
        <PlusIcon />
      </button>
      <button className="btn" aria-label={tr.t('zoomOut')} onClick={() => zoomBy(1 / 1.45)}>
        <MinusIcon />
      </button>
      <button className="btn" aria-label={tr.t('showWholeMap')} onClick={() => resetCamera()}>
        <FitIcon />
      </button>
    </div>
  );
}

export function StartOverDialog({ onClose }: { onClose: () => void }) {
  const clearAll = useStore((s) => s.clearAll);
  const resetDefaults = useStore((s) => s.resetDefaults);
  const tr = useT();
  return (
    <Modal title={tr.t('startOverQuestion')} onClose={onClose}>
      <div className="dialog-actions">
        <HoldButton
          label={tr.t('emptyMap')}
          hint={tr.t('pressAndHold')}
          icon={<BroomIcon size={34} />}
          onComplete={() => {
            clearAll();
            onClose();
          }}
        />
        <HoldButton
          label={tr.t('starterSet')}
          hint={tr.t('pressAndHold')}
          icon={<PawsIcon size={34} />}
          className="alt"
          onComplete={() => {
            resetDefaults();
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
