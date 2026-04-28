'use strict';

const Store = require('electron-store');

const DEFAULTS = {
  windowBounds: { width: 1200, height: 760 },
  libraryFolders: [],
  tracks: [],
  playlists: [],
  likes: [],
  history: [],
  settings: {
    tracksView: 'grid',
    theme: 'dark',
    volume: 0.8,
    autoCheckUpdates: true,
  },
};

function createStore() {
  const store = new Store({
    name: 'sonara',
    defaults: DEFAULTS,
    clearInvalidConfig: true,
  });
  return store;
}

module.exports = { createStore, DEFAULTS };
