import { useState } from 'react';
import { MOCK_TRACKS } from '../lib/mock-data';
import { TrackList } from '../components/TrackList';
import { TrackCard } from '../components/TrackCard';
import { GridIcon, ListIcon } from '../components/Icon';
import { cn } from '../lib/utils';
import type { Provider } from '@shared/types';

export function LibraryView() {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [providers, setProviders] = useState<Set<Provider>>(new Set(['spotify', 'soundcloud']));

  const tracks = MOCK_TRACKS.filter((t) => providers.has(t.provider));

  const toggle = (p: Provider) => {
    setProviders((curr) => {
      const next = new Set(curr);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      if (next.size === 0) next.add(p);
      return next;
    });
  };

  return (
    <div className="px-8 pb-12 pt-4">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="label-overline mb-2">Единая библиотека</div>
          <h1 className="text-h1 gradient-text">Все треки</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {tracks.length} {pluralTracks(tracks.length)} из Spotify и SoundCloud в одном месте
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProviderToggle providers={providers} onToggle={toggle} />
          <div className="ml-2 inline-flex rounded-full border border-line bg-bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                view === 'list' ? 'bg-fg text-bg-deep' : 'text-fg-muted hover:text-fg'
              )}
              aria-label="Список"
            >
              <ListIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                view === 'grid' ? 'bg-fg text-bg-deep' : 'text-fg-muted hover:text-fg'
              )}
              aria-label="Сетка"
            >
              <GridIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <TrackList tracks={tracks} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 animate-fade-in">
          {tracks.map((t) => (
            <TrackCard key={t.uid} track={t} context={tracks} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProviderToggle({ providers, onToggle }: { providers: Set<Provider>; onToggle: (p: Provider) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-surface p-1 text-xs">
      <Pill active={providers.has('spotify')} onClick={() => onToggle('spotify')} color="spotify" label="Spotify" />
      <Pill active={providers.has('soundcloud')} onClick={() => onToggle('soundcloud')} color="soundcloud" label="SoundCloud" />
    </div>
  );
}

function Pill({ active, onClick, color, label }: { active: boolean; onClick: () => void; color: 'spotify' | 'soundcloud'; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 transition-colors',
        active
          ? color === 'spotify'
            ? 'bg-spotify/20 text-spotify'
            : 'bg-soundcloud/20 text-soundcloud'
          : 'text-fg-subtle hover:text-fg-muted'
      )}
    >
      {label}
    </button>
  );
}

function pluralTracks(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'треков';
  if (m10 === 1) return 'трек';
  if (m10 >= 2 && m10 <= 4) return 'трека';
  return 'треков';
}
