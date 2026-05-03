import { contextBridge, ipcRenderer } from 'electron';
import type { AppSettings, Playlist, UpdaterStatus } from '../shared/types';

const api = {
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    update: (patch: Partial<AppSettings>): Promise<AppSettings> =>
      ipcRenderer.invoke('settings:update', patch)
  },
  playlists: {
    list: (): Promise<Playlist[]> => ipcRenderer.invoke('playlists:list'),
    save: (p: Playlist): Promise<Playlist[]> => ipcRenderer.invoke('playlists:save', p),
    delete: (id: string): Promise<Playlist[]> => ipcRenderer.invoke('playlists:delete', id)
  },
  liked: {
    list: (): Promise<string[]> => ipcRenderer.invoke('liked:list'),
    toggle: (uid: string): Promise<string[]> => ipcRenderer.invoke('liked:toggle', uid)
  },
  history: {
    list: (): Promise<string[]> => ipcRenderer.invoke('history:list'),
    push: (uid: string): Promise<string[]> => ipcRenderer.invoke('history:push', uid)
  },
  shell: {
    open: (url: string): Promise<void> => ipcRenderer.invoke('shell:open', url)
  },
  updater: {
    status: (): Promise<UpdaterStatus> => ipcRenderer.invoke('updater:status'),
    check: (): Promise<UpdaterStatus> => ipcRenderer.invoke('updater:check'),
    download: (): Promise<UpdaterStatus> => ipcRenderer.invoke('updater:download'),
    install: (): Promise<void> => ipcRenderer.invoke('updater:install'),
    onEvent: (cb: (s: UpdaterStatus) => void) => {
      const h = (_: unknown, s: UpdaterStatus) => cb(s);
      ipcRenderer.on('updater:event', h);
      return () => ipcRenderer.off('updater:event', h);
    }
  }
};

contextBridge.exposeInMainWorld('sonara', api);

export type SonaraApi = typeof api;
