import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { initCamera, onViewSettled, resizeCamera, useCamera } from '../engine/camera';
import { attachGestures } from '../engine/gestures';
import { sceneOf } from '../registry/themes';
import type { SceneDef } from '../art/scenes/types';
import { useStore } from '../store/store';
import { Ambient } from './Ambient';
import { EffectsLayer } from './EffectsLayer';
import { InteractiveLayer } from './Interactives';
import { SceneBack, SceneFront } from './SceneLayers';
import { SelectionOverlay, Toolbar } from './Selection';
import { ShadowLayer } from './Shadows';
import { StickerLayer } from './Stickers';

const World = memo(function World({ scene, night }: { scene: SceneDef; night: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, h] = scene.world;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const { t, moving } = useCamera.getState();
      el.style.transform = `translate3d(${t.tx}px, ${t.ty}px, 0) scale(${t.s})`;
      el.classList.toggle('moving', moving);
    };
    apply();
    return useCamera.subscribe(apply);
  }, []);

  return (
    <div ref={ref} className={`world${night ? ' night' : ''}`} style={{ width: w, height: h }}>
      <SceneBack scene={scene} night={night} />
      <Ambient scene={scene} night={night} sky />
      <InteractiveLayer scene={scene} night={night} front={false} />
      <Ambient scene={scene} night={night} sky={false} />
      <ShadowLayer />
      <StickerLayer />
      <EffectsLayer />
      <SceneFront scene={scene} night={night} />
      <InteractiveLayer scene={scene} night={night} front />
    </div>
  );
});

export function MapView() {
  const ref = useRef<HTMLDivElement>(null);
  const themeId = useStore((s) => s.themeId);
  const night = useStore((s) => s.night);
  const scene = sceneOf(themeId);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    initCamera(scene.world, { w: el.clientWidth, h: el.clientHeight }, useStore.getState().view);
  }, [scene]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth && el.clientHeight)
        resizeCamera({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    onViewSettled((view) => useStore.getState().setView(view));
    const detach = attachGestures(el);
    return () => {
      ro.disconnect();
      detach();
    };
  }, []);

  return (
    <div ref={ref} className={`map theme-${themeId}${night ? ' is-night' : ''}`}>
      <World scene={scene} night={night} />
      <SelectionOverlay />
      <Toolbar />
    </div>
  );
}
