import type { SVGProps } from 'react';

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
});

export function HomeIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

export function SearchIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function LibraryIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M4 4v16" />
      <path d="M9 4v16" />
      <path d="m14 5 4 14" />
      <rect x="2.5" y="4" width="3" height="16" rx="0.5" />
    </svg>
  );
}

export function HeartIcon({ size = 20, filled = false, ...rest }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size)} {...rest} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 21s-7-4.5-9.5-9.5C.7 7.6 3.4 4 7 4c2 0 3.5 1 5 2.7C13.5 5 15 4 17 4c3.6 0 6.3 3.6 4.5 7.5C19 16.5 12 21 12 21Z" />
    </svg>
  );
}

export function WaveIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 12c2 0 2-6 4-6s2 12 4 12 2-12 4-12 2 6 4 6h2" />
    </svg>
  );
}

export function SpotifyIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.7.7 0 0 1-1 .25c-2.7-1.65-6.1-2-10.1-1.1a.74.74 0 0 1-.9-.55.75.75 0 0 1 .55-.9c4.4-1 8.2-.6 11.2 1.25a.7.7 0 0 1 .25 1.05Zm1.45-3.3a.93.93 0 0 1-1.25.3c-3.1-1.9-7.85-2.45-11.5-1.35a.93.93 0 1 1-.55-1.8c4.2-1.25 9.45-.65 13 1.55a.94.94 0 0 1 .3 1.3Zm.15-3.45c-3.7-2.2-9.85-2.4-13.4-1.35a1.12 1.12 0 1 1-.65-2.15c4.1-1.25 10.85-1 15.1 1.55a1.13 1.13 0 0 1-1.05 2Z" />
    </svg>
  );
}

export function SoundCloudIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M2.5 14.5v3a.5.5 0 0 0 1 0v-3a.5.5 0 0 0-1 0Zm2 1v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-1 0Zm2-3v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-1 0Zm2-1v6a.5.5 0 0 0 1 0v-6a.5.5 0 0 0-1 0Zm2-2v8a.5.5 0 0 0 1 0v-8a.5.5 0 0 0-1 0Zm2.5-1.5c-.27 0-.53.04-.78.1V18a.5.5 0 0 0 .5.5h7c1.66 0 3-1.34 3-3 0-1.55-1.18-2.83-2.69-2.99-.16-2.39-2.15-4.27-4.59-4.27-.84 0-1.62.22-2.3.62A2.5 2.5 0 0 0 13 8Z" />
    </svg>
  );
}

export function SettingsIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 4.27 16.96l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 4.27l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function PlayIcon({ size = 20, filled = true, ...rest }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...rest}>
      <path d="M7 4.5v15c0 .77.85 1.24 1.5.83l11.5-7.33a1 1 0 0 0 0-1.66L8.5 3.67A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

export function PauseIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
    </svg>
  );
}

export function PrevIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M19 5.5v13c0 .77-.85 1.24-1.5.83L7.5 13a1 1 0 0 1 0-1.66L17.5 4.67A1 1 0 0 1 19 5.5Z" />
      <rect x="4.5" y="5" width="2" height="14" rx="1" />
    </svg>
  );
}

export function NextIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...rest}>
      <path d="M5 5.5v13c0 .77.85 1.24 1.5.83L16.5 13a1 1 0 0 0 0-1.66L6.5 4.67A1 1 0 0 0 5 5.5Z" />
      <rect x="17.5" y="5" width="2" height="14" rx="1" />
    </svg>
  );
}

export function ShuffleIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M16 4h4v4" />
      <path d="m20 4-7 7" />
      <path d="M16 20h4v-4" />
      <path d="M3 4 8 9" />
      <path d="M11 13l9 7" />
      <path d="M3 20l3.5-3.5" />
    </svg>
  );
}

export function RepeatIcon({ size = 20, mode = 'off', ...rest }: IconProps & { mode?: 'off' | 'all' | 'one' }) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m17 1 4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 23-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      {mode === 'one' && <text x="11" y="14" fontSize="6" fontFamily="Inter" fontWeight="700" fill="currentColor">1</text>}
    </svg>
  );
}

export function VolumeIcon({ size = 20, level = 'high', ...rest }: IconProps & { level?: 'mute' | 'low' | 'high' }) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      {level !== 'mute' && <path d="M15.5 8.5a5 5 0 0 1 0 7" />}
      {level === 'high' && <path d="M19 5a9 9 0 0 1 0 14" />}
      {level === 'mute' && <><path d="m17 9 5 5" /><path d="m22 9-5 5" /></>}
    </svg>
  );
}

export function PlusIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function MoreIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ListIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GridIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function BackIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function CloseIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export function CheckIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function DownloadIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 4v12" />
      <path d="m6 12 6 6 6-6" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function QueueIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 6h14" />
      <path d="M5 12h10" />
      <path d="M5 18h6" />
      <path d="m17 13 5 3-5 3v-6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
