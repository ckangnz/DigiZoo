import { registerSW } from 'virtual:pwa-register';
import { create } from 'zustand';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallState {
  prompt: InstallPromptEvent | null;
  installed: boolean;
}

export type Platform = 'ios' | 'android' | 'computer';

function runningInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const media = (query: string) => window.matchMedia?.(query).matches ?? false;
  return (
    media('(display-mode: standalone)') ||
    media('(display-mode: fullscreen)') ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export const useInstall = create<InstallState>(() => ({
  prompt: null,
  installed: runningInstalled(),
}));

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'computer';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1))
    return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'computer';
}

export async function promptInstall(): Promise<void> {
  const event = useInstall.getState().prompt;
  if (!event) return;
  await event.prompt();
  const { outcome } = await event.userChoice;
  useInstall.setState({ prompt: null, installed: outcome === 'accepted' });
}

export function setupPwa(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    useInstall.setState({ prompt: e as InstallPromptEvent });
  });
  window.addEventListener('appinstalled', () =>
    useInstall.setState({ prompt: null, installed: true }),
  );
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  let updateReady = false;
  const applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateReady = true;
      if (document.visibilityState === 'hidden') void applyUpdate(true);
    },
    onRegisteredSW(_url, registration) {
      if (registration) setInterval(() => void registration.update(), 60 * 60 * 1000);
    },
  });
  document.addEventListener('visibilitychange', () => {
    if (updateReady && document.visibilityState === 'hidden') void applyUpdate(true);
  });
}
