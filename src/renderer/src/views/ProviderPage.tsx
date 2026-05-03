import { MOCK_TRACKS } from '../lib/mock-data';
import { TrackCard } from '../components/TrackCard';
import { Section } from '../components/Section';
import { SoundCloudIcon, SpotifyIcon } from '../components/Icon';
import { api } from '../lib/sonara-api';
import type { Provider } from '@shared/types';

interface Props {
  provider: Provider;
}

export function ProviderPage({ provider }: Props) {
  const tracks = MOCK_TRACKS.filter((t) => t.provider === provider);
  const isSpotify = provider === 'spotify';

  return (
    <div className="px-8 pb-12 pt-4">
      <header
        className="mb-8 overflow-hidden rounded-2xl border border-line p-8"
        style={{
          backgroundImage: isSpotify
            ? 'linear-gradient(120deg, rgba(29, 185, 84, 0.18) 0%, transparent 60%)'
            : 'linear-gradient(120deg, rgba(255, 85, 0, 0.18) 0%, transparent 60%)'
        }}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl shadow-elevated"
            style={{
              background: isSpotify
                ? 'linear-gradient(135deg, #1DB954 0%, #0d6b2f 100%)'
                : 'linear-gradient(135deg, #FF5500 0%, #cc4400 100%)'
            }}
          >
            {isSpotify ? <SpotifyIcon size={44} className="text-white" /> : <SoundCloudIcon size={44} className="text-white" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="label-overline mb-2">Подключение</div>
            <h1 className="text-h1 gradient-text">{isSpotify ? 'Spotify' : 'SoundCloud'}</h1>
            <p className="mt-2 max-w-2xl text-sm text-fg-muted">
              {isSpotify
                ? 'Подключите свой Spotify-аккаунт, чтобы Sonara показывал вашу библиотеку, рекомендации и проигрывал треки через Web Playback SDK (требуется Premium).'
                : 'SoundCloud работает через embed-плеер и публичный API. Авторизация не требуется — поиск, лайвы и демо доступны сразу.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isSpotify ? (
                <>
                  <button
                    type="button"
                    className="btn-accent"
                    onClick={() =>
                      api.shell.open('https://developer.spotify.com/dashboard')
                    }
                  >
                    Подключить Spotify
                  </button>
                  <span className="rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-subtle">
                    OAuth · PKCE · скоро
                  </span>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-accent"
                    onClick={() => api.shell.open('https://soundcloud.com/discover')}
                  >
                    Открыть SoundCloud Discover
                  </button>
                  <span className="rounded-full border border-line px-3 py-1.5 text-[11px] uppercase tracking-wider text-fg-subtle">
                    Без авторизации
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <Section title={isSpotify ? 'Превью Spotify-каталога' : 'Превью SoundCloud-каталога'} description="Сейчас показываются демо-треки. После подключения здесь появятся ваши плейлисты, история и рекомендации.">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-3">
          {tracks.map((t) => (
            <TrackCard key={t.uid} track={t} context={tracks} />
          ))}
        </div>
      </Section>

      <Section title="Что дальше" description="Что Sonara будет уметь после подключения этого сервиса">
        <ul className="grid gap-3 md:grid-cols-2">
          {(isSpotify ? SPOTIFY_FEATURES : SOUNDCLOUD_FEATURES).map((f, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-line bg-bg-surface/40 p-4">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-[11px] font-bold text-white">
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-medium">{f.title}</div>
                <div className="text-xs text-fg-muted">{f.body}</div>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

const SPOTIFY_FEATURES = [
  { title: 'Логин через PKCE', body: 'Никаких client secret-ов в desktop-приложении. Безопасно по умолчанию.' },
  { title: 'Web Playback SDK', body: 'Полное проигрывание треков (для Premium-подписки).' },
  { title: 'Импорт лайков и плейлистов', body: 'Все ваши Spotify-данные появятся в единой библиотеке Sonara.' },
  { title: 'Микс с SoundCloud', body: 'Кладите Spotify-треки в один плейлист рядом с SoundCloud-треками.' }
];

const SOUNDCLOUD_FEATURES = [
  { title: 'Поиск без аккаунта', body: 'Используем публичный API + embed-плеер от SoundCloud.' },
  { title: 'Длинные миксы и DJ-сеты', body: 'То, чего нет на Spotify, легко находится на SoundCloud.' },
  { title: 'Демо и независимые артисты', body: 'Большой пласт андеграундной музыки, недоступной на стримингах.' },
  { title: 'Объединение с Spotify', body: 'В Sonara они живут в одной библиотеке, поиске и плейлистах.' }
];
