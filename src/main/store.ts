import Store from 'electron-store';
import type { AppSettings, Playlist } from '../shared/types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentMode: 'cover',
  density: 'comfortable'
};

interface Schema {
  settings: AppSettings;
  playlists: Playlist[];
  liked: string[];
  history: string[];
}

export interface StoreShape {
  getSettings: () => AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  getPlaylists: () => Playlist[];
  savePlaylist: (p: Playlist) => Playlist[];
  deletePlaylist: (id: string) => Playlist[];
  getLiked: () => string[];
  toggleLiked: (uid: string) => string[];
  getHistory: () => string[];
  pushHistory: (uid: string) => string[];
}

export function createStore(): StoreShape {
  const store = new Store<Schema>({
    name: 'sonara',
    defaults: {
      settings: DEFAULT_SETTINGS,
      playlists: [],
      liked: [],
      history: []
    }
  });

  return {
    getSettings: () => ({ ...DEFAULT_SETTINGS, ...store.get('settings') }),
    updateSettings: (patch) => {
      const next = { ...store.get('settings'), ...patch };
      store.set('settings', next);
    },
    getPlaylists: () => store.get('playlists') ?? [],
    savePlaylist: (p) => {
      const list = store.get('playlists') ?? [];
      const existing = list.findIndex((x) => x.id === p.id);
      const updated = existing >= 0
        ? list.map((x, i) => (i === existing ? p : x))
        : [...list, p];
      store.set('playlists', updated);
      return updated;
    },
    deletePlaylist: (id) => {
      const next = (store.get('playlists') ?? []).filter((p) => p.id !== id);
      store.set('playlists', next);
      return next;
    },
    getLiked: () => store.get('liked') ?? [],
    toggleLiked: (uid) => {
      const list = store.get('liked') ?? [];
      const next = list.includes(uid) ? list.filter((x) => x !== uid) : [...list, uid];
      store.set('liked', next);
      return next;
    },
    getHistory: () => store.get('history') ?? [],
    pushHistory: (uid) => {
      const list = store.get('history') ?? [];
      const filtered = list.filter((x) => x !== uid);
      const next = [...filtered, uid].slice(-200);
      store.set('history', next);
      return next;
    }
  };
}
