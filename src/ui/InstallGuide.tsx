import { useState, type CSSProperties, type ReactNode } from 'react';
import { create } from 'zustand';
import { playSfx } from '../audio/engine';
import { useT, type UiKey } from '../i18n';
import { detectPlatform, promptInstall, useInstall, type Platform } from '../pwa';
import { Modal } from './Chrome';
import { AddSquareIcon, DotsIcon, GlobeIcon, InstallIcon, ShareIcon } from './icons';

export const useInstallGuide = create<{ open: boolean }>(() => ({ open: false }));

export function openInstallGuide(): void {
  playSfx('pop');
  useInstallGuide.setState({ open: true });
}

const closeInstallGuide = () => useInstallGuide.setState({ open: false });

const PLATFORMS: { id: Platform; label: UiKey }[] = [
  { id: 'ios', label: 'installIphone' },
  { id: 'android', label: 'installAndroid' },
  { id: 'computer', label: 'installComputer' },
];

const STEPS: Record<Platform, [ReactNode, UiKey][]> = {
  ios: [
    [<GlobeIcon key="open" />, 'iosStep1'],
    [<ShareIcon key="share" />, 'iosStep2'],
    [<AddSquareIcon key="add" />, 'iosStep3'],
  ],
  android: [
    [<GlobeIcon key="open" />, 'androidStep1'],
    [<DotsIcon key="menu" />, 'androidStep2'],
    [<InstallIcon key="install" />, 'androidStep3'],
  ],
  computer: [
    [<GlobeIcon key="open" />, 'computerStep1'],
    [<InstallIcon key="install" />, 'computerStep2'],
  ],
};

export function InstallGuide() {
  const open = useInstallGuide((s) => s.open);
  return open ? <InstallDialog /> : null;
}

function InstallDialog() {
  const tr = useT();
  const installed = useInstall((s) => s.installed);
  const canPrompt = useInstall((s) => s.prompt !== null);
  const [platform, setPlatform] = useState<Platform>(detectPlatform);
  return (
    <Modal title={tr.t('installTitle')} onClose={closeInstallGuide} className="install-card">
      <div style={{ ['--accent' as string]: '#2f9fdd' } as CSSProperties}>
        {installed ? (
          <p className="install-done" dir="auto">
            {tr.t('installed')}
          </p>
        ) : (
          <>
            <p className="install-intro" dir="auto">
              {tr.t('installIntro')}
            </p>
            {canPrompt && (
              <button className="pill install-now" onClick={() => void promptInstall()}>
                <InstallIcon />
                <span dir="auto">{tr.t('installNow')}</span>
              </button>
            )}
            <div className="seg install-tabs" role="group">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  className={p.id === platform ? 'on' : ''}
                  aria-pressed={p.id === platform}
                  dir="auto"
                  onClick={() => {
                    playSfx('click');
                    setPlatform(p.id);
                  }}
                >
                  {tr.t(p.label)}
                </button>
              ))}
            </div>
            <ol className="install-steps">
              {STEPS[platform].map(([icon, key]) => (
                <li key={key}>
                  <span className="install-icon">{icon}</span>
                  <span dir="auto">{tr.t(key)}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </Modal>
  );
}
