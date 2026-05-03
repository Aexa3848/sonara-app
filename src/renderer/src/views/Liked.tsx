import { useMemo } from 'react';
import { useLibrary } from '../store/library';
import { tracksByUids } from '../lib/mock-data';
import { TrackList } from '../components/TrackList';
import { usePlayer } from '../store/player';
import { HeartIcon, PlayIcon } from '../components/Icon';
import { formatTotal } from '../lib/utils';

export function LikedView() {
  const liked = useLibrary((s) => Array.from(s.liked));
  const tracks = useMemo(() => tracksByUids(liked), [liked]);
  const playQueue = usePlayer((s) => s.playQueue);
  const total = tracks.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="px-8 pb-12 pt-4">
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
        <div
          className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-elevated md:h-56 md:w-56"
          style={{
            background:
              'linear-gradient(135deg, #FF3D71 0%, #5E6AD2 100%)'
          }}
        >
          <HeartIcon size={64} className="text-white drop-shadow" filled />
        </div>
        <div>
          <div className="label-overline mb-2">Плейлист</div>
          <h1 className="text-display gradient-text leading-none">Любимые</h1>
          <p className="mt-3 text-sm text-fg-muted">
            {tracks.length === 0
              ? 'Пока пусто — добавляйте треки в любимые сердечком на любом треке'
              : `${tracks.length} треков · ${formatTotal(total)}`}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              className="btn-accent"
              disabled={tracks.length === 0}
              onClick={() => playQueue(tracks)}
            >
              <PlayIcon size={14} /> Слушать
            </button>
          </div>
        </div>
      </header>

      <TrackList tracks={tracks} numbered />
    </div>
  );
}
