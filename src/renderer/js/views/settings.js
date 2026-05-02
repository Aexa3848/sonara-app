import { store } from '../state.js';
import { el, clear, toast } from '../ui.js';
import { api } from '../api.js';

let updaterStatus = { state: 'idle' };
let appInfo = { version: '0.0.0', isDev: false };

export async function initSettings() {
  appInfo = await api.app.getInfo().catch(() => appInfo);
  updaterStatus = await api.updater.status().catch(() => updaterStatus);
  api.updater.onEvent((payload) => {
    if (payload && payload.event === 'status') {
      updaterStatus = payload.payload;
      const view = document.getElementById('view');
      if (view && view.dataset.current === 'settings') renderSettings(view);
    }
  });
}

export function renderSettings(root) {
  clear(root);
  root.dataset.current = 'settings';

  root.appendChild(librarySection());
  root.appendChild(appearanceSection());
  root.appendChild(updaterSection());
  root.appendChild(aboutSection());
}

function librarySection() {
  const section = el('div', { class: 'settings-section' }, [
    el('h3', {}, 'Музыкальная библиотека'),
    el('p', { class: 'desc' }, 'Sonara сканирует папки и подхватывает треки. Поддерживаются mp3, flac, wav, ogg, m4a, opus.'),
  ]);

  const folderList = el('div', { class: 'folder-list' });
  if (!store.libraryFolders.length) {
    folderList.appendChild(el('div', { class: 'desc' }, 'Папок пока нет. Добавьте хотя бы одну.'));
  }
  for (const path of store.libraryFolders) {
    folderList.appendChild(el('div', { class: 'folder-row' }, [
      el('div', { class: 'path', title: path }, path),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        onclick: () => {
          store.removeLibraryFolder(path);
          renderSettings(document.getElementById('view'));
        },
      }, 'Убрать'),
    ]));
  }
  section.appendChild(folderList);

  const status = el('div', { class: 'desc', id: 'scanStatus', style: { marginTop: '8px' } }, '');

  const buttons = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, [
    el('button', {
      class: 'btn btn-primary',
      onclick: async () => {
        const picked = await api.dialog.pickFolder();
        if (picked && picked.length) {
          store.addLibraryFolders(picked);
          renderSettings(document.getElementById('view'));
          await rescan();
        }
      },
    }, '+ Добавить папку'),
    el('button', {
      class: 'btn',
      onclick: rescan,
      disabled: !store.libraryFolders.length,
    }, '↻ Пересканировать'),
  ]);
  section.appendChild(buttons);
  section.appendChild(status);

  return section;

  async function rescan() {
    if (!store.libraryFolders.length) return;
    status.textContent = 'Сканирую…';
    const off = api.library.onScanProgress((p) => {
      if (p.total) {
        status.textContent = `Сканирую: ${p.processed}/${p.total}`;
      }
    });
    try {
      const tracks = await api.library.scan(store.libraryFolders);
      store.setTracks(tracks);
      toast(`Найдено треков: ${tracks.length}`);
      status.textContent = `Готово. Найдено: ${tracks.length}`;
    } catch (err) {
      console.error(err);
      status.textContent = 'Ошибка сканирования';
      toast('Ошибка сканирования');
    } finally {
      off && off();
    }
  }
}

