import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { cancelSpeech, playAnimal, playSfx, speak } from '../audio/engine';
import { stickerUrl } from '../art/cache';
import type { StyleId } from '../art/core/types';
import { foodSvg } from '../food/art';
import { dietOf } from '../food/diets';
import { ttsLang, useT } from '../i18n';
import { loadInfo } from '../info';
import type { StickerInfo } from '../info/types';
import { getAnimal } from '../registry/animals';
import { getTheme, hasTheme } from '../registry/themes';
import { Modal } from './Chrome';
import { SpeechIcon, StopIcon } from './icons';

interface InfoCardState {
  id: string | null;
  style: StyleId;
}

export const useInfoCard = create<InfoCardState>(() => ({ id: null, style: 'cartoon' }));

export function openInfo(animalId: string, style: StyleId = 'cartoon'): void {
  playSfx('pop');
  useInfoCard.setState({ id: animalId, style });
}

export function closeInfo(): void {
  cancelSpeech();
  useInfoCard.setState({ id: null });
}

export function InfoCard() {
  const id = useInfoCard((s) => s.id);
  return id ? <InfoContent key={id} id={id} /> : null;
}

function InfoContent({ id }: { id: string }) {
  const tr = useT();
  const style = useInfoCard((s) => s.style);
  const [info, setInfo] = useState<StickerInfo | null | undefined>(undefined);
  const [reading, setReading] = useState(false);
  const def = getAnimal(id);

  useEffect(() => {
    let live = true;
    setInfo(undefined);
    void loadInfo(id, tr.lang).then((loaded) => {
      if (live) setInfo(loaded);
    });
    return () => {
      live = false;
    };
  }, [id, tr.lang]);

  useEffect(() => () => cancelSpeech(), []);

  if (!def) return null;
  const name = tr.name(def.id, def.name);
  const foods = dietOf(def.id) ?? [];
  const worlds = def.habitats.filter(hasTheme);

  const toggleReading = () => {
    if (reading) {
      cancelSpeech();
      setReading(false);
      return;
    }
    if (!info) return;
    setReading(true);
    const text = [`${name}.`, info.about, tr.t('didYouKnow'), ...info.facts].join(' ');
    speak(text, 0, ttsLang(tr.lang), () => setReading(false));
  };

  return (
    <Modal title={name} onClose={closeInfo} className="info-card">
      <button
        className="info-sticker"
        aria-label={tr.t('playSound')}
        onClick={() => playAnimal(def.sound || def.id)}
      >
        <img src={stickerUrl(def, style)} alt="" draggable={false} />
      </button>
      <button
        className={`info-read${reading ? ' on' : ''}`}
        disabled={!info}
        aria-pressed={reading}
        onClick={toggleReading}
      >
        {reading ? <StopIcon size={20} /> : <SpeechIcon size={20} />}
        <span>{tr.t(reading ? 'stopReading' : 'readAloud')}</span>
      </button>
      {info === undefined ? (
        <div className="info-loading" />
      ) : (
        info && (
          <>
            <p className="info-about" dir="auto">
              {info.about}
            </p>
            <h3>{tr.t('didYouKnow')}</h3>
            <ul className="info-facts">
              {info.facts.map((fact) => (
                <li key={fact} dir="auto">
                  {fact}
                </li>
              ))}
            </ul>
          </>
        )
      )}
      {foods.length > 0 && (
        <section>
          <h3>{tr.t('likesToEat')}</h3>
          <div className="info-chips">
            {foods.map((food) => (
              <span key={food} className="info-food">
                <span dangerouslySetInnerHTML={{ __html: foodSvg(food, 34) }} />
                <span dir="auto">{tr.food(food)}</span>
              </span>
            ))}
          </div>
        </section>
      )}
      {worlds.length > 0 && (
        <section>
          <h3>{tr.t('findItIn')}</h3>
          <div className="info-chips">
            {worlds.map((world) => (
              <span
                key={world}
                className="info-world"
                style={{ ['--accent' as string]: getTheme(world).accent }}
                dir="auto"
              >
                {tr.world(world)}
              </span>
            ))}
          </div>
        </section>
      )}
    </Modal>
  );
}
