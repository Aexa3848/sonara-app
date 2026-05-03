import { useMemo } from 'react';
import { MOCK_TRACKS } from '../lib/mock-data';
import { Section } from '../components/Section';
import { TrackCard } from '../components/TrackCard';
import { usePlayer } from '../store/player';
import { useRouter } from '../store/router';
import { useLibrary } from '../store/library';
import { PlayIcon, SoundCloudIcon, SpotifyIcon } from '../components/Icon';
import { cn, formatTime } from '../lib/utils';

export function HomeView() {
  const playQueue = usePlayer((s) => s.playQueue);
  const go = useRouter((s) => s.go);
  const isLiked = useLibrary((s) => s.isLiked);

  const featured = useMemo(() => MOCK_TRACKS[1], []);
  const newReleases = useMemo(() => MOCK_TRACKS.slice(0, 8), []);
  const fromSoundcloud = useMemo(
    () => MOCK_TRACKS.filter((t) => t.provider === 'soundcloud').slice(0, 6),
    []
  );
  const fromSpotify = useMemo(
    () => MOCK_TRACKS.filter((t) => t.provider === 'spotify').slice(0, 6),
    []
  );

  return (
    <div className="space-y-12 px-8 pb-12 pt-2">
      <Hero
        track={featured}
        onPlay={() => playQueue(MOCK_TRACKS, 1)}
        onMore={() => go({ name: 'wave' })}
      />

      <Section
        title="Новинки"
        description="Свежий микс из обоих сервисов — нажмите, чтобы запустить волну"
        action={
          <button
            type="button"
            className="btn-pill"
            onClick={() => playQueue(MOCK_TRACKS, 0)}
          >
            <PlayIcon size={14} /> Слушать всё
          </button>
        }
      >
        <Grid>
          {newReleases.map((t) => (
            <TrackCard key={t.uid} track={t} context={MOCK_TRACKS} />
          ))}
        </Grid>
      </Section>

      <Section
        title="С Spotify"
        description="Треки из вашей будущей подключённой Spotify-библиотеки"
        action={
          <button type="button" className="btn-pill" onClick={() => go({ name: 'spotify' })}>
            <SpotifyIcon size={14} className="text-spotify" /> Открыть Spotify
          </button>
        }
      >
        <Grid>
          {fromSpotify.map((t) => (
            <TrackCard key={t.uid} track={t} context={fromSpotify} />
          ))}
        </Grid>
      </Section>

      <Section
        title="С SoundCloud"
        description="Лайвы, демо и редкие треки из андеграунда"
        action={
          <button type="button" className="btn-pill" onClick={() => go({ name: 'soundcloud' })}>
            <SoundCloudIcon size={14} className="text-soundcloud" /> Открыть SoundCloud
          </button>
        }
      >
        <Grid>
          {fromSoundcloud.map((t) => (
            <TrackCard key={t.uid} track={t} context={fromSoundcloud} />
          ))}
        </Grid>
      </Section>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3 animate-fade-in">
      {children}
    </div>
  );
}

interface HeroProps {
  track: { title: string; artist: string; album?: string; durationMs: number; coverUrl?: string; accent?: string; provider: 'spotify' | 'soundcloud' };
  onPlay: () => void;
  onMore: () => void;
}

function Hero({ track, onPlay, onMore }: HeroProps) {
  const accent = track.accent ?? '#5E6AD2';
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated/60 p-8 shadow-elevated"
      style={{
        backgroundImage: `linear-gradient(120deg, ${accent}25 0%, transparent 60%), radial-gradient(circle at 90% 20%, ${accent}30 0%, transparent 50%)`
      }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-10">
        <div className="relative aspect-square w-44 shrink-0 overflow-hidden rounded-xl shadow-glow md:w-56">
          <img src={track.coverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-overline mb-2">
            {track.provider === 'spotify' ? '✦ Spotify' : '✦ SoundCloud'} · сейчас на главной
          </div>
          <h1 className="text-display gradient-text leading-none">{track.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
            <span className="font-medium text-fg">{track.artist}</span>
            <span>•</span>
            <span>{track.album}</span>
            <span>•</span>
            <span>{formatTime(track.durationMs)}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-accent" onClick={onPlay}>
              <PlayIcon size={14} /> Слушать
            </button>
            <button type="button" className="btn-pill" onClick={onMore}>
              Открыть «Мою волну»
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny helper used elsewhere — kept here to avoid circular imports. */
export function HoverPlay({ active = false }: { active?: boolean }) {
  return (
    <div
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-gradient text-white shadow-glow transition-transform duration-200',
        active ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
      )}
    >
      <PlayIcon size={14} />
    </div>
  );
}