function appearanceSection() {
  const section = el('div', { class: 'settings-section' }, [
    el('h3', {}, 'Внешний вид'),
    el('p', { class: 'desc' }, 'Тема оформления и режим вкладки "Треки".'),
  ]);

  section.appendChild(toggleRow('Тёмная тема', 'Светлая тема также доступна, переключайте по вкусу.', store.settings.theme === 'dark', (on) => {
    const theme = on ? 'dark' : 'light';
    store.updateSettings({ theme });
    document.body.dataset.theme = theme;
    renderSettings(document.getElementById('view'));
  }));

  const viewMode = store.settings.tracksView || 'grid';
  const modeRow = el('div', { class: 'toggle-row' }, [
    el('div', {}, [
      el('label', {}, 'Вид треков по умолчанию'),
      el('span', { class: 'desc' }, 'Можно переключать на самой вкладке "Треки".'),
    ]),
    el('div', { class: 'view-mode' }, [
      el('button', {
        class: viewMode === 'grid' ? 'is-active' : '',
        onclick: () => {
          store.updateSettings({ tracksView: 'grid' });
          document.body.dataset.tracksView = 'grid';
          renderSettings(document.getElementById('view'));
        },
      }, '▦ Сетка'),
      el('button', {
        class: viewMode === 'list' ? 'is-active' : '',
        onclick: () => {
          store.updateSettings({ tracksView: 'list' });
          document.body.dataset.tracksView = 'list';
          renderSettings(document.getElementById('view'));
        },
      }, '☰ Список'),
    ]),
  ]);
  section.appendChild(modeRow);

  return section;
}

function updaterSection() {
  const s = updaterStatus || { state: 'idle' };
  const label = describeStatus(s);
  const section = el('div', { class: 'settings-section' }, [
    el('h3', {}, 'Обновления'),
    el('p', { class: 'desc' }, 'Sonara проверяет обновления автоматически и устанавливает их по вашему согласию.'),
  ]);
  section.appendChild(toggleRow('Автоматическая проверка', 'Проверять GitHub Releases каждый час.', !!store.settings.autoCheckUpdates, (on) => {
    store.updateSettings({ autoCheckUpdates: on });
    renderSettings(document.getElementById('view'));
  }));
  section.appendChild(el('div', { style: { marginTop: '10px' } }, [
    el('div', { class: 'desc' }, label),
    el('div', { style: { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' } }, [
      el('button', {
        class: 'btn',
        onclick: async () => {
          updaterStatus = { state: 'checking' };
          renderSettings(document.getElementById('view'));
          updaterStatus = await api.updater.check();
          renderSettings(document.getElementById('view'));
        },
      }, 'Проверить сейчас'),
      s.state === 'available' ? el('button', {
        class: 'btn btn-primary',
        onclick: async () => {
          await api.updater.download();
        },
      }, 'Скачать обновление') : null,
      s.state === 'downloaded' ? el('button', {
        class: 'btn btn-primary',
        onclick: () => api.updater.install(),
      }, 'Установить и перезапустить') : null,
    ]),
  ]));
  return section;
}

function aboutSection() {
  return el('div', { class: 'settings-section' }, [
    el('h3', {}, 'О приложении'),
    el('p', { class: 'desc' }, 'Sonara — локальный музыкальный плеер на Electron.'),
    el('div', { class: 'desc' }, `Версия: ${appInfo.version}${appInfo.isDev ? ' (dev)' : ''}`),
    el('div', { class: 'desc' }, 'Репозиторий: github.com/Aexa3848/sonara-app'),
  ]);
}

function toggleRow(label, desc, checked, onChange) {
  const toggle = el('div', { class: 'toggle' + (checked ? ' is-on' : '') });
  toggle.addEventListener('click', () => {
    const next = !toggle.classList.contains('is-on');
    toggle.classList.toggle('is-on', next);
    onChange(next);
  });
  return el('div', { class: 'toggle-row' }, [
    el('div', {}, [
      el('label', {}, label),
      desc ? el('span', { class: 'desc' }, desc) : null,
    ]),
    toggle,
  ]);
}

function describeStatus(s) {
  switch (s.state) {
    case 'checking': return 'Проверяем наличие обновлений…';
    case 'available': return s.info && s.info.version ? `Доступна версия ${s.info.version}` : 'Доступно новое обновление';
    case 'downloading': return s.progress && s.progress.percent != null ? `Загрузка: ${Math.round(s.progress.percent)}%` : 'Загрузка обновления…';
    case 'downloaded': return 'Обновление загружено. Готово к установке.';
    case 'up-to-date': return 'У вас актуальная версия.';
    case 'error': return `Ошибка: ${s.error || 'неизвестная ошибка'}`;
    case 'dev': return 'В режиме разработки авто-обновление отключено.';
    default: return 'Состояние: ожидание.';
  }
}
