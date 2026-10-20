import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { playAnimal, playSfx, unlockAudio } from './audio/engine';
import { useCamera } from './engine/camera';
import './engine/walker';
import { useStore } from './store/store';
import { setupPwa } from './pwa';
import './styles/app.css';

const prevent = (e: Event) => e.preventDefault();
document.addEventListener('gesturestart', prevent);
document.addEventListener('gesturechange', prevent);
document.addEventListener('dblclick', prevent, { passive: false });
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false },
);
window.addEventListener('pointerdown', unlockAudio, { capture: true });

if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) {
  Object.assign(window, { __digizoo: { useStore, useCamera, playAnimal, playSfx } });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

setupPwa();
