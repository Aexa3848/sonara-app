import { store } from '../state.js';
import { el, clear, fmtDuration, toast } from '../ui.js';
import { getPlayer } from '../player.js';

let detailId = null;

export function renderPlaylists(root) {
  clear(root);
  if (detailId) {
    renderDetail(root, detailId);
    return;
  }
  renderGrid(root);
}

function renderGrid(root) {
  const grid = el('div', { class: 'playlists-grid' });
  grid.appendChild(el('div', {
    class: 'playlist-card create',
    onclick: () => {
      const name = window.prompt('Название плейлиста', 'Новый плейлист');
      if (!name) return;
      const pl = store.createPlaylist(name.trim());
      detailId = pl.id;
      renderPlaylists(root);
    },
  }, [
    el('div', { class: 'plus' }, '+'),
    el('div', {}, 'Создать плейлист'),
  ]));

  for (const pl of store.playlists.slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))) {
    grid.appendChild(playlistCard(pl, root));
  }

  if (!store.playlists.length) {
    root.appendChild(el('div', { class: 'subtitle', style: { marginBottom: '12px' } }, 'У вас пока нет плейлистов. Создайте первый — это удобно для подборок и настроений.'));
  }
  root.appendChild(grid);
}

function playlistCard(pl, root) {
  const tracks = store.getTracksByIds(pl.trackIds);
  const totalSec = tracks.reduce((s, t) => s + (t.duration || 0), 0);
  const cover = el('div', { class: 'playlist-cover' });
  const withCovers = tracks.filter((t) => t.cover).slice(0, 4);
  if (withCovers.length === 0) {
    cover.appendChild(el('div', { class: 'empty', html: '♪' }));
  } else {
    while (withCovers.length < 4 && tracks.length > 0) withCovers.push(tracks[0]);
    for (const t of withCovers.slice(0, 4)) {
      cover.appendChild(el('img', { src: t.cover || '', alt: '', loading: 'lazy' }));
    }
  }
  return el('div', {
    class: 'playlist-card',
    onclick: () => { detailId = pl.id; renderPlaylists(root); },
  }, [
    cover,
    el('div', { class: 'name' }, pl.name),
    el('div', { class: 'meta' }, `${tracks.length} треков · ${fmtDuration(totalSec)}`),
  ]);
}

function renderDetail(root, id) {
  const pl = store.playlists.find((p) => p.id === id);
  if (!pl) {
    detailId = null;
    renderPlaylists(root);
    return;
  }
  const tracks = store.getTracksByIds(pl.trackIds);
  const player = getPlayer();
  const totalSec = tracks.reduce((s, t) => s + (t.duration || 0), 0);

  const back = el('button', {
    class: 'btn btn-ghost',
    onclick: () => { detailId = null; renderPlaylists(root); },
  }, '← К плейлистам');

  const cover = el('div', { class: 'pl-cover' });
  const withCovers = tracks.filter((t) => t.cover).slice(0, 4);
  if (withCovers.length === 0) cover.appendChild(el('div', { class: 'empty', html: '♪' }));
  else {
    while (withCovers.length < 4 && tracks.length > 0) withCovers.push(tracks[0]);
    for (const t of withCovers.slice(0, 4)) cover.appendChild(el('img', { src: t.cover || '', alt: '' }));
  }

  const header = el('div', { class: 'playlist-detail-header' }, [
    cover,
    el('div', { class: 'pl-info' }, [
      el('div', { class: 'meta' }, 'Плейлист'),
      el('h2', {}, pl.name),
      el('div', { class: 'meta' }, `${tracks.length} треков · ${fmtDuration(totalSec)}`),
      el('div', { class: 'pl-actions' }, [
        el('button', {
          class: 'btn btn-primary',
          onclick: () => {
            if (!tracks.length) return toast('Плейлист пуст');
            player.playQueue(tracks.map((t) => t.id), 0);
          },
        }, '▶ Воспроизвести'),
        el('button', {
          class: 'btn',
          onclick: () => {
            if (!tracks.length) return toast('Плейлист пуст');
            const ids = tracks.map((t) => t.id).slice();
            for (let i = ids.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [ids[i], ids[j]] = [ids[j], ids[i]];
            }
            player.playQueue(ids, 0);
          },
        }, '⇄ Перемешать'),
        el('button', {
          class: 'btn',
          onclick: () => openAddTracksDialog(pl, root),
        }, '+ Добавить треки'),
        el('button', {
          class: 'btn',
          onclick: () => {
            const name = window.prompt('Новое название', pl.name);
            if (name && name.trim()) {
              store.renamePlaylist(pl.id, name.trim());
              renderPlaylists(root);
            }
          },
        }, 'Переименовать'),
        el('button', {
          class: 'btn btn-danger',
          onclick: () => {
            if (window.confirm(`Удалить плейлист "${pl.name}"?`)) {
              store.deletePlaylist(pl.id);
              detailId = null;
              renderPlaylists(root);
            }
          },
        }, 'Удалить'),
      ]),
    ]),
  ]);

  root.appendChild(back);
  root.appendChild(header);

  if (!tracks.length) {
    root.appendChild(el('div', { class: 'empty-state' }, [
      el('div', { class: 'ico', html: '≡' }),
      el('h3', {}, 'Плейлист пуст'),
      el('p', {}, 'Нажмите "+ Добавить треки", чтобы наполнить его.'),
    ]));
    return;
  }

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
  tracks.forEach((t, i) => {
    const isPlaying = player.current && player.current.id === t.id;
    const row = el('div', {
      class: 'row' + (isPlaying ? ' is-playing' : ''),
      onclick: () => player.playQueue(tracks.map((x) => x.id), i),
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
      el('button', {
        class: 'btn btn-icon',
        onclick: (e) => {
          e.stopPropagation();
          store.removeTrackFromPlaylist(pl.id, t.id);
          renderPlaylists(root);
        },
        title: 'Убрать из плейлиста',
      }, '✕'),
    ]);
    list.appendChild(row);
  });
  root.appendChild(list);
}

