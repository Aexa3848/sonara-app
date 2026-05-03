import type { AppSettings, Playlist, UpdaterStatus } from '@shared/types';

interface SonaraApi {
  settings: {
    get: () => Promise<AppSettings>;
    update: (patch: Partial<AppSettings>) => Promise<AppSettings>;
  };
  playlists: {
    list: () => Promise<Playlist[]>;
    save: (p: Playlist) => Promise<Playlist[]>;
    delete: (id: string) => Promise<Playlist[]>;
  };
  liked: {
    list: () => Promise<string[]>;
    toggle: (uid: string) => Promise<string[]>;
  };
  history: {
    list: () => Promise<string[]>;
    push: (uid: string) => Promise<string[]>;
  };
  shell: {
    open: (url: string) => Promise<void>;
  };
  updater: {
    status: () => Promise<UpdaterStatus>;
    check: () => Promise<UpdaterStatus>;
    download: () => Promise<UpdaterStatus>;
    install: () => Promise<void>;
    onEvent: (cb: (s: UpdaterStatus) => void) => () => void;
  };
}

declare global {
  interface Window {
    sonara: SonaraApi;
  }
}

/** Fallback for renderer running outside Electron (HMR, web preview, tests). */
function browserFallback(): SonaraApi {
  const memory = {
    settings: { theme: 'dark', accentMode: 'cover', density: 'comfortable' } as AppSettings,
    playlists: [] as Playlist[],
    liked: [] as string[],
    history: [] as string[]
  };
  return {
    settings: {
      get: async () => ({ ...memory.settings }),
      update: async (patch) => {
        memory.settings = { ...memory.settings, ...patch };
        return { ...memory.settings };
      }
    },
    playlists: {
      list: async () => [...memory.playlists],
      save: async (p) => {
        const i = memory.playlists.findIndex((x) => x.id === p.id);
        if (i >= 0) memory.playlists[i] = p;
        else memory.playlists.push(p);
        return [...memory.playlists];
      },
      delete: async (id) => {
        memory.playlists = memory.playlists.filter((p) => p.id !== id);
        return [...memory.playlists];
      }
    },
    liked: {
      list: async () => [...memory.liked],
      toggle: async (uid) => {
        memory.liked = memory.liked.includes(uid)
          ? memory.liked.filter((x) => x !== uid)
          : [...memory.liked, uid];
        return [...memory.liked];
      }
    },
    history: {
      list: async () => [...memory.history],
      push: async (uid) => {
        memory.history = [...memory.history.filter((x) => x !== uid), uid].slice(-200);
        return [...memory.history];
      }
    },
    shell: { open: async (url) => void window.open(url, '_blank') },
    updater: {
      status: async () => ({ state: 'dev' }),
      check: async () => ({ state: 'dev' }),
      download: async () => ({ state: 'dev' }),
      install: async () => undefined,
      onEvent: () => () => undefined
    }
  };
}

export const api: SonaraApi =
  typeof window !== 'undefined' && (window as Window & { sonara?: SonaraApi }).sonara
    ? window.sonara
    : browserFallback();
