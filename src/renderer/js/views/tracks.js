import { store } from '../state.js';
import { el, clear, fmtDuration, debounce } from '../ui.js';
import { getPlayer } from '../player.js';

let viewState = {
  search: '',
  sort: 'addedAt-desc',
};

export function renderTracks(root, ctx = {}) {
  clear(root);
  if (ctx.search != null) viewState.search = ctx.search;

  const tracks = store.tracks;
  if (!tracks.length) {
    root.appendChild(emptyState());
    return;
  }

  const filtered = applyFilterSort(tracks, viewState);
  const player = getPlayer();
  const mode = store.settings.tracksView || 'grid';

  const toolbar = renderToolbar(root, mode);
  root.appendChild(toolbar);

  if (!filtered.length) {
    root.appendChild(el('div', { class: 'empty-state' }, [
      el('div', { class: 'ico', html: '∅' }),
      el('h3', {}, 'Ничего не найдено'),
      el('p', {}, 'Попробуйте изменить запрос или сбросить фильтры.'),
    ]));
    return;
  }

  if (mode === 'list') {
    root.appendChild(renderList(filtered, player));
  } else {
    root.appendChild(renderGrid(filtered, player));
  }
}

function renderToolbar(root, mode) {
  const updateMode = (next) => {
    store.updateSettings({ tracksView: next });
    document.body.dataset.tracksView = next;
    renderTracks(root, viewState);
  };

  const sort = el('select', { class: 'sort-select' }, [
    el('option', { value: 'addedAt-desc' }, 'Сначала новые'),
    el('option', { value: 'title-asc' }, 'По названию'),
    el('option', { value: 'artist-asc' }, 'По исполнителю'),
    el('option', { value: 'album-asc' }, 'По альбому'),
    el('option', { value: 'duration-desc' }, 'Сначала длинные'),
  ]);
  sort.value = viewState.sort;
  sort.addEventListener('change', () => {
    viewState.sort = sort.value;
    renderTracks(root, viewState);
  });

  return el('div', { class: 'view-toolbar' }, [
    el('div', { class: 'view-mode', role: 'group', 'aria-label': 'Режим отображения' }, [
      el('button', {
        class: mode === 'grid' ? 'is-active' : '',
        onclick: () => updateMode('grid'),
        title: 'Сетка',
      }, '▦ Сетка'),
      el('button', {
        class: mode === 'list' ? 'is-active' : '',
        onclick: () => updateMode('list'),
        title: 'Список',
      }, '☰ Список'),
    ]),
    sort,
    el('div', { class: 'toolbar-spacer' }),
    el('div', { class: 'meta', style: { color: 'var(--text-dim)', fontSize: '13px' } }, `${store.tracks.length} треков`),
  ]);
}

function applyFilterSort(tracks, state) {
  const q = (state.search || '').toLowerCase().trim();
  let out = tracks;
  if (q) {
    out = out.filter((t) =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q)),
    );
  }
  const [field, dir] = (state.sort || 'addedAt-desc').split('-');
  const sign = dir === 'desc' ? -1 : 1;
  out = out.slice().sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
    return String(av).localeCompare(String(bv), 'ru') * sign;
  });
  return out;
}

function renderGrid(tracks, player) {
  const grid = el('div', { class: 'track-grid' });
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const card = el('div', {
      class: 'track-card' + (player.current && player.current.id === t.id ? ' is-playing' : ''),
      ondblclick: () => player.playQueue(tracks.map((x) => x.id), i),
      onclick: () => player.playQueue(tracks.map((x) => x.id), i),
    }, [
      coverFor(t),
      el('div', { class: 'title', title: t.title }, t.title),
      el('div', { class: 'artist', title: t.artist }, t.artist),
    ]);
    grid.appendChild(card);
  }
  return grid;
}

function renderList(tracks, player) {
  const list = el('div', { class: 'track-list' });
  list.appendChild(el('div', { class: 'row head' }, [
    el('div', { class: 'cell-num' }, '#'),
    el('div'),
    el('div', { class: 'cell-title' }, 'Название'),
    el('div', { class: 'cell-album' }, 'Альбом'),
    el('div', { class: 'cell-artist' }, 'Исполнитель'),
    el('div', { class: 'cell-duration' }, 'Длит.'),
    el('div', {}),
  ]));
  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const isPlaying = player.current && player.current.id === t.id;
    const liked = store.isLiked(t.id);
    const row = el('div', {
      class: 'row' + (isPlaying ? ' is-playing' : ''),
      onclick: () => player.playQueue(tracks.map((x) => x.id), i),
    }, [
      el('div', { class: 'cell-num' }, String(i + 1)),
      smallCover(t),
      el('div', { class: 'cell-title' }, [
        el('div', {}, t.title),
        el('div', { class: 'sub' }, t.artist),
      ]),
      el('div', { class: 'cell-album' }, t.album || '—'),
      el('div', { class: 'cell-artist' }, t.artist),
      el('div', { class: 'cell-duration' }, fmtDuration(t.duration)),
      el('button', {
        class: 'btn btn-icon cell-like' + (liked ? ' is-liked' : ''),
        onclick: (e) => {
          e.stopPropagation();
          store.toggleLike(t.id);
          renderTracks(document.getElementById('view'), viewState);
        },
        title: liked ? 'Убрать из любимого' : 'Добавить в любимое',
      }, liked ? '♥' : '♡'),
    ]);
    list.appendChild(row);
  }
  return list;
}

function coverFor(track) {
  const wrap = el('div', { class: 'cover' });
  if (track.cover) wrap.appendChild(el('img', { src: track.cover, alt: '', loading: 'lazy' }));
  wrap.appendChild(el('div', { class: 'play-overlay', html: '▶' }));
  return wrap;
}

function smallCover(track) {
  const wrap = el('div', { class: 'cell-cover' });
  if (track.cover) wrap.appendChild(el('img', { src: track.cover, alt: '', loading: 'lazy' }));
  return wrap;
}

function emptyState() {
  return el('div', { class: 'empty-state' }, [
    el('div', { class: 'ico', html: '♪' }),
    el('h3', {}, 'Треков пока нет'),
    el('p', {}, 'Добавьте папки с музыкой в настройках, и они появятся здесь.'),
    el('button', {
      class: 'btn btn-primary',
      onclick: () => document.querySelector('.nav-item[data-view="settings"]').click(),
    }, 'Открыть настройки'),
  ]);
}

export const debouncedSearch = debounce((root, q) => {
  viewState.search = q;
  renderTracks(root, viewState);
}, 180);

export function setSearch(root, q) { debouncedSearch(root, q); }
