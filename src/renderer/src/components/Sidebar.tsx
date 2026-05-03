import { useLibrary } from '../store/library';
import { useRouter, type Route } from '../store/router';
import {
  HomeIcon,
  SearchIcon,
  LibraryIcon,
  HeartIcon,
  WaveIcon,
  SpotifyIcon,
  SoundCloudIcon,
  PlusIcon,
  SettingsIcon
} from './Icon';
import { cn } from '../lib/utils';
import { useState } from 'react';

interface NavLinkProps {
  to: Route;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

function NavLink({ to, icon, label, active }: NavLinkProps) {
  const go = useRouter((s) => s.go);
  return (
    <button
      type="button"
      onClick={() => go(to)}
      className={cn('nav-item w-full text-left', active && 'nav-item-active')}
    >
      <span className="text-fg-muted">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export function Sidebar() {
  const route = useRouter((s) => s.route);
  const playlists = useLibrary((s) => s.playlists);
  const create = useLibrary((s) => s.createPlaylist);
  const go = useRouter((s) => s.go);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');

  const submit = async () => {
    const name = draft.trim();
    if (!name) {
      setCreating(false);
      return;
    }
    const p = await create(name);
    setDraft('');
    setCreating(false);
    go({ name: 'playlist', id: p.id });
  };

  const isRoute = (n: Route['name']) => route.name === n;

  return (
    <aside className="relative z-10 flex w-64 shrink-0 flex-col gap-1 border-r border-line bg-bg-base/60 px-3 py-4 backdrop-blur-xl">
      <div className="drag flex items-center gap-2 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient shadow-glow">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Sonara</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-fg-subtle">Hybrid Player</div>
        </div>
      </div>

      <div className="mt-4 space-y-0.5">
        <NavLink to={{ name: 'home' }} icon={<HomeIcon />} label="Главная" active={isRoute('home')} />
        <NavLink to={{ name: 'search' }} icon={<SearchIcon />} label="Поиск" active={isRoute('search')} />
        <NavLink to={{ name: 'wave' }} icon={<WaveIcon />} label="Моя волна" active={isRoute('wave')} />
      </div>

      <div className="mt-6 px-3">
        <div className="label-overline">Библиотека</div>
      </div>
      <div className="mt-2 space-y-0.5">
        <NavLink to={{ name: 'library' }} icon={<LibraryIcon />} label="Все треки" active={isRoute('library')} />
        <NavLink to={{ name: 'liked' }} icon={<HeartIcon />} label="Любимые" active={isRoute('liked')} />
      </div>

      <div className="mt-6 px-3">
        <div className="label-overline">Сервисы</div>
      </div>
      <div className="mt-2 space-y-0.5">
        <NavLink to={{ name: 'spotify' }} icon={<SpotifyIcon />} label="Spotify" active={isRoute('spotify')} />
        <NavLink to={{ name: 'soundcloud' }} icon={<SoundCloudIcon />} label="SoundCloud" active={isRoute('soundcloud')} />
      </div>

      <div className="mt-6 flex items-center justify-between px-3">
        <div className="label-overline">Плейлисты</div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-fg-muted hover:text-fg hover:bg-bg-surface transition-colors"
          aria-label="Создать плейлист"
        >
          <PlusIcon size={14} />
        </button>
      </div>

      <div className="mt-1 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {creating && (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
              if (e.key === 'Escape') {
                setDraft('');
                setCreating(false);
              }
            }}
            placeholder="Новый плейлист"
            className="w-full rounded-lg bg-bg-surface px-3 py-2 text-sm text-fg outline-none ring-1 ring-line focus:ring-accent/40 placeholder:text-fg-subtle"
          />
        )}
        {playlists.length === 0 && !creating && (
          <div className="px-3 py-2 text-xs text-fg-subtle">
            Создайте свой первый плейлист — можно смешивать треки Spotify и SoundCloud.
          </div>
        )}
        {playlists.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => go({ name: 'playlist', id: p.id })}
            className={cn(
              'nav-item w-full text-left',
              route.name === 'playlist' && route.id === p.id && 'nav-item-active'
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-bg-surface-strong text-[10px] font-semibold text-fg-muted">
              {(p.name[0] ?? '•').toUpperCase()}
            </span>
            <span className="truncate text-sm">{p.name}</span>
            <span className="ml-auto text-[10px] text-fg-subtle">{p.trackUids.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-2 border-t border-line pt-2">
        <NavLink to={{ name: 'settings' }} icon={<SettingsIcon size={18} />} label="Настройки" active={isRoute('settings')} />
      </div>
    </aside>
  );
}
