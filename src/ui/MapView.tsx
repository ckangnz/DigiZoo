import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { initCamera, onViewSettled, resizeCamera, useCamera } from '../engine/camera';
import { attachGestures } from '../engine/gestures';
import { getTheme, type ThemeMeta } from '../registry/themes';
import { useStore } from '../store/store';
import { Ambient } from './Ambient';
import { EffectsLayer } from './EffectsLayer';
import { InteractiveLayer } from './Interactives';
import { SceneBack, SceneFront } from './SceneLayers';
import { SelectionOverlay, Toolbar } from './Selection';
import { ShadowLayer } from './Shadows';
import { StickerLayer } from './Stickers';

const World = memo(function World({ theme, night }: { theme: ThemeMeta; night: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, h] = theme.scene.world;

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
      <SceneBack scene={theme.scene} night={night} />
      <Ambient scene={theme.scene} night={night} sky />
      <InteractiveLayer scene={theme.scene} night={night} front={false} />
      <Ambient scene={theme.scene} night={night} sky={false} />
      <ShadowLayer />
      <StickerLayer />
      <EffectsLayer />
      <SceneFront scene={theme.scene} night={night} />
      <InteractiveLayer scene={theme.scene} night={night} front />
    </div>
  );
});

export function MapView() {
  const ref = useRef<HTMLDivElement>(null);
  const themeId = useStore((s) => s.themeId);
  const night = useStore((s) => s.night);
  const theme = getTheme(themeId);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    initCamera(
      theme.scene.world,
      { w: el.clientWidth, h: el.clientHeight },
      useStore.getState().view,
    );
  }, [theme]);

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
      <World theme={theme} night={night} />
      <SelectionOverlay />
      <Toolbar />
    </div>
  );
}
