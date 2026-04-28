import { store } from '../state.js';
import { el, clear, fmtDuration } from '../ui.js';
import { getPlayer } from '../player.js';

export function renderWave(root) {
  clear(root);
  const player = getPlayer();
  const tracks = store.tracks;

  const hero = el('section', { class: 'wave-hero' }, [
    el('div', { class: 'wave-disc' }),
    el('div', { style: { flex: '1', minWidth: '0' } }, [
      el('div', { style: { color: 'var(--text-dim)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px' } }, 'Sonara'),
      el('h2', {}, 'Моя волна'),
      el('p', {}, 'Бесконечный персональный поток. Учитывает ваши лайки, частые прослушивания и старается не повторяться. Ставьте лайк, чтобы волна стала точнее.'),
      el('div', { class: 'wave-actions' }, [
        el('button', {
          class: 'btn btn-primary',
          onclick: () => {
            if (!tracks.length) {
              alert('Сначала добавьте папки с музыкой в Настройках.');
              return;
            }
            player.startWave();
          },
        }, '▶ Запустить волну'),
        el('button', {
          class: 'btn',
          onclick: () => renderWave(root),
        }, 'Обновить очередь'),
      ]),
    ]),
  ]);

  root.appendChild(hero);

  // Текущая очередь волны
  if (player.waveMode && player.queue.length) {
    const queueTracks = player.queue.map((id) => store.getTrackById(id)).filter(Boolean);
    const section = el('section', { class: 'section' }, [
      el('h2', {}, 'Сейчас в волне'),
      el('div', { class: 'subtitle' }, `${queueTracks.length} треков · обновляется автоматически`),
    ]);
    section.appendChild(buildList(queueTracks, player));
    root.appendChild(section);
  } else {
    const liked = tracks.filter((t) => store.likes.has(t.id));
    if (liked.length) {
      const section = el('section', { class: 'section' }, [
        el('h2', {}, 'Любимое'),
        el('div', { class: 'subtitle' }, 'Эти треки получают приоритет в волне'),
      ]);
      section.appendChild(buildGrid(liked.slice(0, 12), player));
      root.appendChild(section);
    }

    const recentIds = Array.from(new Set(store.history.slice(-30).reverse().map((h) => h.id)));
    const recent = recentIds.map((id) => store.getTrackById(id)).filter(Boolean).slice(0, 12);
    if (recent.length) {
      const section = el('section', { class: 'section' }, [
        el('h2', {}, 'Недавно слушали'),
      ]);
      section.appendChild(buildGrid(recent, player));
      root.appendChild(section);
    }

    if (!tracks.length) {
      root.appendChild(el('div', { class: 'empty-state' }, [
        el('div', { class: 'ico', html: '~' }),
        el('h3', {}, 'Волна ждёт музыку'),
        el('p', {}, 'Добавьте папки с треками — и волна заиграет.'),
      ]));
    }
  }
}

function buildGrid(items, player) {
  const grid = el('div', { class: 'track-grid' });
  for (let i = 0; i < items.length; i++) {
    const t = items[i];
    grid.appendChild(el('div', {
      class: 'track-card' + (player.current && player.current.id === t.id ? ' is-playing' : ''),
      onclick: () => player.playQueue(items.map((x) => x.id), i),
    }, [
      (() => {
        const w = el('div', { class: 'cover' });
        if (t.cover) w.appendChild(el('img', { src: t.cover, alt: '', loading: 'lazy' }));
        w.appendChild(el('div', { class: 'play-overlay', html: '▶' }));
        return w;
      })(),
      el('div', { class: 'title', title: t.title }, t.title),
      el('div', { class: 'artist', title: t.artist }, t.artist),
    ]));
  }
  return grid;
}

function buildList(items, player) {
  const list = el('div', { class: 'track-list' });
  list.appendChild(el('div', { class: 'row head' }, [
    el('div', { class: 'cell-num' }, '#'),
    el('div'),
    el('div', { class: 'cell-title' }, 'Название'),
    el('div', { class: 'cell-album' }, 'Альбом'),
    el('div', { class: 'cell-artist' }, 'Исполнитель'),
    el('div', { class: 'cell-duration' }, 'Длит.'),
    el('div'),
  ]));
  items.forEach((t, i) => {
    const isPlaying = player.current && player.current.id === t.id;
    list.appendChild(el('div', {
      class: 'row' + (isPlaying ? ' is-playing' : ''),
      onclick: () => player.playQueue(items.map((x) => x.id), i),
    }, [
      el('div', { class: 'cell-num' }, String(i + 1)),
      (() => { const c = el('div', { class: 'cell-cover' }); if (t.cover) c.appendChild(el('img', { src: t.cover, alt: '' })); return c; })(),
      el('div', { class: 'cell-title' }, [
        el('div', {}, t.title),
        el('div', { class: 'sub' }, t.artist),
      ]),
      el('div', { class: 'cell-album' }, t.album || '—'),
      el('div', { class: 'cell-artist' }, t.artist),
      el('div', { class: 'cell-duration' }, fmtDuration(t.duration)),
      el('div'),
    ]));
  });
  return list;
}
