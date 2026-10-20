import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { stickerUrl } from '../art/cache';
import { partPose, poseToTransform, rootPivot, rootPose } from '../art/core/motion';
import { flattenParts, renderAnimal, renderPartPieces } from '../art/core/render';
import type { AnimalDef, StyleId } from '../art/core/types';
import { metricsOf } from '../engine/geometry';
import { attachRig } from '../engine/walker';
import { getAnimal } from '../registry/animals';
import { useStore } from '../store/store';

let walkerSeq = 0;

function WalkerSvg({ id, def, style }: { id: string; def: AnimalDef; style: StyleId }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefix = useMemo(() => `w${++walkerSeq}`, []);
  const markup = useMemo(
    () => renderAnimal(def, { style, live: true, idPrefix: prefix, phase: 0 }),
    [def, style, prefix],
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parts = flattenParts(def.parts);
    const nodes = parts.map((part) => ({
      part,
      els: Array.from(el.querySelectorAll(`[data-p="${part.id}"]`)),
    }));
    const roots = Array.from(el.querySelectorAll('[data-p="__root"]'));
    const procedural = parts
      .filter((p) => p.frames)
      .map((part) => ({
        part,
        u: el.querySelector(`[data-u="${part.id}"]`),
        a: el.querySelector(`[data-a="${part.id}"]`),
        d: el.querySelector(`[data-d="${part.id}"]`),
      }));
    const pivot = rootPivot(def);
    const setTransform = (node: Element, value: string) => {
      if (value) node.setAttribute('transform', value);
      else node.removeAttribute('transform');
    };
    return attachRig(id, (phase) => {
      const rt = poseToTransform(rootPose(def, phase), pivot);
      for (const r of roots) setTransform(r, rt);
      for (const { part, els } of nodes) {
        const tr = poseToTransform(partPose(def, part, phase), part.pivot ?? [0, 0]);
        for (const n of els) setTransform(n, tr);
      }
      for (const { part, u, a, d } of procedural) {
        const pieces = renderPartPieces(def, part, style, prefix, phase);
        if (u) u.innerHTML = pieces.underlay;
        if (a) a.innerHTML = pieces.art;
        if (d) d.innerHTML = pieces.defs;
      }
    });
  }, [def, style, id, prefix]);

  return <div ref={ref} className="walker" dangerouslySetInnerHTML={{ __html: markup }} />;
}

const StickerView = memo(function StickerView({ id }: { id: string }) {
  const st = useStore((s) => s.stickers.find((x) => x.id === id));
  const walking = useStore((s) => s.walkingId === id);
  const talking = useStore((s) => s.talkingId === id);
  const bump = useStore((s) => (s.bump?.id === id ? s.bump : null));
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!bump || !el) return;
    const cls = bump.kind === 'pop' ? 'anim-pop' : 'anim-wiggle';
    el.classList.remove('anim-pop', 'anim-wiggle');
    void el.offsetWidth;
    el.classList.add(cls);
    const done = () => el.classList.remove(cls);
    el.addEventListener('animationend', done, { once: true });
    return () => el.removeEventListener('animationend', done);
  }, [bump]);

  const def = st ? getAnimal(st.animalId) : undefined;
  if (!st || !def) return null;
  const m = metricsOf(def);
  return (
    <div
      className="sticker"
      data-sticker={id}
      style={{
        width: m.w,
        height: m.h,
        transform: `translate(${st.x - m.w / 2}px, ${st.y - m.h / 2}px) rotate(${st.rotation}deg) scale(${st.scale})`,
      }}
    >
      <div className={`sticker-flip${st.flipX ? ' flipped' : ''}`}>
        <div ref={bodyRef} className={`sticker-body${talking ? ' talking' : ''}`}>
          {walking ? (
            <WalkerSvg id={id} def={def} style={st.style} />
          ) : (
            <img
              src={stickerUrl(def, st.style)}
              alt={def.name}
              draggable={false}
              decoding="async"
            />
          )}
        </div>
      </div>
    </div>
  );
});

export const StickerLayer = memo(function StickerLayer() {
  const ids = useStore(useShallow((s) => s.stickers.map((x) => x.id)));
  return (
    <div className="layer stickers">
      {ids.map((id) => (
        <StickerView key={id} id={id} />
      ))}
    </div>
  );
});