function openAddTracksDialog(pl, root) {
  if (!store.tracks.length) {
    toast('Сначала добавьте папки с музыкой в настройках');
    return;
  }
  const overlay = el('div', {
    style: {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '200',
    },
    onclick: (e) => { if (e.target === overlay) document.body.removeChild(overlay); },
  });
  const selected = new Set(pl.trackIds);
  const search = el('input', {
    type: 'search', placeholder: 'Поиск треков',
    style: { width: '100%', padding: '10px 12px', marginBottom: '10px', background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)' },
  });
  const list = el('div', { style: { maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' } });
  const dialog = el('div', {
    style: {
      width: '560px', maxWidth: '90vw',
      background: 'var(--bg-elev)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px',
      boxShadow: 'var(--shadow)',
    },
  }, [
    el('h3', { style: { margin: '0 0 12px' } }, `Добавить треки в "${pl.name}"`),
    search,
    list,
    el('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' } }, [
      el('button', { class: 'btn btn-ghost', onclick: () => document.body.removeChild(overlay) }, 'Отмена'),
      el('button', {
        class: 'btn btn-primary',
        onclick: () => {
          const newIds = Array.from(selected).filter((id) => !pl.trackIds.includes(id));
          store.addTracksToPlaylist(pl.id, newIds);
          document.body.removeChild(overlay);
          renderPlaylists(root);
          if (newIds.length) toast(`Добавлено: ${newIds.length}`);
        },
      }, 'Добавить'),
    ]),
  ]);

  function rebuild(filter = '') {
    const q = filter.toLowerCase();
    const filtered = store.tracks.filter((t) =>
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album || '').toLowerCase().includes(q),
    ).slice(0, 200);
    list.innerHTML = '';
    for (const t of filtered) {
      const checked = selected.has(t.id);
      const row = el('label', {
        style: {
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 8px', borderRadius: '4px', cursor: 'pointer',
          background: checked ? 'var(--accent-soft)' : 'transparent',
        },
      }, [
        el('input', {
          type: 'checkbox', checked,
          onchange: (e) => {
            if (e.target.checked) selected.add(t.id);
            else selected.delete(t.id);
            row.style.background = e.target.checked ? 'var(--accent-soft)' : 'transparent';
          },
        }),
        el('div', { style: { flex: '1', minWidth: '0' } }, [
          el('div', { style: { fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, t.title),
          el('div', { style: { fontSize: '12px', color: 'var(--text-dim)' } }, `${t.artist} · ${t.album || ''}`),
        ]),
      ]);
      list.appendChild(row);
    }
    if (!filtered.length) list.appendChild(el('div', { style: { padding: '20px', textAlign: 'center', color: 'var(--text-dim)' } }, 'Ничего не найдено'));
  }
  search.addEventListener('input', () => rebuild(search.value));
  rebuild('');
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  search.focus();
}

export function resetPlaylistDetail() { detailId = null; }
