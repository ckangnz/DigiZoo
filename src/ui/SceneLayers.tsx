import { memo, useEffect, useState } from 'react';
import { sceneUrls } from '../art/cache';
import type { SceneDef } from '../art/scenes/types';

function useNightLoaded(night: boolean, sceneId: string): boolean {
  const [loaded, setLoaded] = useState(night);
  useEffect(() => {
    setLoaded(night);
  }, [sceneId]);
  useEffect(() => {
    if (night) setLoaded(true);
  }, [night]);
  return loaded || night;
}

export const SceneBack = memo(function SceneBack({
  scene,
  night,
}: {
  scene: SceneDef;
  night: boolean;
}) {
  const nightLoaded = useNightLoaded(night, scene.id);
  const [w, h] = scene.world;
  return (
    <div className="layer scene-layer">
      <img
        className="scene"
        src={sceneUrls(scene, 'day').back}
        width={w}
        height={h}
        alt=""
        draggable={false}
      />
      {nightLoaded && (
        <img
          className={`scene scene-night${night ? ' on' : ''}`}
          src={sceneUrls(scene, 'night').back}
          width={w}
          height={h}
          alt=""
          draggable={false}
        />
      )}
    </div>
  );
});

export const SceneFront = memo(function SceneFront({
  scene,
  night,
}: {
  scene: SceneDef;
  night: boolean;
}) {
  const nightLoaded = useNightLoaded(night, scene.id);
  const [w, h] = scene.world;
  return (
    <div className="layer scene-layer front">
      <img
        className="scene"
        src={sceneUrls(scene, 'day').front}
        width={w}
        height={h}
        alt=""
        draggable={false}
      />
      {nightLoaded && (
        <img
          className={`scene scene-night${night ? ' on' : ''}`}
          src={sceneUrls(scene, 'night').front}
          width={w}
          height={h}
          alt=""
          draggable={false}
        />
      )}
    </div>
  );
});
