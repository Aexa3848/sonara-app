import { useEffect, useMemo, useRef, useState } from 'react';
import { searchMock, MOCK_ARTISTS, MOCK_ALBUMS } from '../lib/mock-data';
import { TrackList } from '../components/TrackList';
import { TrackCard } from '../components/TrackCard';
import { Section } from '../components/Section';
import { useRouter } from '../store/router';
import { cn } from '../lib/utils';
import { SoundCloudIcon, SpotifyIcon } from '../components/Icon';
import type { Provider } from '@shared/types';

type Filter = 'all' | 'tracks' | 'artists' | 'albums';

export function SearchView() {
  const route = useRouter((s) => s.route);
  const go = useRouter((s) => s.go);
  const initial = route.name === 'search' ? route.q ?? '' : '';
  const [q, setQ] = useState(initial);
  const [filter, setFilter] = useState<Filter>('all');
  const [providers, setProviders] = useState<Set<Provider>>(new Set(['spotify', 'soundcloud']));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync URL-ish state.
  useEffect(() => {
    if (route.name === 'search' && route.q !== q) {
      go({ name: 'search', q });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const tracks = useMemo(() => {
    return searchMock(q).filter((t) => providers.has(t.provider));
  }, [q, providers]);

  const artists = useMemo(() => {
    const ql = q.toLowerCase();
    return MOCK_ARTISTS.filter((a) => providers.has(a.provider)).filter(
      (a) => !ql || a.name.toLowerCase().includes(ql)
    );
  }, [q, providers]);

  const albums = useMemo(() => {
    const ql = q.toLowerCase();
    return MOCK_ALBUMS.filter((a) => providers.has(a.provider)).filter(
      (a) => !ql || a.title.toLowerCase().includes(ql) || a.artist.toLowerCase().includes(ql)
    );
  }, [q, providers]);

  const toggleProvider = (p: Provider) => {
    setProviders((curr) => {
      const next = new Set(curr);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      if (next.size === 0) next.add(p);
      return next;
    });
  };

  return (
    <div className="px-8 pb-12 pt-2">
      <div className="sticky top-0 z-20 -mx-8 mb-6 bg-bg-base/40 px-8 py-4 backdrop-blur-xl">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Что ищете?"
          className="w-full rounded-2xl border border-line bg-bg-surface px-6 py-4 text-2xl font-medium text-fg outline-none placeholder:text-fg-subtle focus:border-line-strong focus:bg-bg-surface-strong"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['all', 'tracks', 'artists', 'albums'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'border-fg bg-fg text-bg-deep'
                  : 'border-line text-fg-muted hover:text-fg hover:border-line-strong'
              )}
            >
              {labelFor(f)}
            </button>
          ))}
          <div className="mx-2 h-4 w-px bg-line" />
          <button
            type="button"
            onClick={() => toggleProvider('spotify')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              providers.has('spotify')
                ? 'border-spotify/50 bg-spotify/15 text-spotify'
                : 'border-line text-fg-subtle hover:text-fg-muted'
            )}
          >
            <SpotifyIcon size={12} /> Spotify
          </button>
          <button
            type="button"
            onClick={() => toggleProvider('soundcloud')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              providers.has('soundcloud')
                ? 'border-soundcloud/50 bg-soundcloud/15 text-soundcloud'
                : 'border-line text-fg-subtle hover:text-fg-muted'
            )}
          >
            <SoundCloudIcon size={12} /> SoundCloud
          </button>
        </div>
      </div>

      {q.trim() === '' ? (
        <EmptySearch />
      ) : (
        <div className="space-y-10">
          {(filter === 'all' || filter === 'artists') && artists.length > 0 && (
            <Section title="Исполнители">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
                {artists.slice(0, 8).map((a) => (
                  <div key={a.uid} className="rounded-xl border border-line/60 bg-bg-surface/40 p-4 text-center">
                    <img src={a.imageUrl} alt="" className="mx-auto mb-3 h-24 w-24 rounded-full object-cover" />
                    <div className="truncate text-sm font-medium">{a.name}</div>
                    <div className="text-[11px] text-fg-subtle">
                      {a.provider === 'spotify' ? 'Spotify' : 'SoundCloud'}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(filter === 'all' || filter === 'albums') && albums.length > 0 && (
            <Section title="Альбомы">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
                {albums.slice(0, 8).map((a) => (
                  <div key={a.uid} className="rounded-xl border border-transparent bg-bg-surface/40 p-3 hover:border-line">
                    <img src={a.coverUrl} alt="" className="mb-3 aspect-square w-full rounded-lg object-cover" />
                    <div className="truncate px-1 text-sm font-medium">{a.title}</div>
                    <div className="truncate px-1 text-xs text-fg-muted">{a.artist}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(filter === 'all' || filter === 'tracks') && (
            <Section title="Треки" description={`${tracks.length} результата${pluralEnding(tracks.length)}`}>
              {filter === 'tracks' ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
                  {tracks.map((t) => (
                    <TrackCard key={t.uid} track={t} context={tracks} />
                  ))}
                </div>
              ) : (
                <TrackList tracks={tracks.slice(0, 12)} />
              )}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function labelFor(f: Filter): string {
  if (f === 'all') return 'Всё';
  if (f === 'tracks') return 'Треки';
  if (f === 'artists') return 'Исполнители';
  return 'Альбомы';
}

function pluralEnding(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'ов';
  if (mod10 === 1) return '';
  if (mod10 >= 2 && mod10 <= 4) return 'а';
  return 'ов';
}

function EmptySearch() {
  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-gradient shadow-glow">
        <span className="text-2xl font-semibold text-white">?</span>
      </div>
      <h3 className="text-h2">Ищите по обоим сервисам сразу</h3>
      <p className="max-w-md text-sm text-fg-muted">
        Sonara показывает результаты Spotify и SoundCloud в одном списке. Используйте фильтры справа,
        чтобы выбрать только нужный сервис.
      </p>
    </div>
  );
}
