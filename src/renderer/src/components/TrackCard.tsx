import type { Track } from '@shared/types';
import { usePlayer } from '../store/player';
import { PlayIcon, SoundCloudIcon, SpotifyIcon } from './Icon';
import { cn } from '../lib/utils';

interface Props {
  track: Track;
  /** Optional click context — list of tracks to enqueue when this card is played. */
  context?: Track[];
}

export function TrackCard({ track, context }: Props) {
  const playQueue = usePlayer((s) => s.playQueue);
  const playTrack = usePlayer((s) => s.playTrack);
  const isCurrent = usePlayer((s) => s.current?.uid === track.uid);
  const isPlaying = usePlayer((s) => s.isPlaying && s.current?.uid === track.uid);

  return (
    <button
      type="button"
      onClick={() => {
        if (context) {
          const idx = context.findIndex((t) => t.uid === track.uid);
          playQueue(context, idx === -1 ? 0 : idx);
        } else {
          playTrack(track);
        }
      }}
      className="group relative flex w-full flex-col items-start gap-3 rounded-xl border border-transparent bg-bg-surface/40 p-3 text-left transition-all duration-300 ease-soft hover:border-line hover:bg-bg-surface hover:-translate-y-0.5"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-elevated">
        <img src={track.coverUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute right-2 bottom-2 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-accent-gradient text-white opacity-0 shadow-glow transition-all duration-300 ease-soft group-hover:translate-y-0 group-hover:opacity-100">
          <PlayIcon size={16} />
        </div>
        <span className="absolute left-2 top-2 inline-flex h-5 items-center gap-1 rounded-full bg-black/55 px-2 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
          {track.provider === 'spotify' ? <SpotifyIcon size={10} className="text-spotify" /> : <SoundCloudIcon size={10} className="text-soundcloud" />}
          {track.provider === 'spotify' ? 'Spotify' : 'SoundCloud'}
        </span>
      </div>
      <div className="min-w-0 px-1 leading-tight">
        <div className={cn('truncate text-sm font-medium', isCurrent && 'text-accent')}>{track.title}</div>
        <div className="truncate text-xs text-fg-muted">{track.artist}</div>
      </div>
      {isPlaying && <PlayingDot />}
    </button>
  );
}

function PlayingDot() {
  return (
    <div className="absolute right-3 top-3 flex items-end gap-0.5 animate-pulse-soft">
      <span className="h-2 w-0.5 rounded-full bg-accent" />
      <span className="h-3 w-0.5 rounded-full bg-accent" />
      <span className="h-1.5 w-0.5 rounded-full bg-accent" />
    </div>
  );
}
