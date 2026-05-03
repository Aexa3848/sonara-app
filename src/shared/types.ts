// Shared types between main, preload and renderer.

export type Provider = 'spotify' | 'soundcloud';

/** Cross-provider track identifier. */
export interface TrackId {
  provider: Provider;
  /** Provider's native id (Spotify track URI suffix or SoundCloud numeric id as string). */
  id: string;
}

export interface Track {
  uid: string; // `${provider}:${id}` — primary key in our app
  provider: Provider;
  providerId: string;
  title: string;
  artist: string;
  album?: string;
  durationMs: number;
  coverUrl?: string;
  /** Optional accent color sampled from cover art (hex). */
  accent?: string;
  /** Provider-specific metadata. */
  meta?: Record<string, unknown>;
}

export interface Artist {
  uid: string;
  provider: Provider;
  providerId: string;
  name: string;
  imageUrl?: string;
}

export interface Album {
  uid: string;
  provider: Provider;
  providerId: string;
  title: string;
  artist: string;
  coverUrl?: string;
  year?: number;
}

export interface Playlist {
  id: string; // local uuid
  name: string;
  description?: string;
  trackUids: string[];
  createdAt: number;
  updatedAt: number;
  /** When true, this is one of the auto-managed playlists (Liked, History). */
  system?: 'liked' | 'history';
}

export interface SearchResult {
  query: string;
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  /** Per-provider error messages, if any. */
  errors?: Partial<Record<Provider, string>>;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerSnapshot {
  current?: Track;
  queue: Track[];
  /** History of played track uids (most recent last). */
  history: string[];
  position: number; // 0..1
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number; // 0..1
  muted: boolean;
}

export interface AppSettings {
  theme: 'dark';
  accentMode: 'fixed' | 'cover';
  spotifyClientId?: string;
  soundcloudClientId?: string;
  /** UI density. */
  density: 'comfortable' | 'compact';
}

export interface UpdaterStatus {
  state:
    | 'idle'
    | 'checking'
    | 'available'
    | 'downloading'
    | 'downloaded'
    | 'error'
    | 'dev';
  info?: { version?: string; releaseNotes?: string; releaseName?: string };
  progress?: { percent: number; transferred: number; total: number; bytesPerSecond: number };
  error?: string;
}
