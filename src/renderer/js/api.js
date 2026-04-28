// Thin wrapper around window.sonara so views can stay decoupled from preload globals.

const ns = window.sonara || {};

export const api = {
  app: ns.app || { getInfo: async () => ({ version: '0.0.0', name: 'Sonara', isDev: false }) },
  store: ns.store || {
    get: async () => null,
    set: async () => true,
    delete: async () => true,
  },
  dialog: ns.dialog || { pickFolder: async () => [] },
  library: ns.library || {
    scan: async () => [],
    revealInFolder: async () => undefined,
    onScanProgress: () => () => {},
  },
  updater: ns.updater || {
    check: async () => ({ state: 'idle' }),
    download: async () => ({ state: 'idle' }),
    install: async () => false,
    status: async () => ({ state: 'idle' }),
    onEvent: () => () => {},
  },
};
