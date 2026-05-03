import { useMemo, useState } from 'react';
import { useLibrary } from '../store/library';
import { useRouter } from '../store/router';
import { tracksByUids } from '../lib/mock-data';
import { TrackList } from '../components/TrackList';
import { usePlayer } from '../store/player';
import { PlayIcon, ShuffleIcon, MoreIcon } from '../components/Icon';
import { formatTotal } from '../lib/utils';

export function PlaylistView({ id }: { id: string }) {
  const playlist = useLibrary((s) => s.playlists.find((p) => p.id === id));
  const removeFromPlaylist = useLibrary((s) => s.removeFromPlaylist);
  const renamePlaylist = useLibrary((s) => s.renamePlaylist);
  const deletePlaylist = useLibrary((s) => s.deletePlaylist);
  const playQueue = usePlayer((s) => s.playQueue);
  const go = useRouter((s) => s.go);

  const tracks = useMemo(() => tracksByUids(playlist?.trackUids ?? []), [playlist?.trackUids]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(playlist?.name ?? '');
  const [desc, setDesc] = useState(playlist?.description ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  if (!playlist) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-fg-muted">
        Плейлист не найден
      </div>
    );
  }

  const total = tracks.reduce((acc, t) => acc + t.durationMs, 0);
  const accent = tracks[0]?.accent ?? '#5E6AD2';

  const submitRename = async () => {
    if (!name.trim()) {
      setName(playlist.name);
      setEditing(false);
      return;
    }
    await renamePlaylist(playlist.id, name.trim(), desc.trim() || undefined);
    setEditing(false);
  };

  return (
    <div className="px-8 pb-12 pt-4">
      <header
        className="mb-8 overflow-hidden rounded-2xl border border-line p-8"
        style={{
          backgroundImage: `linear-gradient(120deg, ${accent}25 0%, transparent 60%)`
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
          <PlaylistCover tracks={tracks} accent={accent} />
          <div className="min-w-0 flex-1">
            <div className="label-overline mb-2">Плейлист</div>
            {editing ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                  className="w-full rounded-lg bg-bg-surface px-3 py-2 text-3xl font-semibold text-fg outline-none ring-1 ring-line focus:ring-accent/40"
                />
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Описание (необязательно)"
                  className="w-full resize-none rounded-lg bg-bg-surface px-3 py-2 text-sm text-fg outline-none ring-1 ring-line focus:ring-accent/40 placeholder:text-fg-subtle"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button type="button" className="btn-accent" onClick={submitRename}>
                    Сохранить
                  </button>
                  <button type="button" className="btn-pill" onClick={() => setEditing(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1
                  className="text-display gradient-text leading-none cursor-pointer"
                  onClick={() => setEditing(true)}
                  title="Нажмите, чтобы переименовать"
                >
                  {playlist.name}
                </h1>
                {playlist.description && (
                  <p className="mt-2 max-w-2xl text-sm text-fg-muted">{playlist.description}</p>
                )}
                <p className="mt-3 text-sm text-fg-muted">
                  {tracks.length === 0 ? 'Пусто' : `${tracks.length} треков · ${formatTotal(total)}`}
                  {' · '}
                  <ProviderMix tracks={tracks} />
                </p>
              </>
            )}
            {!editing && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn-accent"
                  disabled={tracks.length === 0}
                  onClick={() => playQueue(tracks)}
                >
                  <PlayIcon size={14} /> Слушать
                </button>
                <button
                  type="button"
                  className="btn-pill"
                  disabled={tracks.length === 0}
                  onClick={() => playQueue([...tracks].sort(() => Math.random() - 0.5))}
                >
                  <ShuffleIcon size={14} /> Перемешать
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className="btn-ghost h-9 w-9"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Действия"
                  >
                    <MoreIcon size={18} />
                  </button>
                  {menuOpen && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-line bg-bg-elevated/95 p-1 shadow-elevated backdrop-blur-2xl animate-slide-up">
                      <button
                        type="button"
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm hover:bg-bg-surface"
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                      >
                        Переименовать
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        onClick={async () => {
                          await deletePlaylist(playlist.id);
                          setMenuOpen(false);
                          go({ name: 'home' });
                        }}
                      >
                        Удалить плейлист
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <TrackList
        tracks={tracks}
        numbered
        rowAction={{
          label: 'Убрать из плейлиста',
          onClick: (t) => removeFromPlaylist(playlist.id, t.uid)
        }}
      />
    </div>
  );
}

function PlaylistCover({ tracks, accent }: { tracks: typeof import('../lib/mock-data').MOCK_TRACKS; accent: string }) {
  const covers = tracks.slice(0, 4).map((t) => t.coverUrl).filter(Boolean) as string[];
  if (covers.length === 0) {
    return (
      <div
        className="relative h-44 w-44 shrink-0 overflow-hidden rounded-xl shadow-elevated md:h-56 md:w-56"
        style={{ background: `linear-gradient(135deg, ${accent} 0%, #1E1B4B 100%)` }}
      />
    );
  }
  if (covers.length === 1) {
    return (
      <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-xl shadow-elevated md:h-56 md:w-56">
        <img src={covers[0]} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="relative grid h-44 w-44 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-xl shadow-elevated md:h-56 md:w-56">
      {covers.slice(0, 4).map((c, i) => (
        <img key={i} src={c} alt="" className="h-full w-full object-cover" />
      ))}
    </div>
  );
}

function ProviderMix({ tracks }: { tracks: typeof import('../lib/mock-data').MOCK_TRACKS }) {
  const sp = tracks.filter((t) => t.provider === 'spotify').length;
  const sc = tracks.filter((t) => t.provider === 'soundcloud').length;
  if (sp === 0 && sc === 0) return null;
  return (
    <span className="text-fg-subtle">
      {sp > 0 && <span className="text-spotify">Spotify {sp}</span>}
      {sp > 0 && sc > 0 && ' + '}
      {sc > 0 && <span className="text-soundcloud">SoundCloud {sc}</span>}
    </span>
  );
}
