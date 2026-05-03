import { app } from 'electron';
import pkg from 'electron-updater';
import type { UpdaterStatus } from '../shared/types';

const { autoUpdater } = pkg;

let status: UpdaterStatus = { state: 'idle' };
let emit: (s: UpdaterStatus) => void = () => {};

function setStatus(next: Partial<UpdaterStatus>): void {
  status = { ...status, ...next };
  emit(status);
}

const isDev = !app.isPackaged;

export function initUpdater(emitter: (s: UpdaterStatus) => void): void {
  emit = emitter;
  if (isDev) {
    setStatus({ state: 'dev' });
    return;
  }
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => setStatus({ state: 'checking' }));
  autoUpdater.on('update-available', (info) =>
    setStatus({ state: 'available', info: extractInfo(info) })
  );
  autoUpdater.on('update-not-available', () => setStatus({ state: 'idle' }));
  autoUpdater.on('error', (err) =>
    setStatus({ state: 'error', error: err?.message || String(err) })
  );
  autoUpdater.on('download-progress', (p) =>
    setStatus({
      state: 'downloading',
      progress: {
        percent: p.percent,
        transferred: p.transferred,
        total: p.total,
        bytesPerSecond: p.bytesPerSecond
      }
    })
  );
  autoUpdater.on('update-downloaded', (info) =>
    setStatus({ state: 'downloaded', info: extractInfo(info) })
  );

  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 5000);
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 60 * 60 * 1000);
}

export function manualCheck(): UpdaterStatus {
  if (isDev) return status;
  autoUpdater.checkForUpdates().catch((err) => setStatus({ state: 'error', error: err?.message }));
  return status;
}

export function downloadUpdate(): UpdaterStatus {
  if (isDev) return status;
  autoUpdater.downloadUpdate().catch((err) => setStatus({ state: 'error', error: err?.message }));
  return status;
}

export function quitAndInstall(): void {
  if (isDev) return;
  autoUpdater.quitAndInstall();
}

export function getStatus(): UpdaterStatus {
  return status;
}

function extractInfo(info: {
  version?: string;
  releaseNotes?: string | unknown[] | null;
  releaseName?: string | null;
}): UpdaterStatus['info'] {
  const notes = typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined;
  return {
    version: info.version,
    releaseNotes: notes,
    releaseName: info.releaseName ?? undefined
  };
}
