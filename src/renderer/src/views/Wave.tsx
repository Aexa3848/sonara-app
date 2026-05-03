import { useEffect, useMemo, useState } from 'react';
import { MOCK_TRACKS } from '../lib/mock-data';
import { TrackList } from '../components/TrackList';
import { usePlayer } from '../store/player';
import { useLibrary } from '../store/library';
import { PlayIcon, ShuffleIcon, WaveIcon } from '../components/Icon';
import { shuffleInPlace } from '../lib/utils';

type Mood = 'focus' | 'energy' | 'chill' | 'late-night';

const MOODS: { id: Mood; title: string; description: string; gradient: string }[] = [
  {
    id: 'focus',
    title: 'Фокус',
    description: 'Тёплые, неотвлекающие',
    gradient: 'linear-gradient(135deg, #5E6AD2 0%, #06B6D4 100%)'
  },
  {
    id: 'energy',
    title: 'Энергия',
    description: 'Громче, быстрее, ярче',
    gradient: 'linear-gradient(135deg, #FF3D71 0%, #F59E0B 100%)'
  },
  {
    id: 'chill',
    title: 'Расслабление',
    description: 'Мягко и медленно',
    gradient: 'linear-gradient(135deg, #22C55E 0%, #06B6D4 100%)'
  },
  {
    id: 'late-night',
    title: 'Поздняя ночь',
    description: 'Глубокие текстуры',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #FF3D71 100%)'
  }
];

export function WaveView() {
  const liked = useLibrary((s) => s.liked);
  const history = useLibrary((s) => s.history);
  const playQueue = usePlayer((s) => s.playQueue);

  const [mood, setMood] = useState<Mood>('focus');
  const [seed, setSeed] = useState(0);

  const wave = useMemo(() => generateWave(mood, liked, history, seed), [mood, liked, history, seed]);

  // Re-seed wave when mood changes for new variety.
  useEffect(() => {
    setSeed(Date.now());
  }, [mood]);

  const moodMeta = MOODS.find((m) => m.id === mood)!;

  return (
    <div className="px-8 pb-12 pt-4">
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
        <div
          className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-glow md:h-56 md:w-56"
          style={{ background: moodMeta.gradient }}
        >
          <WaveIcon size={72} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="label-overline mb-2">Подбор Sonara</div>
          <h1 className="text-display gradient-text leading-none">Моя волна</h1>
          <p className="mt-3 max-w-xl text-sm text-fg-muted">
            Бесконечный микс на основе ваших любимых треков и истории — со Spotify и SoundCloud вперемешку.
            Выберите настроение, чтобы Sonara подобрал нужный темп.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" className="btn-accent" onClick={() => playQueue(wave)}>
              <PlayIcon size={14} /> Запустить
            </button>
            <button type="button" className="btn-pill" onClick={() => setSeed(Date.now())}>
              <ShuffleIcon size={14} /> Перемешать
            </button>
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {MOODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMood(m.id)}
            className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ease-soft ${
              m.id === mood ? 'border-fg/40 ring-1 ring-fg/20' : 'border-line hover:border-line-strong'
            }`}
            style={{ backgroundImage: m.gradient }}
          >
            <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:opacity-30" />
            <div className="relative">
              <div className="text-base font-semibold text-white">{m.title}</div>
              <div className="text-xs text-white/70">{m.description}</div>
            </div>
          </button>
        ))}
      </div>

      <TrackList tracks={wave} numbered />
    </div>
  );
}

function generateWave(mood: Mood, liked: Set<string>, history: string[], seed: number): typeof MOCK_TRACKS {
  // Simple mood -> duration biasing & shuffle for mock data.
  const pool = [...MOCK_TRACKS];
  // Surface liked first, then unliked.
  pool.sort((a, b) => {
    const al = liked.has(a.uid) ? 1 : 0;
    const bl = liked.has(b.uid) ? 1 : 0;
    return bl - al;
  });

  // Penalize most recent history so the wave doesn't repeat what just played.
  const recent = new Set(history.slice(-10));
  const penalized = pool.filter((t) => !recent.has(t.uid)).concat(pool.filter((t) => recent.has(t.uid)));

  // Mood biases.
  const moodFiltered = penalized.filter((t) => {
    if (mood === 'energy') return t.durationMs < 250_000;
    if (mood === 'chill') return t.durationMs > 200_000;
    if (mood === 'late-night') return t.provider === 'soundcloud' || t.durationMs > 220_000;
    return true; // focus = all
  });

  const arr = moodFiltered.length >= 8 ? moodFiltered : penalized;
  // Deterministic-ish shuffle from seed.
  const out = [...arr];
  const rng = mulberry32(seed || 1);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, 18);
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hint to silence unused import warning in some bundlers.
void shuffleInPlace;
