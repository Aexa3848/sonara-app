import { api } from './api.js';
import { store } from './state.js';
import { el, toast, fmtDuration } from './ui.js';
import { getPlayer } from './player.js';
import { renderHome } from './views/home.js';
import { renderTracks, setSearch as setTracksSearch } from './views/tracks.js';
import { renderPlaylists, resetPlaylistDetail } from './views/playlists.js';
import { renderWave } from './views/wave.js';
import { renderSettings, initSettings } from './views/settings.js';

const VIEWS = {
  home: { title: 'Главная', render: renderHome },
  tracks: { title: 'Треки', render: renderTracks },
  playlists: { title: 'Плейлисты', render: renderPlaylists },
  wave: { title: 'Моя волна', render: renderWave },
  settings: { title: 'Настройки', render: renderSettings },
};

let currentView = 'home';

async function bootstrap() {
  await store.load();
  applyAppearance();

  const info = await api.app.getInfo().catch(() => ({ version: '0.0.0' }));
  document.getElementById('brandVersion').textContent = `v${info.version}`;

  await initSettings();
  wireNav();
  wireSearch();
  wirePlayer();
  wireUpdaterBanner();

  switchView('home');

  store.on('tracks', () => rerender());
  store.on('playlists', () => rerender());
  store.on('likes', () => rerender());
  store.on('settings', () => applyAppearance());
}

function applyAppearance() {
  document.body.dataset.theme = store.settings.theme || 'dark';
  document.body.dataset.tracksView = store.settings.tracksView || 'grid';
  const player = getPlayer();
  player.audio.volume = store.settings.volume != null ? store.settings.volume : 0.8;
  const vol = document.getElementById('volume');
  if (vol) vol.value = String(Math.round((store.settings.volume ?? 0.8) * 100));
}

function wireNav() {
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(name) {
  if (!VIEWS[name]) name = 'home';
  currentView = name;
  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.view === name);
  });
  if (name !== 'playlists') resetPlaylistDetail();
  document.getElementById('viewTitle').textContent = VIEWS[name].title;
  rerender();
}

function rerender() {
  const root = document.getElementById('view');
  root.dataset.current = currentView;
  VIEWS[currentView].render(root);
}

function wireSearch() {
  const input = document.getElementById('searchInput');
  input.addEventListener('input', (e) => {
    if (currentView !== 'tracks') {
      switchView('tracks');
    }
    setTracksSearch(document.getElementById('view'), e.target.value);
  });
}

function wirePlayer() {
  const player = getPlayer();
  const cover = document.getElementById('playerCover');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const playBtn = document.getElementById('playBtn');
  const seek = document.getElementById('seek');
  const timeCur = document.getElementById('timeCur');
  const timeTotal = document.getElementById('timeTotal');
  const volume = document.getElementById('volume');
  const likeBtn = document.getElementById('likeBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');

  document.getElementById('prevBtn').addEventListener('click', () => player.prev());
  document.getElementById('nextBtn').addEventListener('click', () => player.next(true));
  playBtn.addEventListener('click', () => player.toggle());
  shuffleBtn.addEventListener('click', () => {
    player.toggleShuffle();
    shuffleBtn.classList.toggle('is-active', player.shuffle);
  });
  repeatBtn.addEventListener('click', () => {
    player.cycleRepeat();
    repeatBtn.classList.toggle('is-active', player.repeat !== 'off');
    repeatBtn.textContent = player.repeat === 'one' ? '⥁' : '⟲';
    repeatBtn.title = player.repeat === 'off' ? 'Повтор выключен' : player.repeat === 'one' ? 'Повтор трека' : 'Повтор всей очереди';
  });
  likeBtn.addEventListener('click', () => {
    if (!player.current) return;
    store.toggleLike(player.current.id);
    updateLike();
  });
  volume.addEventListener('input', () => {
    player.setVolume(Number(volume.value) / 100);
  });
  seek.addEventListener('input', () => {
    if (!player.audio.duration) return;
    player.audio.currentTime = (Number(seek.value) / 1000) * player.audio.duration;
  });

  player.addEventListener('track', () => {
    const t = player.current;
    cover.innerHTML = '';
    if (t && t.cover) {
      const img = document.createElement('img');
      img.src = t.cover;
      cover.appendChild(img);
    }
    title.textContent = t ? t.title : 'Ничего не играет';
    artist.textContent = t ? `${t.artist}${t.album ? ' — ' + t.album : ''}` : '—';
    updateLike();
    rerender();
  });
  player.addEventListener('state', () => {
    playBtn.textContent = player.isPlaying ? '⏸' : '▶';
  });
  player.addEventListener('time', () => {
    if (player.audio.duration) {
      seek.value = String(Math.round((player.audio.currentTime / player.audio.duration) * 1000));
      timeCur.textContent = fmtDuration(player.audio.currentTime);
      timeTotal.textContent = fmtDuration(player.audio.duration);
    } else {
      seek.value = '0';
      timeCur.textContent = '0:00';
      timeTotal.textContent = '0:00';
    }
  });
  player.addEventListener('queue', () => rerender());

  function updateLike() {
    const t = player.current;
    likeBtn.classList.toggle('is-active', !!t && store.isLiked(t.id));
  }
}

function wireUpdaterBanner() {
  const banner = document.getElementById('updateBanner');
  const titleEl = document.getElementById('ubTitle');
  const subEl = document.getElementById('ubSub');
  const action = document.getElementById('ubAction');
  const dismiss = document.getElementById('ubDismiss');
  const progress = document.getElementById('ubProgress');
  const progressBar = document.getElementById('ubProgressBar');

  let dismissed = false;
  let lastVersion = null;

  function apply(status) {
    if (!status) return;
    if (status.state === 'available' && !dismissed) {
      banner.hidden = false;
      progress.hidden = true;
      titleEl.textContent = 'Доступно обновление';
      subEl.textContent = status.info && status.info.version ? `Версия ${status.info.version}` : '';
      action.textContent = 'Обновить';
      action.disabled = false;
      lastVersion = status.info && status.info.version;
    } else if (status.state === 'downloading') {
      banner.hidden = false;
      progress.hidden = false;
      titleEl.textContent = 'Загрузка обновления';
      const pct = status.progress && status.progress.percent != null ? status.progress.percent : 0;
      progressBar.style.width = `${Math.round(pct)}%`;
      subEl.textContent = `${Math.round(pct)}%`;
      action.textContent = 'Загрузка…';
      action.disabled = true;
    } else if (status.state === 'downloaded') {
      banner.hidden = false;
      progress.hidden = true;
      titleEl.textContent = 'Готово к установке';
      subEl.textContent = lastVersion ? `Установить версию ${lastVersion}` : 'Установка после перезапуска';
      action.textContent = 'Перезапустить';
      action.disabled = false;
    } else if (status.state === 'error') {
      banner.hidden = false;
      progress.hidden = true;
      titleEl.textContent = 'Ошибка обновления';
      subEl.textContent = status.error || '';
      action.textContent = 'Повторить';
      action.disabled = false;
    } else if (status.state === 'up-to-date' && lastVersion) {
      banner.hidden = true;
    }
  }

  action.addEventListener('click', async () => {
    const s = await api.updater.status();
    if (s.state === 'available') await api.updater.download();
    else if (s.state === 'downloaded') await api.updater.install();
    else if (s.state === 'error') await api.updater.check();
  });
  dismiss.addEventListener('click', () => { dismissed = true; banner.hidden = true; });

  api.updater.status().then(apply);
  api.updater.onEvent((payload) => {
    if (payload && payload.event === 'status') apply(payload.payload);
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
