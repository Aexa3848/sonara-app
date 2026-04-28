import { api } from './api.js';

const DEFAULT_SETTINGS = {
  tracksView: 'grid',
  theme: 'dark',
  volume: 0.8,
  autoCheckUpdates: true,
};

function emit(target, key) {
  const subs = target.__subs.get(key);
  if (!subs) return;
  for (const fn of subs) {
    try { fn(target[key]); } catch (err) { console.error(err); }
  }
}

export class Store {
  constructor() {
    this.tracks = [];
    this.playlists = [];
    this.likes = new Set();
    this.history = [];
    this.libraryFolders = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.__subs = new Map();
    this.__loaded = false;
  }

  on(key, fn) {
    if (!this.__subs.has(key)) this.__subs.set(key, new Set());
    this.__subs.get(key).add(fn);
    return () => this.__subs.get(key).delete(fn);
  }

  notify(key) { emit(this, key); }

  async load() {
    const [tracks, playlists, likes, history, libraryFolders, settings] = await Promise.all([
      api.store.get('tracks'),
      api.store.get('playlists'),
      api.store.get('likes'),
      api.store.get('history'),
      api.store.get('libraryFolders'),
      api.store.get('settings'),
    ]);
    this.tracks = Array.isArray(tracks) ? tracks : [];
    this.playlists = Array.isArray(playlists) ? playlists : [];
    this.likes = new Set(Array.isArray(likes) ? likes : []);
    this.history = Array.isArray(history) ? history : [];
    this.libraryFolders = Array.isArray(libraryFolders) ? libraryFolders : [];
    this.settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    this.__loaded = true;
    this.notify('tracks');
    this.notify('playlists');
    this.notify('likes');
    this.notify('history');
    this.notify('libraryFolders');
    this.notify('settings');
  }

  async save(key) {
    if (!this.__loaded) return;
    let value;
    switch (key) {
      case 'tracks': value = this.tracks; break;
      case 'playlists': value = this.playlists; break;
      case 'likes': value = Array.from(this.likes); break;
      case 'history': value = this.history.slice(-2000); break;
      case 'libraryFolders': value = this.libraryFolders; break;
      case 'settings': value = this.settings; break;
      default: return;
    }
    await api.store.set(key, value);
  }

  // --- Tracks ---
  setTracks(tracks) {
    this.tracks = tracks;
    this.notify('tracks');
    this.save('tracks');
  }

  // --- Likes ---
  toggleLike(id) {
    if (this.likes.has(id)) this.likes.delete(id);
    else this.likes.add(id);
    this.notify('likes');
    this.save('likes');
  }
  isLiked(id) { return this.likes.has(id); }

  // --- History ---
  pushHistory(id) {
    this.history.push({ id, at: Date.now() });
    if (this.history.length > 4000) this.history = this.history.slice(-2000);
    this.notify('history');
    this.save('history');
  }

  // --- Library folders ---
  setLibraryFolders(folders) {
    this.libraryFolders = folders;
    this.notify('libraryFolders');
    this.save('libraryFolders');
  }
  addLibraryFolders(paths) {
    const set = new Set(this.libraryFolders);
    for (const p of paths) if (p) set.add(p);
    this.setLibraryFolders(Array.from(set));
  }
  removeLibraryFolder(path) {
    this.setLibraryFolders(this.libraryFolders.filter((p) => p !== path));
  }

  // --- Playlists ---
  createPlaylist(name) {
    const playlist = {
      id: 'pl_' + Math.random().toString(36).slice(2, 10),
      name: name || 'Новый плейлист',
      trackIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.playlists.push(playlist);
    this.notify('playlists');
    this.save('playlists');
    return playlist;
  }
  renamePlaylist(id, name) {
    const pl = this.playlists.find((p) => p.id === id);
    if (!pl) return;
    pl.name = name;
    pl.updatedAt = Date.now();
    this.notify('playlists');
    this.save('playlists');
  }
  deletePlaylist(id) {
    this.playlists = this.playlists.filter((p) => p.id !== id);
    this.notify('playlists');
    this.save('playlists');
  }
  addTracksToPlaylist(id, trackIds) {
    const pl = this.playlists.find((p) => p.id === id);
    if (!pl) return;
    const existing = new Set(pl.trackIds);
    for (const tid of trackIds) {
      if (!existing.has(tid)) {
        pl.trackIds.push(tid);
        existing.add(tid);
      }
    }
    pl.updatedAt = Date.now();
    this.notify('playlists');
    this.save('playlists');
  }
  removeTrackFromPlaylist(id, trackId) {
    const pl = this.playlists.find((p) => p.id === id);
    if (!pl) return;
    pl.trackIds = pl.trackIds.filter((tid) => tid !== trackId);
    pl.updatedAt = Date.now();
    this.notify('playlists');
    this.save('playlists');
  }

  // --- Settings ---
  updateSettings(patch) {
    this.settings = { ...this.settings, ...patch };
    this.notify('settings');
    this.save('settings');
  }

  // --- Helpers ---
  getTrackById(id) { return this.tracks.find((t) => t.id === id) || null; }
  getTracksByIds(ids) {
    const map = new Map(this.tracks.map((t) => [t.id, t]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }
}

export const store = new Store();
