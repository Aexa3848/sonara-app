import { useEffect } from 'react';
import { useLibrary } from './store/library';
import { useRouter } from './store/router';
import { usePlayer } from './store/player';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PlayerBar } from './components/PlayerBar';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { HomeView } from './views/Home';
import { SearchView } from './views/Search';
import { LibraryView } from './views/Library';
import { LikedView } from './views/Liked';
import { WaveView } from './views/Wave';
import { ProviderPage } from './views/ProviderPage';
import { PlaylistView } from './views/Playlist';
import { SettingsView } from './views/Settings';

export default function App() {
  const hydrate = useLibrary((s) => s.hydrate);
  const ready = useLibrary((s) => s.ready);
  const route = useRouter((s) => s.route);
  const current = usePlayer((s) => s.current);
  const pushHistory = useLibrary((s) => s.pushHistory);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (current) pushHistory(current.uid);
  }, [current?.uid, pushHistory, current]);

  if (!ready) return <SplashScreen />;

  return (
    <div className="relative flex h-full w-full">
      <AmbientBackdrop />
      <Sidebar />
      <main className="relative z-10 flex h-full min-w-0 flex-1 flex-col">
        <TopBar />
        <div className="relative flex-1 overflow-y-auto" key={routeKey(route)}>
          <div className="animate-fade-in">{renderRoute(route)}</div>
        </div>
        <PlayerBar />
      </main>
    </div>
  );
}

function renderRoute(route: ReturnType<typeof useRouter.getState>['route']) {
  switch (route.name) {
    case 'home':
      return <HomeView />;
    case 'search':
      return <SearchView />;
    case 'library':
      return <LibraryView />;
    case 'liked':
      return <LikedView />;
    case 'wave':
      return <WaveView />;
    case 'spotify':
      return <ProviderPage provider="spotify" />;
    case 'soundcloud':
      return <ProviderPage provider="soundcloud" />;
    case 'playlist':
      return <PlaylistView id={route.id} />;
    case 'settings':
      return <SettingsView />;
  }
}

function routeKey(route: ReturnType<typeof useRouter.getState>['route']): string {
  if (route.name === 'playlist') return `playlist:${route.id}`;
  if (route.name === 'search') return `search:${route.q ?? ''}`;
  return route.name;
}

function SplashScreen() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-page-gradient">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gradient shadow-glow">
          <span className="text-3xl font-bold text-white">S</span>
        </div>
        <div className="text-h3 gradient-text">Sonara</div>
        <div className="text-xs uppercase tracking-[0.2em] text-fg-subtle">Загрузка библиотеки…</div>
      </div>
    </div>
  );
}
