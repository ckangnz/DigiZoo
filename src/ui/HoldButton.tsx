import { useEffect, useRef, useState, type ReactNode } from 'react';
import { playSfx } from '../audio/engine';

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function HoldButton({
  label,
  hint,
  icon,
  onComplete,
  duration = 1100,
  className = '',
}: {
  label: string;
  hint: string;
  icon: ReactNode;
  onComplete: () => void;
  duration?: number;
  className?: string;
}) {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const start = useRef(0);
  const ticks = useRef(0);
  const holding = useRef(false);

  const cancel = () => {
    holding.current = false;
    cancelAnimationFrame(frame.current);
    setProgress(0);
  };

  const loop = () => {
    const k = Math.min(1, (performance.now() - start.current) / duration);
    setProgress(k);
    const quarter = Math.floor(k * 4);
    if (quarter > ticks.current && k < 1) {
      ticks.current = quarter;
      playSfx('tick');
    }
    if (k >= 1) {
      holding.current = false;
      playSfx('chime');
      setProgress(0);
      onComplete();
      return;
    }
    frame.current = requestAnimationFrame(loop);
  };

  const begin = () => {
    if (holding.current) return;
    holding.current = true;
    start.current = performance.now();
    ticks.current = 0;
    playSfx('tick');
    frame.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <button
      className={`hold ${className}`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        begin();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) begin();
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') cancel();
      }}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`${label} (${hint})`}
    >
      <span className="hold-ring">
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <circle cx="36" cy="36" r={RADIUS} className="hold-track" />
          <circle
            cx="36"
            cy="36"
            r={RADIUS}
            className="hold-progress"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          />
        </svg>
        <span className="hold-icon">{icon}</span>
      </span>
      <span className="hold-label">{label}</span>
      <span className="hold-hint">{hint}</span>
    </button>
  );
}
