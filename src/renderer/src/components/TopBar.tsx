import { useRouter } from '../store/router';
import { BackIcon, SearchIcon } from './Icon';

export function TopBar() {
  const route = useRouter((s) => s.route);
  const back = useRouter((s) => s.back);
  const go = useRouter((s) => s.go);
  const history = useRouter((s) => s.history);

  return (
    <div className="drag sticky top-0 z-30 flex items-center gap-3 px-6 py-3 backdrop-blur-xl bg-bg-base/40 border-b border-line/60">
      <button
        type="button"
        onClick={back}
        disabled={history.length === 0}
        className="no-drag inline-flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface text-fg-muted enabled:hover:text-fg enabled:hover:bg-bg-surface-strong disabled:opacity-40 transition-colors"
        aria-label="Назад"
      >
        <BackIcon size={16} />
      </button>

      <div className="no-drag relative w-full max-w-md">
        <button
          type="button"
          onClick={() => go({ name: 'search' })}
          className="group flex w-full items-center gap-2 rounded-full border border-line bg-bg-surface px-4 py-2 text-sm text-fg-muted hover:bg-bg-surface-strong hover:border-line-strong transition-colors"
        >
          <SearchIcon size={16} />
          <span className="text-fg-subtle">Поиск треков, исполнителей, альбомов…</span>
          {route.name === 'search' && route.q && (
            <span className="ml-auto text-fg">«{route.q}»</span>
          )}
        </button>
      </div>

      <div className="ml-auto" />
    </div>
  );
}
