import { useState } from 'react';
import type { Track } from '@shared/types';
import { useLibrary } from '../store/library';
import { usePlayer } from '../store/player';
import { cn, formatTime } from '../lib/utils';
import { HeartIcon, MoreIcon, PauseIcon, PlayIcon, PlusIcon, SoundCloudIcon, SpotifyIcon } from './Icon';

interface Props {
  tracks: Track[];
  /** When true, show numbered first column (album / playlist style). */
  numbered?: boolean;
  /** When set, omits the album column (e.g. on an album page). */
  hideAlbum?: boolean;
  /** Action label / handler for context menu (e.g. "Remove from playlist"). */
  rowAction?: { label: string; onClick: (t: Track, index: number) => void };
}

export function TrackList({ tracks, numbered = false, hideAlbum = false, rowAction }: Props) {
  const { current, isPlaying, playQueue, toggle } = usePlayer((s) => ({
    current: s.current,
    isPlaying: s.isPlaying,
    playQueue: s.playQueue,
    toggle: s.toggle
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-line/60 bg-bg-base/40 backdrop-blur-md">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_minmax(0,180px)_56px_44px] items-center gap-3 border-b border-line/60 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-fg-subtle"
        style={{ gridTemplateColumns: hideAlbum ? '28px minmax(0, 1fr) 56px 44px' : '28px minmax(0, 1fr) minmax(0, 180px) 56px 44px' }}
      >
        <span>{numbered ? '#' : ''}</span>
        <span>Название</span>
        {!hideAlbum && <span>Альбом</span>}
        <span className="text-right">Время</span>
        <span></span>
      </div>
      <div>
        {tracks.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-fg-subtle">Здесь пусто</div>
        )}
        {tracks.map((t, i) => (
          <Row
            key={t.uid + ':' + i}
            track={t}
            index={i}
            numbered={numbered}
            hideAlbum={hideAlbum}
            isCurrent={current?.uid === t.uid}
            isPlaying={isPlaying && current?.uid === t.uid}
            onPlay={() => {
              if (current?.uid === t.uid) {
                toggle();
              } else {
                playQueue(tracks, i);
              }
            }}
            rowAction={rowAction}
          />
        ))}
      </div>
    </div>
  );
}

interface RowProps {
  track: Track;
  index: number;
  numbered: boolean;
  hideAlbum: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  rowAction?: { label: string; onClick: (t: Track, index: number) => void };
}

function Row({ track, index, numbered, hideAlbum, isCurrent, isPlaying, onPlay, rowAction }: RowProps) {
  const liked = useLibrary((s) => s.liked.has(track.uid));
  const toggleLiked = useLibrary((s) => s.toggleLiked);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        'group grid items-center gap-3 px-4 py-2 text-sm transition-colors',
        isCurrent ? 'bg-bg-surface' : 'hover:bg-bg-surface/70'
      )}
      style={{
        gridTemplateColumns: hideAlbum ? '28px minmax(0, 1fr) 56px 44px' : '28px minmax(0, 1fr) minmax(0, 180px) 56px 44px'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={onPlay}
    >
      <div className="text-xs tabular-nums text-fg-muted">
        {hovered || isCurrent ? (
          <button
            type="button"
            onClick={onPlay}
            className={cn(
              'inline-flex h-6 w-6 items-center justify-center rounded text-fg',
              isCurrent && 'text-accent'
            )}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
        ) : numbered ? (
          <span className="pl-1">{index + 1}</span>
        ) : (
          <span />
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        {!numbered && (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
            <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <div
            className={cn(
              'truncate text-sm font-medium',
              isCurrent ? 'text-accent' : 'text-fg'
            )}
          >
            {track.title}
          </div>
          <div className="flex items-center gap-1.5 truncate text-xs text-fg-muted">
            <ProviderBadge provider={track.provider} />
            <span className="truncate">{track.artist}</span>
          </div>
        </div>
      </div>

      {!hideAlbum && (
        <div className="truncate text-xs text-fg-muted">{track.album}</div>
      )}

      <div className="text-right text-xs tabular-nums text-fg-muted">
        {formatTime(track.durationMs)}
      </div>

      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => toggleLiked(track.uid)}
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
            liked ? 'opacity-100 text-accent' : 'text-fg-muted hover:text-fg'
          )}
          style={{ opacity: liked ? 1 : undefined }}
          aria-label={liked ? 'Убрать из любимых' : 'В любимые'}
        >
          <HeartIcon size={14} filled={liked} />
        </button>
        {rowAction && (
          <button
            type="button"
            onClick={() => rowAction.onClick(track, index)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-fg-muted hover:text-fg"
            title={rowAction.label}
          >
            <MoreIcon size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ProviderBadge({ provider }: { provider: 'spotify' | 'soundcloud' }) {
  return (
    <span
      className={cn(
        'inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm',
        provider === 'spotify' ? 'text-spotify' : 'text-soundcloud'
      )}
      aria-label={provider}
    >
      {provider === 'spotify' ? <SpotifyIcon size={11} /> : <SoundCloudIcon size={11} />}
    </span>
  );
}

/** Inline "Add to playlist" picker (modal-ish dropdown). */
export function AddToPlaylistButton({ trackUids }: { trackUids: string[] }) {
  const playlists = useLibrary((s) => s.playlists);
  const addToPlaylist = useLibrary((s) => s.addToPlaylist);
  const create = useLibrary((s) => s.createPlaylist);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" className="btn-pill" onClick={() => setOpen((v) => !v)}>
        <PlusIcon size={14} /> Добавить в плейлист
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-line bg-bg-elevated/95 p-2 shadow-elevated backdrop-blur-2xl animate-slide-up">
          <button
            type="button"
            onClick={async () => {
              const p = await create(`Новый плейлист (${new Date().toLocaleDateString()})`);
              await addToPlaylist(p.id, trackUids);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-bg-surface"
          >
            <PlusIcon size={14} /> Создать новый
          </button>
          <div className="my-1 h-px bg-line" />
          <div className="max-h-64 overflow-y-auto">
            {playlists.length === 0 && (
              <div className="px-3 py-2 text-xs text-fg-subtle">Нет плейлистов</div>
            )}
            {playlists.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={async () => {
                  await addToPlaylist(p.id, trackUids);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-bg-surface"
              >
                <span className="truncate">{p.name}</span>
                <span className="text-xs text-fg-subtle">{p.trackUids.length}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
