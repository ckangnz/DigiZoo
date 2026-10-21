import { useCallback, useEffect, useState } from 'react';
import { preloadSounds, setAudioMuted, setPreferredVoice } from './audio/engine';
import { animalsIn } from './registry/animals';
import { releaseScenesExcept } from './art/cache';
import { zoomBy } from './engine/camera';
import { ttsLang, useI18n } from './i18n';
import { LANGUAGES } from './i18n/languages';
import { prefetchInfo } from './info';
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
import { InfoCard, closeInfo, openInfo, useInfoCard } from './ui/InfoCard';
import { InstallGuide } from './ui/InstallGuide';
import { MatchGame, closeGame, useGame } from './ui/MatchGame';
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
        case 'i':
        case 'I': {
          const st = s.stickers.find((x) => x.id === id);
          if (st) openInfo(st.animalId, st.style);
          break;
        }
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
  const infoOpen = useInfoCard((s) => s.id !== null);
  const gameOpen = useGame((s) => s.open);
  const lang = useI18n((s) => s.lang);
  const voices = useStore((s) => s.voices);

  useKeyboard(!pickerOpen && !startOver && !infoOpen && !gameOpen);

  useEffect(() => {
    const timer = setTimeout(() => prefetchInfo(lang), 2500);
    return () => clearTimeout(timer);
  }, [lang]);

  useEffect(() => closeInfo(), [themeId, pickerOpen]);

  useEffect(() => {
    if (pickerOpen) closeGame();
  }, [pickerOpen]);

  useEffect(() => setAudioMuted(muted), [muted]);

  useEffect(() => {
    for (const l of LANGUAGES) setPreferredVoice(ttsLang(l.code), voices[l.code] ?? null);
  }, [voices]);

  useEffect(() => {
    if (!pickerOpen) releaseScenesExcept(themeId);
  }, [themeId, pickerOpen]);

  useEffect(() => {
    preloadSounds(animalsIn(themeId).map((a) => a.sound || a.id));
  }, [themeId]);

  const closeStartOver = useCallback(() => setStartOver(false), []);

  return (
    <div className={`app${panelOpen ? ' panel-open' : ''}${hasSelection ? ' has-selection' : ''}`}>
      <MapView />
      <TopBar onStartOver={() => setStartOver(true)} />
      <ZoomControls />
      <SidePanel />
      {startOver && <StartOverDialog onClose={closeStartOver} />}
      <InfoCard />
      <MatchGame />
      <InstallGuide />
      <ThemePicker />
    </div>
  );
}
