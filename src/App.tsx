import { useCallback, useEffect, useState } from 'react';
import { setAudioMuted } from './audio/engine';
import { releaseScenesExcept } from './art/cache';
import { zoomBy } from './engine/camera';
import { useStore } from './store/store';
import {
  bringForward,
  duplicateSticker,
  flipSticker,
  nudgeSticker,
  playSticker,
  removeSticker,
  sendBackward,
  toggleWalk,
} from './ui/actions';
import { StartOverDialog, TopBar, ZoomControls } from './ui/Chrome';
import { MapView } from './ui/MapView';
import { SidePanel } from './ui/SidePanel';
import { ThemePicker } from './ui/ThemePicker';

function useKeyboard(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable]')) return;
      const s = useStore.getState();
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        s.undo();
        return;
      }
      if (e.key === '+' || e.key === '=') return zoomBy(1.3);
      if (e.key === '-' || e.key === '_') return zoomBy(1 / 1.3);
      const id = s.selectedId;
      if (e.key === 'Escape') {
        if (s.panelOpen) s.setPanelOpen(false);
        else s.select(null);
        return;
      }
      if (!id) return;
      const step = e.shiftKey ? 60 : 12;
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          removeSticker(id);
          break;
        case 'd':
        case 'D':
          if (mod) {
            e.preventDefault();
            duplicateSticker(id);
          }
          break;
        case 'f':
        case 'F':
          flipSticker(id);
          break;
        case ']':
          bringForward(id);
          break;
        case '[':
          sendBackward(id);
          break;
        case 'w':
        case 'W':
          toggleWalk(id);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          playSticker(id);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nudgeSticker(id, -step, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          nudgeSticker(id, step, 0);
          break;
        case 'ArrowUp':
          e.preventDefault();
          nudgeSticker(id, 0, -step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          nudgeSticker(id, 0, step);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}

export function App() {
  const [startOver, setStartOver] = useState(false);
  const pickerOpen = useStore((s) => s.pickerOpen);
  const muted = useStore((s) => s.muted);
  const themeId = useStore((s) => s.themeId);
  const panelOpen = useStore((s) => s.panelOpen);
  const hasSelection = useStore((s) => s.selectedId !== null);

  useKeyboard(!pickerOpen && !startOver);

  useEffect(() => setAudioMuted(muted), [muted]);

  useEffect(() => {
    if (!pickerOpen) releaseScenesExcept(themeId);
  }, [themeId, pickerOpen]);

  const closeStartOver = useCallback(() => setStartOver(false), []);

  return (
    <div className={`app${panelOpen ? ' panel-open' : ''}${hasSelection ? ' has-selection' : ''}`}>
      <MapView />
      <TopBar onStartOver={() => setStartOver(true)} />
      <ZoomControls />
      <SidePanel />
      {startOver && <StartOverDialog onClose={closeStartOver} />}
      <ThemePicker />
    </div>
  );
}
