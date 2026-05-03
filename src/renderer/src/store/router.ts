import { create } from 'zustand';

export type Route =
  | { name: 'home' }
  | { name: 'search'; q?: string }
  | { name: 'library' }
  | { name: 'liked' }
  | { name: 'wave' }
  | { name: 'spotify' }
  | { name: 'soundcloud' }
  | { name: 'playlist'; id: string }
  | { name: 'settings' };

interface RouterState {
  route: Route;
  history: Route[];
  go: (route: Route) => void;
  back: () => void;
}

export const useRouter = create<RouterState>((set, get) => ({
  route: { name: 'home' },
  history: [],
  go: (route) => set((s) => ({ route, history: [...s.history, s.route].slice(-30) })),
  back: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({ route: prev, history: history.slice(0, -1) });
  }
}));
