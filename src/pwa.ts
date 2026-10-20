import { registerSW } from 'virtual:pwa-register';

export function setupPwa(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  registerSW({ immediate: true });
}
