import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import { createStore, type StoreShape } from './store';
import { initUpdater, manualCheck, downloadUpdate, quitAndInstall, getStatus } from './updater';
import type { AppSettings, Playlist, UpdaterStatus } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let store: StoreShape | null = null;

const isDev = !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'Sonara',
    backgroundColor: '#020203',
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? false : true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  store = createStore();

  // ----- IPC: settings -----
  ipcMain.handle('settings:get', () => store!.getSettings());
  ipcMain.handle('settings:update', (_e, patch: Partial<AppSettings>) => {
    store!.updateSettings(patch);
    return store!.getSettings();
  });

  // ----- IPC: playlists -----
  ipcMain.handle('playlists:list', () => store!.getPlaylists());
  ipcMain.handle('playlists:save', (_e, playlist: Playlist) => store!.savePlaylist(playlist));
  ipcMain.handle('playlists:delete', (_e, id: string) => store!.deletePlaylist(id));

  // ----- IPC: liked / history -----
  ipcMain.handle('liked:list', () => store!.getLiked());
  ipcMain.handle('liked:toggle', (_e, uid: string) => store!.toggleLiked(uid));
  ipcMain.handle('history:list', () => store!.getHistory());
  ipcMain.handle('history:push', (_e, uid: string) => store!.pushHistory(uid));

  // ----- IPC: external link -----
  ipcMain.handle('shell:open', (_e, url: string) => shell.openExternal(url));

  // ----- IPC: updater -----
  initUpdater((status: UpdaterStatus) => {
    mainWindow?.webContents.send('updater:event', status);
  });
  ipcMain.handle('updater:status', () => getStatus());
  ipcMain.handle('updater:check', () => manualCheck());
  ipcMain.handle('updater:download', () => downloadUpdate());
  ipcMain.handle('updater:install', () => quitAndInstall());

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
