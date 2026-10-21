import { memo, useEffect, useRef, useState } from 'react';
import { sceneUrls } from '../art/cache';
import type { SceneDef } from '../art/scenes/types';

const FADE_MS = 1000;

function useMountedModes(night: boolean, sceneId: string): { day: boolean; night: boolean } {
  const [modes, setModes] = useState({ day: !night, night });
  const lastScene = useRef(sceneId);
  const lastNight = useRef(night);
  useEffect(() => {
    if (lastNight.current === night && lastScene.current === sceneId) return;
    lastNight.current = night;
    if (lastScene.current !== sceneId) {
      lastScene.current = sceneId;
      setModes({ day: !night, night });
      return;
    }
    setModes({ day: true, night: true });
    const timer = setTimeout(() => setModes({ day: !night, night }), FADE_MS);
    return () => clearTimeout(timer);
  }, [night, sceneId]);
  return modes;
}

function NightImage({
  src,
  w,
  h,
  on,
  instant,
}: {
  src: string;
  w: number;
  h: number;
  on: boolean;
  instant: boolean;
}) {
  const [shown, setShown] = useState(on && instant);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(on));
    return () => cancelAnimationFrame(frame);
  }, [on]);
  return (
    <img
      className={`scene scene-night${shown ? ' on' : ''}`}
      src={src}
      width={w}
      height={h}
      alt=""
      draggable={false}
    />
  );
}

function SceneLayer({
  scene,
  night,
  part,
}: {
  scene: SceneDef;
  night: boolean;
  part: 'back' | 'front';
}) {
  const modes = useMountedModes(night, scene.id);
  const firstRender = useRef(true);
  useEffect(() => {
    firstRender.current = false;
  }, []);
  const [w, h] = scene.world;
  return (
    <div className={`layer scene-layer${part === 'front' ? ' front' : ''}`}>
      {modes.day && (
        <img
          className="scene"
          src={sceneUrls(scene, 'day')[part]}
          width={w}
          height={h}
          alt=""
          draggable={false}
        />
      )}
      {modes.night && (
        <NightImage
          src={sceneUrls(scene, 'night')[part]}
          w={w}
          h={h}
          on={night}
          instant={firstRender.current}
        />
      )}
    </div>
  );
}

export const SceneBack = memo(function SceneBack({
  scene,
  night,
}: {
  scene: SceneDef;
  night: boolean;
}) {
  return <SceneLayer scene={scene} night={night} part="back" />;
});

export const SceneFront = memo(function SceneFront({
  scene,
  night,
}: {
  scene: SceneDef;
  night: boolean;
}) {
  return <SceneLayer scene={scene} night={night} part="front" />;
});
