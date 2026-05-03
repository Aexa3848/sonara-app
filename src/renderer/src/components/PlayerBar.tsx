import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlayer } from '../store/player';
import { useLibrary } from '../store/library';
import { cn, formatTime } from '../lib/utils';
import {
  HeartIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
  SpotifyIcon,
  SoundCloudIcon,
  VolumeIcon
} from './Icon';

export function PlayerBar() {
  const {
    current,
    isPlaying,
    position,
    queue,
    history,
    shuffle,
    repeat,
    volume,
    muted,
    toggle,
    next,
    prev,
    seek,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    toggleMute,
    _tick
  } = usePlayer();

  const { isLiked, toggleLiked } = useLibrary((s) => ({
    isLiked: s.isLiked,
    toggleLiked: s.toggleLiked
  }));

  const liked = current ? isLiked(current.uid) : false;
  const [scrubbing, setScrubbing] = useState<number | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);

  // Drive playhead with rAF.
  const lastRef = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    const loop = (t: number) => {
      if (lastRef.current != null) {
        const delta = t - lastRef.current;
        _tick(delta);
      }
      lastRef.current = t;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lastRef.current = null;
    };
  }, [_tick]);

  const dur = current?.durationMs ?? 0;
  const shownPos = scrubbing ?? position;
  const elapsed = formatTime(shownPos * dur);
  const remaining = formatTime(dur);

  const accent = current?.accent ?? '#5E6AD2';

  return (
    <>
      <div
        className="relative z-30 flex items-center gap-4 border-t border-line bg-bg-base/85 px-6 py-3 backdrop-blur-2xl"
        style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
      >
        {/* Track info */}
        <div className="flex w-72 min-w-0 items-center gap-3">
          {current ? (
            <>
              <div
                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-elevated"
                style={{ background: accent }}
              >
                <img
                  src={current.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <ProviderTag provider={current.provider} corner />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-medium text-fg">{current.title}</div>
                <div className="truncate text-xs text-fg-muted">{current.artist}</div>
              </div>
              <button
                type="button"
                onClick={() => toggleLiked(current.uid)}
                className={cn(
                  'ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  liked ? 'text-accent' : 'text-fg-muted hover:text-fg'
                )}
                aria-label="Любимые"
              >
                <HeartIcon size={18} filled={liked} />
              </button>
            </>
          ) : (
            <div className="text-xs text-fg-subtle">Ничего не играет</div>
          )}
        </div>

        {/* Controls + scrubber */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                shuffle ? 'text-accent' : 'text-fg-muted hover:text-fg'
              )}
              aria-label="Перемешать"
            >
              <ShuffleIcon size={16} />
            </button>
            <button
              type="button"
              onClick={prev}
              disabled={!current && history.length === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted enabled:hover:text-fg disabled:opacity-40 transition-colors"
              aria-label="Предыдущий"
            >
              <PrevIcon size={18} />
            </button>
            <button
              type="button"
              onClick={toggle}
              disabled={!current}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-fg text-bg-deep shadow-glow disabled:opacity-40 hover:scale-[1.04] active:scale-[0.97] transition-transform"
              aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
            >
              {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!current}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg-muted enabled:hover:text-fg disabled:opacity-40 transition-colors"
              aria-label="Следующий"
            >
              <NextIcon size={18} />
            </button>
            <button
              type="button"
              onClick={cycleRepeat}
              className={cn(
                'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                repeat !== 'off' ? 'text-accent' : 'text-fg-muted hover:text-fg'
              )}
              aria-label={`Повтор: ${repeat}`}
            >
              <RepeatIcon size={16} mode={repeat} />
            </button>
          </div>

          <div className="flex w-full items-center gap-3">
            <span className="w-10 text-right text-[11px] tabular-nums text-fg-muted">
              {elapsed}
            </span>
            <Scrubber
              value={shownPos}
              accent={accent}
              onScrub={(v) => setScrubbing(v)}
              onCommit={(v) => {
                setScrubbing(null);
                seek(v);
              }}
            />
            <span className="w-10 text-left text-[11px] tabular-nums text-fg-muted">
              {remaining}
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex w-72 min-w-0 items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setQueueOpen((v) => !v)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors',
              queueOpen ? 'text-accent bg-accent/10' : 'text-fg-muted hover:text-fg'
            )}
            aria-label="Очередь"
          >
            <QueueIcon size={16} />
          </button>
          <VolumeControl volume={volume} muted={muted} setVolume={setVolume} toggleMute={toggleMute} />
        </div>
      </div>
      {queueOpen && <QueueDrawer onClose={() => setQueueOpen(false)} />}
    </>
  );
}

