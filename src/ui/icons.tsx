import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 26, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M8 5.6c0-1.1 1.2-1.8 2.2-1.2l8.6 5.2c.9.6.9 1.9 0 2.5l-8.6 5.2c-1 .6-2.2-.1-2.2-1.2z"
      fill="currentColor"
    />
  </Icon>
);

export const StopIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" />
  </Icon>
);

const paw = (x: number, y: number, s: number, r: number) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="currentColor" stroke="none">
    <ellipse cx="0" cy="2.2" rx="3.1" ry="2.6" />
    <circle cx="-3.4" cy="-1.6" r="1.25" />
    <circle cx="-1.2" cy="-3.4" r="1.3" />
    <circle cx="1.3" cy="-3.4" r="1.3" />
    <circle cx="3.5" cy="-1.6" r="1.25" />
  </g>
);

export const PawsIcon = (p: IconProps) => (
  <Icon {...p}>
    {paw(7.2, 15.6, 0.95, -20)}
    {paw(16.4, 8.6, 0.95, 20)}
  </Icon>
);

export const FlipIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5v17" strokeDasharray="2.2 2.6" />
    <path d="M9 7.5 4 17h5z" />
    <path d="M15 7.5 20 17h-5z" fill="currentColor" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="3" fill="currentColor" />
    <path d="M15.5 5.6V5.5A1.8 1.8 0 0 0 13.7 3.7H6.3A2.6 2.6 0 0 0 3.7 6.3v7.4a1.8 1.8 0 0 0 1.8 1.8h.1" />
  </Icon>
);

export const ForwardIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 13.6 3.8 9.4 12 5.2l8.2 4.2z" fill="currentColor" />
    <path d="m4.4 13.6 7.6 3.9 7.6-3.9" />
  </Icon>
);

export const BackwardIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 9.4 3.8 13.6 12 17.8l8.2-4.2z" fill="currentColor" />
    <path d="m4.4 9.4 7.6-3.9 7.6 3.9" />
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2V7" />
    <path d="M6.5 7.5 7.4 19c.1 1 .9 1.8 1.9 1.8h5.4c1 0 1.8-.8 1.9-1.8l.9-11.5" />
    <path d="M10.2 11.2v5.6M13.8 11.2v5.6" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" strokeWidth={3} />
  </Icon>
);

export const MinusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" strokeWidth={3} />
  </Icon>
);

export const FitIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
  </Icon>
);

export const SunIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.4" fill="currentColor" />
    <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M5.4 18.6l1.5-1.5M17.1 6.9l1.5-1.5" />
  </Icon>
);

export const MoonIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.6 14.6A8 8 0 0 1 9.4 4.4a8 8 0 1 0 10.2 10.2z" fill="currentColor" />
  </Icon>
);

export const UndoIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8.5 5 4.5 9l4 4" />
    <path d="M4.8 9H14a5.5 5.5 0 0 1 0 11h-3" />
  </Icon>
);

export const BroomIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 3.5 12.6 10.4" />
    <path d="M10.2 9.4c1.4-.9 3.4-.6 4.6.6s1.5 3.2.6 4.6l-1.1 1.6-5.7-5.7z" fill="currentColor" />
    <path d="M8.6 10.5 4 15.2c-.4.4-.4 1 0 1.4l3.4 3.4c.4.4 1 .4 1.4 0l4.7-4.6" />
    <path d="M6.2 17.8 8 16M8.6 19.6l1.6-1.6" strokeWidth={1.8} />
  </Icon>
);

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5" />
    <circle cx="12" cy="12" r="6.6" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="m15.2 15.2 4.8 4.8" strokeWidth={3} />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" strokeWidth={3} />
  </Icon>
);

export const GlobeIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M3.6 12h16.8M12 3.4c2.4 2.4 3.6 5.3 3.6 8.6s-1.2 6.2-3.6 8.6c-2.4-2.4-3.6-5.3-3.6-8.6S9.6 5.8 12 3.4z" />
  </Icon>
);

export const AddAnimalIcon = (p: IconProps) => (
  <Icon {...p}>
    {paw(10, 13.4, 1.25, 0)}
    <circle cx="18.6" cy="5.6" r="4.2" fill="currentColor" stroke="none" />
    <path d="M18.6 3.6v4M16.6 5.6h4" stroke="#fff" strokeWidth={1.8} />
  </Icon>
);

export const SoundOnIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" />
  </Icon>
);

export const SoundOffIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor" />
    <path d="m16 9.5 5 5M21 9.5l-5 5" />
  </Icon>
);

export const SpeechIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5.2h14a1.8 1.8 0 0 1 1.8 1.8v8a1.8 1.8 0 0 1-1.8 1.8h-7.4L7 20v-3.2H5A1.8 1.8 0 0 1 3.2 15V7A1.8 1.8 0 0 1 5 5.2z" />
    <path d="M8 10.2h8M8 13.4h5" />
  </Icon>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m14.5 5.5-6.5 6.5 6.5 6.5" strokeWidth={3} />
  </Icon>
);

export const RotateIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19 12a7 7 0 1 1-2.1-5" />
    <path d="M17.5 3.5v4h-4" />
  </Icon>
);

export const ScaleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />
  </Icon>
);

export const SparkleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M12 3.5c.6 3.9 2.3 5.8 6 6.5-3.7.7-5.4 2.6-6 6.5-.6-3.9-2.3-5.8-6-6.5 3.7-.7 5.4-2.6 6-6.5z"
      fill="currentColor"
    />
    <path
      d="M18.5 16.2c.3 1.6 1 2.4 2.5 2.7-1.5.3-2.2 1.1-2.5 2.7-.3-1.6-1-2.4-2.5-2.7 1.5-.3 2.2-1.1 2.5-2.7z"
      fill="currentColor"
      strokeWidth={1}
    />
  </Icon>
);

export const BowlIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12.5h18a9 7.5 0 0 1-18 0z" fill="currentColor" />
    <path d="M8 21h8" />
    <circle cx="9" cy="8.5" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="7.5" r="2.8" fill="currentColor" stroke="none" />
    <path d="M14.5 4.7c.4-1.2 1.3-2 2.6-2.2" strokeWidth={1.8} />
  </Icon>
);

export const LanguageIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5h9M8.5 3v2M6 5c.6 3.4 2.9 6.2 6.2 7.6M11 5c-.8 3.8-3.6 6.9-7 8.2" />
    <path d="m13 21 4-9 4 9M14.4 18h5.2" />
  </Icon>
);

export const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6" strokeWidth={2.8} />
    <circle cx="12" cy="7.5" r="1.4" fill="currentColor" stroke="none" />
  </Icon>
);

export const CardsIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="6" width="10" height="14" rx="2.4" transform="rotate(-12 8.5 13)" />
    <rect x="10.5" y="4" width="10" height="14" rx="2.4" transform="rotate(10 15.5 11)" />
    <path
      d="m15.6 8.6.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z"
      fill="currentColor"
      strokeWidth={1}
    />
  </Icon>
);

export const RefreshIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4.5V11h-6.5" />
  </Icon>
);
