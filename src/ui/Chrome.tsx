import { useEffect, useRef, useState } from 'react';
import { playSfx } from '../audio/engine';
import { resetCamera, zoomBy } from '../engine/camera';
import { getTheme } from '../registry/themes';
import { useStore } from '../store/store';
import { HoldButton } from './HoldButton';
import {
  BroomIcon,
  CloseIcon,
  FitIcon,
  GearIcon,
  GlobeIcon,
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
  return (
    <button
      className={`daynight${night ? ' is-night' : ''}`}
      role="switch"
      aria-checked={night}
      aria-label={night ? 'Night time' : 'Day time'}
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

function Settings() {
  const [open, setOpen] = useState(false);
  const muted = useStore((s) => s.muted);
  const sayNames = useStore((s) => s.sayNames);
  const setMuted = useStore((s) => s.setMuted);
  const setSayNames = useStore((s) => s.setSayNames);
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
        aria-label="Settings"
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
            <span>Sounds</span>
            <span className="switch" />
          </button>
          <button
            className={`toggle-row${sayNames ? ' on' : ''}`}
            role="menuitemcheckbox"
            aria-checked={sayNames}
            onClick={() => setSayNames(!sayNames)}
          >
            <SpeechIcon />
            <span>Say names</span>
            <span className="switch" />
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar({ onStartOver }: { onStartOver: () => void }) {
  const themeId = useStore((s) => s.themeId);
  const canUndo = useStore((s) => s.canUndo);
  const undo = useStore((s) => s.undo);
  const setPickerOpen = useStore((s) => s.setPickerOpen);
  const theme = getTheme(themeId);
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
          aria-label={`World: ${theme.name}. Choose another world`}
        >
          <GlobeIcon />
          <span>{theme.name}</span>
        </button>
        <button
          className="btn"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => {
            playSfx('click');
            undo();
          }}
        >
          <UndoIcon />
        </button>
      </div>
      <div className="topbar-group">
        <DayNightToggle />
        <button
          className="btn"
          aria-label="Start over"
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
  return (
    <div className="zoom" data-ui>
      <button className="btn" aria-label="Zoom in" onClick={() => zoomBy(1.45)}>
        <PlusIcon />
      </button>
      <button className="btn" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.45)}>
        <MinusIcon />
      </button>
      <button className="btn" aria-label="Show whole map" onClick={() => resetCamera()}>
        <FitIcon />
      </button>
    </div>
  );
}

export function StartOverDialog({ onClose }: { onClose: () => void }) {
  const clearAll = useStore((s) => s.clearAll);
  const resetDefaults = useStore((s) => s.resetDefaults);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      data-ui
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="startover-title">
        <button className="btn dialog-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <h2 id="startover-title">Start over?</h2>
        <div className="dialog-actions">
          <HoldButton
            label="Empty map"
            icon={<BroomIcon size={34} />}
            onComplete={() => {
              clearAll();
              onClose();
            }}
          />
          <HoldButton
            label="Starter animals"
            icon={<PawsIcon size={34} />}
            className="alt"
            onComplete={() => {
              resetDefaults();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
