import { create } from 'zustand';
import type { RepeatMode, Track } from '@shared/types';
import { shuffleInPlace } from '../lib/utils';

interface PlayerState {
  current: Track | null;
  /** Upcoming queue (after current). */
  queue: Track[];
  /** Original (pre-shuffle) queue order, kept so we can restore. */
  originalQueue: Track[];
  /** History stack: most recent first. */
  history: Track[];
  /** Position 0..1. */
  position: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;

  playTrack: (track: Track, queue?: Track[]) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (pos: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  enqueue: (tracks: Track[]) => void;
  clearQueue: () => void;
  /** Internal time-tick (driven from PlayerBar simulator). */
  _tick: (delta: number) => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  queue: [],
  originalQueue: [],
  history: [],
  position: 0,
  isPlaying: false,
  shuffle: false,
  repeat: 'off',
  volume: 0.8,
  muted: false,

  playTrack: (track, queue) => {
    const restQueue = queue ? queue.filter((t) => t.uid !== track.uid) : [];
    set((s) => ({
      current: track,
      queue: restQueue,
      originalQueue: queue ?? [track],
      history: s.current ? [s.current, ...s.history].slice(0, 100) : s.history,
      position: 0,
      isPlaying: true
    }));
  },

  playQueue: (tracks, startIndex = 0) => {
    if (!tracks.length) return;
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    const current = tracks[idx];
    const before = tracks.slice(0, idx);
    const after = tracks.slice(idx + 1);
    set((s) => ({
      current,
      queue: [...after],
      originalQueue: [...tracks],
      history: [...before.reverse(), ...(s.current ? [s.current] : []), ...s.history].slice(0, 100),
      position: 0,
      isPlaying: true
    }));
  },

  toggle: () => {
    const { current, isPlaying } = get();
    if (!current) return;
    set({ isPlaying: !isPlaying });
  },

  next: () => {
    const { queue, current, history, repeat } = get();
    if (repeat === 'one' && current) {
      set({ position: 0, isPlaying: true });
      return;
    }
    if (queue.length === 0) {
      if (repeat === 'all' && get().originalQueue.length > 0) {
        const all = [...get().originalQueue];
        set({
          current: all[0],
          queue: all.slice(1),
          history: current ? [current, ...history].slice(0, 100) : history,
          position: 0,
          isPlaying: true
        });
        return;
      }
      set({ isPlaying: false, position: 1 });
      return;
    }
    const [nextTrack, ...rest] = queue;
    set({
      current: nextTrack,
      queue: rest,
      history: current ? [current, ...history].slice(0, 100) : history,
      position: 0,
      isPlaying: true
    });
  },

  prev: () => {
    const { history, current, queue, position } = get();
    if (position > 0.05 && current) {
      set({ position: 0 });
      return;
    }
    if (history.length === 0) {
      set({ position: 0 });
      return;
    }
    const [prevTrack, ...rest] = history;
    set({
      current: prevTrack,
      queue: current ? [current, ...queue] : queue,
      history: rest,
      position: 0,
      isPlaying: true
    });
  },

  seek: (pos) => set({ position: Math.max(0, Math.min(1, pos)) }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)), muted: false }),

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, current } = get();
    if (shuffle) {
      // Restore original order
      if (current) {
        const idx = originalQueue.findIndex((t) => t.uid === current.uid);
        const after = idx >= 0 ? originalQueue.slice(idx + 1) : originalQueue;
        set({ shuffle: false, queue: after });
      } else {
        set({ shuffle: false, queue: [...originalQueue] });
      }
    } else {
      const next = shuffleInPlace([...queue]);
      set({ shuffle: true, queue: next });
    }
  },

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off'
    })),

  enqueue: (tracks) => set((s) => ({ queue: [...s.queue, ...tracks] })),

  clearQueue: () => set({ queue: [], originalQueue: [] }),

  _tick: (delta) => {
    const { isPlaying, current, position } = get();
    if (!isPlaying || !current) return;
    const dur = current.durationMs;
    if (dur <= 0) return;
    const next = position + delta / dur;
    if (next >= 1) {
      get().next();
      return;
    }
    set({ position: next });
  }
}));
