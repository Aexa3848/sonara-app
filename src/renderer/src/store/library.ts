import { create } from 'zustand';
import type { AppSettings, Playlist } from '@shared/types';
import { api } from '../lib/sonara-api';

interface LibraryState {
  settings: AppSettings;
  playlists: Playlist[];
  liked: Set<string>;
  history: string[];
  ready: boolean;

  hydrate: () => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  toggleLiked: (uid: string) => Promise<void>;
  isLiked: (uid: string) => boolean;
  pushHistory: (uid: string) => Promise<void>;

  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  renamePlaylist: (id: string, name: string, description?: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (id: string, trackUids: string[]) => Promise<void>;
  removeFromPlaylist: (id: string, trackUid: string) => Promise<void>;
  reorderPlaylist: (id: string, fromIndex: number, toIndex: number) => Promise<void>;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentMode: 'cover',
  density: 'comfortable'
};

export const useLibrary = create<LibraryState>((set, get) => ({
  settings: defaultSettings,
  playlists: [],
  liked: new Set(),
  history: [],
  ready: false,

  hydrate: async () => {
    const [settings, playlists, liked, history] = await Promise.all([
      api.settings.get(),
      api.playlists.list(),
      api.liked.list(),
      api.history.list()
    ]);
    set({
      settings: { ...defaultSettings, ...settings },
      playlists,
      liked: new Set(liked),
      history,
      ready: true
    });
  },

  updateSettings: async (patch) => {
    const next = await api.settings.update(patch);
    set({ settings: { ...defaultSettings, ...next } });
  },

  toggleLiked: async (uid) => {
    const next = await api.liked.toggle(uid);
    set({ liked: new Set(next) });
  },

  isLiked: (uid) => get().liked.has(uid),

  pushHistory: async (uid) => {
    const next = await api.history.push(uid);
    set({ history: next });
  },

  createPlaylist: async (name, description) => {
    const playlist: Playlist = {
      id: 'pl-' + Math.random().toString(36).slice(2) + Date.now().toString(36),
      name,
      description,
      trackUids: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const next = await api.playlists.save(playlist);
    set({ playlists: next });
    return playlist;
  },

  renamePlaylist: async (id, name, description) => {
    const list = get().playlists;
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const updated: Playlist = { ...p, name, description, updatedAt: Date.now() };
    const next = await api.playlists.save(updated);
    set({ playlists: next });
  },

  deletePlaylist: async (id) => {
    const next = await api.playlists.delete(id);
    set({ playlists: next });
  },

  addToPlaylist: async (id, trackUids) => {
    const list = get().playlists;
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const merged = [...p.trackUids];
    for (const uid of trackUids) if (!merged.includes(uid)) merged.push(uid);
    const updated: Playlist = { ...p, trackUids: merged, updatedAt: Date.now() };
    const next = await api.playlists.save(updated);
    set({ playlists: next });
  },

  removeFromPlaylist: async (id, trackUid) => {
    const list = get().playlists;
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const updated: Playlist = {
      ...p,
      trackUids: p.trackUids.filter((u) => u !== trackUid),
      updatedAt: Date.now()
    };
    const next = await api.playlists.save(updated);
    set({ playlists: next });
  },

  reorderPlaylist: async (id, fromIndex, toIndex) => {
    const list = get().playlists;
    const p = list.find((x) => x.id === id);
    if (!p) return;
    const arr = [...p.trackUids];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    const updated: Playlist = { ...p, trackUids: arr, updatedAt: Date.now() };
    const next = await api.playlists.save(updated);
    set({ playlists: next });
  }
}));
