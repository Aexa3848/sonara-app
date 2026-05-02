import { store } from '../state.js';
import { el, clear, fmtDuration } from '../ui.js';
import { getPlayer } from '../player.js';

export function renderHome(root) {
  clear(root);
  const player = getPlayer();
  const tracks = store.tracks;

  if (!tracks.length) {
    root.appendChild(emptyState());
    return;
  }

  const recent = tracks.slice().sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 12);
  root.appendChild(section('Недавно добавленные', `Всего треков: ${tracks.length}`, recent));

  const freqMap = new Map();
  for (const h of store.history) freqMap.set(h.id, (freqMap.get(h.id) || 0) + 1);
  const top = tracks
    .filter((t) => freqMap.has(t.id))
    .sort((a, b) => (freqMap.get(b.id) || 0) - (freqMap.get(a.id) || 0))
    .slice(0, 12);
  if (top.length) root.appendChild(section('Часто слушаете', '', top));

  const liked = tracks.filter((t) => store.likes.has(t.id)).slice(0, 12);
  if (liked.length) root.appendChild(section('Любимое', `${store.likes.size} треков`, liked));

  function section(title, subtitle, items) {
    const wrap = el('section', { class: 'section' }, [
      el('h2', {}, title),
      subtitle ? el('div', { class: 'subtitle' }, subtitle) : null,
      gridOfCards(items),
    ]);
    return wrap;
  }

  function gridOfCards(items) {
    const grid = el('div', { class: 'track-grid' });
    for (const t of items) {
      const card = el('div', {
        class: 'track-card' + (player.current && player.current.id === t.id ? ' is-playing' : ''),
        onclick: () => player.playQueue(items.map((x) => x.id), items.indexOf(t)),
      }, [
        coverFor(t),
        el('div', { class: 'title', title: t.title }, t.title),
        el('div', { class: 'artist', title: t.artist }, t.artist),
      ]);
      grid.appendChild(card);
    }
    return grid;
  }
}

function coverFor(track) {
  const wrap = el('div', { class: 'cover' });
  if (track.cover) {
    wrap.appendChild(el('img', { src: track.cover, alt: '', loading: 'lazy' }));
  }
  wrap.appendChild(el('div', { class: 'play-overlay', html: '▶' }));
  return wrap;
}

function emptyState() {
  return el('div', { class: 'empty-state' }, [
    el('div', { class: 'ico', html: '♪' }),
    el('h3', {}, 'Библиотека пуста'),
    el('p', {}, 'Добавьте папки с музыкой в настройках, и Sonara найдёт ваши треки.'),
    el('button', {
      class: 'btn btn-primary',
      onclick: () => document.querySelector('.nav-item[data-view="settings"]').click(),
    }, 'Открыть настройки'),
  ]);
}

export { fmtDuration };
