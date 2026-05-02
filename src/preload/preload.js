'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const api = {
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo'),
  },
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value),
    delete: (key) => ipcRenderer.invoke('store:delete', key),
  },
  dialog: {
    pickFolder: () => ipcRenderer.invoke('dialog:pickFolder'),
  },
  library: {
    scan: (folders) => ipcRenderer.invoke('library:scan', folders),
    revealInFolder: (filePath) => ipcRenderer.invoke('library:revealInFolder', filePath),
    onScanProgress: (cb) => {
      const handler = (_e, payload) => cb(payload);
      ipcRenderer.on('library:scanProgress', handler);
      return () => ipcRenderer.removeListener('library:scanProgress', handler);
    },
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    status: () => ipcRenderer.invoke('updater:status'),
    onEvent: (cb) => {
      const handler = (_e, payload) => cb(payload);
      ipcRenderer.on('updater:event', handler);
      return () => ipcRenderer.removeListener('updater:event', handler);
    },
  },
};

contextBridge.exposeInMainWorld('sonara', api);
