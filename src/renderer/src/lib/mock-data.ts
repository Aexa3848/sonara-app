import type { Track, Album, Artist } from '@shared/types';
import { generateCoverDataUrl } from './utils';

interface Seed {
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  provider: 'spotify' | 'soundcloud';
  providerId: string;
  accent?: string;
}

const SEEDS: Seed[] = [
  // Spotify-flavored
  { title: 'Tides', artist: 'Aurora Park', album: 'Northern Lights', durationMs: 218_000, provider: 'spotify', providerId: 'sp_001', accent: '#5E6AD2' },
  { title: 'Glass Houses', artist: 'Lumen Drift', album: 'Polar', durationMs: 254_000, provider: 'spotify', providerId: 'sp_002', accent: '#FF3D71' },
  { title: 'Lowlands', artist: 'Ivy Field', album: 'Polar', durationMs: 209_000, provider: 'spotify', providerId: 'sp_003', accent: '#22C55E' },
  { title: 'After Hours', artist: 'Nightcaller', album: 'Concrete', durationMs: 274_000, provider: 'spotify', providerId: 'sp_004', accent: '#F59E0B' },
  { title: 'Echo Frame', artist: 'Aurora Park', album: 'Northern Lights', durationMs: 196_000, provider: 'spotify', providerId: 'sp_005', accent: '#5E6AD2' },
  { title: 'Pale Atlas', artist: 'Sólo', album: 'Atlas', durationMs: 232_000, provider: 'spotify', providerId: 'sp_006', accent: '#06B6D4' },
  { title: 'Fugue', artist: 'Velour Bay', album: 'Suite', durationMs: 306_000, provider: 'spotify', providerId: 'sp_007', accent: '#A855F7' },
  { title: 'Slow Heat', artist: 'Nightcaller', album: 'Concrete', durationMs: 261_000, provider: 'spotify', providerId: 'sp_008', accent: '#F43F5E' },
  // SoundCloud-flavored
  { title: 'Pulse Wave', artist: 'KIRO', album: 'Single', durationMs: 184_000, provider: 'soundcloud', providerId: 'sc_001', accent: '#FF5500' },
  { title: 'Midnight Set', artist: 'DJ Halcyon', album: 'Live Sessions', durationMs: 612_000, provider: 'soundcloud', providerId: 'sc_002', accent: '#FB923C' },
  { title: 'Demo Loop 03', artist: 'Atlas Found', album: 'Demos', durationMs: 167_000, provider: 'soundcloud', providerId: 'sc_003', accent: '#EAB308' },
  { title: 'Off-Grid', artist: 'KIRO', album: 'Single', durationMs: 198_000, provider: 'soundcloud', providerId: 'sc_004', accent: '#FF5500' },
  { title: 'Untitled (Rough)', artist: 'Forest Theory', album: 'Sketches', durationMs: 142_000, provider: 'soundcloud', providerId: 'sc_005', accent: '#84CC16' },
  { title: 'Verge', artist: 'Mira Sol', album: 'Verge / Drift', durationMs: 224_000, provider: 'soundcloud', providerId: 'sc_006', accent: '#EC4899' },
  { title: 'Drift', artist: 'Mira Sol', album: 'Verge / Drift', durationMs: 211_000, provider: 'soundcloud', providerId: 'sc_007', accent: '#EC4899' },
  { title: 'Late Bloom (Edit)', artist: 'Forest Theory', album: 'Sketches', durationMs: 188_000, provider: 'soundcloud', providerId: 'sc_008', accent: '#84CC16' },
  // More variety
  { title: 'Cassette Sun', artist: 'Lumen Drift', album: 'Polar', durationMs: 240_000, provider: 'spotify', providerId: 'sp_009', accent: '#F472B6' },
  { title: 'Magnetic North', artist: 'Aurora Park', album: 'Northern Lights', durationMs: 287_000, provider: 'spotify', providerId: 'sp_010', accent: '#5E6AD2' },
  { title: 'Soft Static', artist: 'Velour Bay', album: 'Suite', durationMs: 218_000, provider: 'spotify', providerId: 'sp_011', accent: '#A855F7' },
  { title: 'Backlit', artist: 'Sólo', album: 'Atlas', durationMs: 199_000, provider: 'spotify', providerId: 'sp_012', accent: '#06B6D4' },
  { title: 'Outpost', artist: 'Atlas Found', album: 'Sketches', durationMs: 175_000, provider: 'soundcloud', providerId: 'sc_009', accent: '#EAB308' },
  { title: 'Midline', artist: 'DJ Halcyon', album: 'Live Sessions', durationMs: 422_000, provider: 'soundcloud', providerId: 'sc_010', accent: '#FB923C' }
];

export const MOCK_TRACKS: Track[] = SEEDS.map((s) => ({
  uid: `${s.provider}:${s.providerId}`,
  provider: s.provider,
  providerId: s.providerId,
  title: s.title,
  artist: s.artist,
  album: s.album,
  durationMs: s.durationMs,
  coverUrl: generateCoverDataUrl(`${s.artist} ${s.album}`, s.album),
  accent: s.accent
}));

export const MOCK_ALBUMS: Album[] = (() => {
  const map = new Map<string, Album>();
  for (const t of MOCK_TRACKS) {
    if (!t.album) continue;
    const key = `${t.provider}:${t.album}:${t.artist}`;
    if (map.has(key)) continue;
    map.set(key, {
      uid: key,
      provider: t.provider,
      providerId: t.album,
      title: t.album,
      artist: t.artist,
      coverUrl: t.coverUrl,
      year: 2024 - (key.length % 4)
    });
  }
  return [...map.values()];
})();

export const MOCK_ARTISTS: Artist[] = (() => {
  const map = new Map<string, Artist>();
  for (const t of MOCK_TRACKS) {
    const key = `${t.provider}:${t.artist}`;
    if (map.has(key)) continue;
    map.set(key, {
      uid: key,
      provider: t.provider,
      providerId: t.artist,
      name: t.artist,
      imageUrl: generateCoverDataUrl(t.artist, t.artist)
    });
  }
  return [...map.values()];
})();

export function tracksByUids(uids: string[]): Track[] {
  const map = new Map(MOCK_TRACKS.map((t) => [t.uid, t] as const));
  return uids.map((u) => map.get(u)).filter((t): t is Track => Boolean(t));
}

export function searchMock(q: string): Track[] {
  const ql = q.toLowerCase().trim();
  if (!ql) return MOCK_TRACKS;
  return MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(ql) ||
      t.artist.toLowerCase().includes(ql) ||
      (t.album?.toLowerCase().includes(ql) ?? false)
  );
}
