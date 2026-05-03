export function classNames(
  ...args: Array<string | false | undefined | null | Record<string, boolean | undefined | null>>
): string {
  const out: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      out.push(arg);
    } else if (typeof arg === 'object') {
      for (const [k, v] of Object.entries(arg)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(' ');
}

export const cn = classNames;

export function formatTime(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatTotal(ms: number): string {
  if (!isFinite(ms) || ms < 0) return '0 min';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const HUE_PALETTE = [12, 32, 52, 132, 168, 198, 218, 248, 278, 312, 338];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Deterministic gradient cover for tracks/albums without art. Returns a data:image URL
 * for an SVG with two-color gradient and the artist initials overlaid.
 */
export function generateCoverDataUrl(seed: string, label?: string): string {
  const h = hashString(seed);
  const hue1 = HUE_PALETTE[h % HUE_PALETTE.length];
  const hue2 = HUE_PALETTE[(h >> 4) % HUE_PALETTE.length];
  const c1 = `hsl(${hue1}, 65%, 32%)`;
  const c2 = `hsl(${hue2}, 70%, 20%)`;
  const initials = (label ?? seed)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>
    <defs>
      <linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${c1}'/>
        <stop offset='100%' stop-color='${c2}'/>
      </linearGradient>
      <radialGradient id='r' cx='30%' cy='25%' r='70%'>
        <stop offset='0%' stop-color='rgba(255,255,255,0.18)'/>
        <stop offset='100%' stop-color='rgba(255,255,255,0)'/>
      </radialGradient>
    </defs>
    <rect width='320' height='320' fill='url(#g)'/>
    <rect width='320' height='320' fill='url(#r)'/>
    <text x='50%' y='52%' text-anchor='middle' dominant-baseline='middle'
      font-family='Inter, sans-serif' font-size='110' font-weight='700'
      fill='rgba(255,255,255,0.92)' letter-spacing='-4'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Convert hex like #FF3D71 to rgba string with alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