function Scrubber({
  value,
  accent,
  onScrub,
  onCommit
}: {
  value: number;
  accent: string;
  onScrub: (v: number) => void;
  onCommit: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const calc = (clientX: number) => {
    const el = ref.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  return (
    <div
      ref={ref}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={value}
      tabIndex={0}
      className="group relative h-4 flex-1 cursor-pointer touch-none select-none"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture(e.pointerId);
        setDragging(true);
        const v = calc(e.clientX);
        onScrub(v);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        const v = calc(e.clientX);
        onScrub(v);
      }}
      onPointerUp={(e) => {
        if (!dragging) return;
        setDragging(false);
        const v = calc(e.clientX);
        onCommit(v);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onCommit(Math.min(1, value + 0.02));
        if (e.key === 'ArrowLeft') onCommit(Math.max(0, value - 0.02));
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-bg-surface-strong" />
      <div
        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
        style={{
          width: `${value * 100}%`,
          background: `linear-gradient(90deg, ${accent}, #fff)`
        }}
      />
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg opacity-0 shadow-elevated transition-opacity group-hover:opacity-100"
        style={{ left: `${value * 100}%`, opacity: dragging ? 1 : undefined }}
      />
    </div>
  );
}

function VolumeControl({
  volume,
  muted,
  setVolume,
  toggleMute
}: {
  volume: number;
  muted: boolean;
  setVolume: (v: number) => void;
  toggleMute: () => void;
}) {
  const effective = muted ? 0 : volume;
  const level: 'mute' | 'low' | 'high' = effective === 0 ? 'mute' : effective < 0.5 ? 'low' : 'high';
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleMute}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:text-fg transition-colors"
        aria-label="Звук"
      >
        <VolumeIcon size={16} level={level} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={effective}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="sonara-range w-24 accent-fg"
        aria-label="Громкость"
      />
    </div>
  );
}

function ProviderTag({ provider, corner = false }: { provider: 'spotify' | 'soundcloud'; corner?: boolean }) {
  const cls = corner ? 'absolute right-1 bottom-1' : 'inline-flex';
  return (
    <span
      className={cn(
        'inline-flex h-4 w-4 items-center justify-center rounded-sm bg-black/55 text-white backdrop-blur',
        cls
      )}
      title={provider === 'spotify' ? 'Spotify' : 'SoundCloud'}
    >
      {provider === 'spotify' ? (
        <SpotifyIcon size={10} className="text-spotify" />
      ) : (
        <SoundCloudIcon size={10} className="text-soundcloud" />
      )}
    </span>
  );
}

function QueueDrawer({ onClose }: { onClose: () => void }) {
  const queue = usePlayer((s) => s.queue);
  const current = usePlayer((s) => s.current);
  const history = usePlayer((s) => s.history);

  const items = useMemo(() => {
    return [
      ...history.slice(0, 5).map((t) => ({ t, kind: 'history' as const })).reverse(),
      ...(current ? [{ t: current, kind: 'current' as const }] : []),
      ...queue.map((t) => ({ t, kind: 'next' as const }))
    ];
  }, [queue, current, history]);

  return (
    <div className="absolute right-4 bottom-[88px] z-40 w-96 max-h-[60vh] overflow-hidden rounded-xl border border-line bg-bg-elevated/95 shadow-elevated backdrop-blur-2xl animate-slide-up">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="text-sm font-semibold">Очередь</div>
        <button type="button" onClick={onClose} className="text-xs text-fg-muted hover:text-fg">
          Закрыть
        </button>
      </div>
      <div className="max-h-[calc(60vh-44px)] overflow-y-auto py-1">
        {items.length === 0 && <div className="px-4 py-6 text-center text-xs text-fg-subtle">Пусто</div>}
        {items.map(({ t, kind }, idx) => (
          <div
            key={`${kind}-${idx}-${t.uid}`}
            className={cn(
              'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
              kind === 'current' && 'bg-bg-surface',
              kind === 'history' && 'opacity-50'
            )}
          >
            <img src={t.coverUrl} alt="" className="h-9 w-9 rounded" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-fg">{t.title}</div>
              <div className="truncate text-xs text-fg-muted">{t.artist}</div>
            </div>
            <span className="text-[11px] uppercase tracking-wider text-fg-subtle">
              {kind === 'history' ? 'было' : kind === 'current' ? 'сейчас' : 'далее'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
