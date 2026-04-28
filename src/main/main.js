'use strict';

const path = require('node:path');
const fs = require('node:fs');
const { app, BrowserWindow, ipcMain, dialog, protocol, net, shell } = require('electron');

const { createStore } = require('./store');
const { scanFolders, readCover } = require('./library');
const { initUpdater, manualCheck, downloadUpdate, quitAndInstall, getStatus } = require('./updater');

const isDev = !app.isPackaged;

function pathToFileUrl(filePath) {
  // Cross-platform file URL builder. On Windows: C:\foo\bar -> file:///C:/foo/bar
  const normalized = filePath.replace(/\\/g, '/');
  if (/^[A-Za-z]:/.test(normalized)) {
    return 'file:///' + encodeURI(normalized);
  }
  return 'file://' + encodeURI(normalized);
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'sonara-track',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true },
  },
  {
    scheme: 'sonara-cover',
    privileges: { standard: true, secure: true, supportFetchAPI: true, bypassCSP: true },
  },
]);

let mainWindow = null;
let store = null;

function createMainWindow() {
  const bounds = store.get('windowBounds') || { width: 1200, height: 760 };
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 900,
    minHeight: 580,
    backgroundColor: '#10131a',
    title: 'Sonara',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const b = mainWindow.getBounds();
      store.set('windowBounds', b);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function registerProtocols() {
  protocol.handle('sonara-track', async (request) => {
    try {
      const url = new URL(request.url);
      // Path layout: sonara-track://x/<encoded full path>
      const encoded = url.pathname.replace(/^\/+/, '');
      const filePath = decodeURIComponent(encoded);
      if (!filePath || !fs.existsSync(filePath)) {
        return new Response('Not found', { status: 404 });
      }
      const fileUrl = pathToFileUrl(filePath);
      return net.fetch(fileUrl);
    } catch (err) {
      return new Response('Track error', { status: 500 });
    }
  });

  protocol.handle('sonara-cover', async (request) => {
    try {
      const url = new URL(request.url);
      const id = decodeURIComponent(url.hostname);
      const buf = await readCover(id);
      if (!buf) return new Response('No cover', { status: 404 });
      return new Response(buf.data, { headers: { 'Content-Type': buf.format || 'image/jpeg' } });
    } catch (err) {
      return new Response('Cover error', { status: 500 });
    }
  });
}

function broadcast(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

function registerIpc() {
  ipcMain.handle('app:getInfo', () => ({
    version: app.getVersion(),
    name: app.getName(),
    isDev,
    platform: process.platform,
  }));

  ipcMain.handle('store:get', (_e, key) => store.get(key));
  ipcMain.handle('store:set', (_e, key, value) => {
    store.set(key, value);
    return true;
  });
  ipcMain.handle('store:delete', (_e, key) => {
    store.delete(key);
    return true;
  });

  ipcMain.handle('dialog:pickFolder', async () => {
    const res = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'multiSelections'],
      title: 'Выберите папку с музыкой',
    });
    if (res.canceled) return [];
    return res.filePaths;
  });

  ipcMain.handle('library:scan', async (_e, folders) => {
    return scanFolders(folders, (progress) => broadcast('library:scanProgress', progress));
  });

  ipcMain.handle('library:revealInFolder', (_e, filePath) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
    }
  });

  ipcMain.handle('updater:check', async () => manualCheck());
  ipcMain.handle('updater:download', async () => downloadUpdate());
  ipcMain.handle('updater:install', () => quitAndInstall());
  ipcMain.handle('updater:status', () => getStatus());
}

app.whenReady().then(() => {
  store = createStore();
  registerProtocols();
  registerIpc();
  createMainWindow();
  initUpdater({
    isDev,
    onEvent: (event, payload) => broadcast('updater:event', { event, payload }),
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}
