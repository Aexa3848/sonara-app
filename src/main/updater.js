'use strict';

const { autoUpdater } = require('electron-updater');

let listeners = null;
let lastStatus = { state: 'idle', info: null, error: null, progress: null };
let isDev = false;
let intervalHandle = null;

function setStatus(next) {
  lastStatus = { ...lastStatus, ...next };
  if (listeners && typeof listeners.onEvent === 'function') {
    listeners.onEvent('status', lastStatus);
  }
}

function initUpdater(options) {
  listeners = options;
  isDev = !!options.isDev;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;

  autoUpdater.on('checking-for-update', () => setStatus({ state: 'checking', error: null }));
  autoUpdater.on('update-available', (info) => setStatus({ state: 'available', info, error: null }));
  autoUpdater.on('update-not-available', (info) => setStatus({ state: 'up-to-date', info, error: null }));
  autoUpdater.on('error', (err) => setStatus({ state: 'error', error: err && err.message ? err.message : String(err) }));
  autoUpdater.on('download-progress', (progress) => setStatus({ state: 'downloading', progress }));
  autoUpdater.on('update-downloaded', (info) => setStatus({ state: 'downloaded', info, progress: { percent: 100 } }));

  if (!isDev) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 5000);
    intervalHandle = setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 60 * 60 * 1000);
  } else {
    setStatus({ state: 'dev', info: null, error: 'Updates disabled in dev mode' });
  }
}

async function manualCheck() {
  if (isDev) {
    setStatus({ state: 'dev', info: null, error: 'Updates disabled in dev mode' });
    return lastStatus;
  }
  try {
    setStatus({ state: 'checking', error: null });
    const res = await autoUpdater.checkForUpdates();
    return res ? { ...lastStatus, info: res.updateInfo } : lastStatus;
  } catch (err) {
    setStatus({ state: 'error', error: err && err.message ? err.message : String(err) });
    return lastStatus;
  }
}

async function downloadUpdate() {
  if (isDev) return lastStatus;
  try {
    setStatus({ state: 'downloading', progress: { percent: 0 } });
    await autoUpdater.downloadUpdate();
    return lastStatus;
  } catch (err) {
    setStatus({ state: 'error', error: err && err.message ? err.message : String(err) });
    return lastStatus;
  }
}

function quitAndInstall() {
  if (isDev) return false;
  setImmediate(() => autoUpdater.quitAndInstall(false, true));
  return true;
}

function getStatus() {
  return lastStatus;
}

module.exports = { initUpdater, manualCheck, downloadUpdate, quitAndInstall, getStatus };
