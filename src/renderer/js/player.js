import { store } from './state.js';
import { trackUrl, fmtDuration, shuffleInPlace, chooseWeighted, toast } from './ui.js';

class Player extends EventTarget {
  constructor(audio) {
    super();
    this.audio = audio;
    this.queue = [];
    this.queueIndex = -1;
    this.shuffle = false;
    this.repeat = 'off'; // off | one | all
    this.waveMode = false;

    this.audio.addEventListener('timeupdate', () => this.dispatchEvent(new Event('time')));
    this.audio.addEventListener('loadedmetadata', () => this.dispatchEvent(new Event('time')));
    this.audio.addEventListener('play', () => this.dispatchEvent(new Event('state')));
    this.audio.addEventListener('pause', () => this.dispatchEvent(new Event('state')));
    this.audio.addEventListener('ended', () => this.handleEnded());
    this.audio.addEventListener('error', () => this.handleError());
  }

  get current() {
    if (this.queueIndex < 0 || this.queueIndex >= this.queue.length) return null;
    return store.getTrackById(this.queue[this.queueIndex]) || null;
  }

  get isPlaying() { return !this.audio.paused && !this.audio.ended && this.audio.src; }

  setVolume(v) {
    const clamped = Math.max(0, Math.min(1, v));
    this.audio.volume = clamped;
    store.updateSettings({ volume: clamped });
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.shuffle && this.queueIndex >= 0) {
      const cur = this.queue[this.queueIndex];
      const rest = this.queue.filter((_, i) => i !== this.queueIndex);
      shuffleInPlace(rest);
      this.queue = [cur, ...rest];
      this.queueIndex = 0;
    }
    this.dispatchEvent(new Event('queue'));
  }

  cycleRepeat() {
    this.repeat = this.repeat === 'off' ? 'all' : this.repeat === 'all' ? 'one' : 'off';
    this.dispatchEvent(new Event('queue'));
  }

  playQueue(trackIds, startIndex = 0, options = {}) {
    if (!trackIds || trackIds.length === 0) return;
    this.waveMode = !!options.wave;
    this.queue = trackIds.slice();
    if (this.shuffle && !this.waveMode) {
      const head = this.queue.splice(startIndex, 1)[0];
      shuffleInPlace(this.queue);
      this.queue = [head, ...this.queue];
      this.queueIndex = 0;
    } else {
      this.queueIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
    }
    this.loadCurrent(true);
    this.dispatchEvent(new Event('queue'));
  }

  enqueueNext(trackIds) {
    if (this.queueIndex < 0) return this.playQueue(trackIds, 0);
    this.queue.splice(this.queueIndex + 1, 0, ...trackIds);
    this.dispatchEvent(new Event('queue'));
  }

  loadCurrent(autoplay) {
    const track = this.current;
    if (!track) {
      this.audio.removeAttribute('src');
      this.audio.load();
      this.dispatchEvent(new Event('state'));
      return;
    }
    this.audio.src = trackUrl(track);
    this.audio.load();
    if (autoplay) {
      this.audio.play().catch((err) => {
        console.error('play error', err);
        toast('Не удалось воспроизвести: ' + (err.message || err));
      });
    }
    store.pushHistory(track.id);
    this.dispatchEvent(new Event('track'));
  }

  toggle() {
    if (!this.current) return;
    if (this.audio.paused) this.audio.play().catch(() => {});
    else this.audio.pause();
  }

  next(manual = true) {
    if (this.queueIndex < 0) return;
    if (this.repeat === 'one' && !manual) {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
      return;
    }
    if (this.waveMode) {
      this.appendWaveTrack();
    }
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex += 1;
      this.loadCurrent(true);
    } else if (this.repeat === 'all') {
      this.queueIndex = 0;
      this.loadCurrent(true);
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.dispatchEvent(new Event('queue'));
  }

  prev() {
    if (this.queueIndex < 0) return;
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    if (this.queueIndex > 0) {
      this.queueIndex -= 1;
      this.loadCurrent(true);
    } else {
      this.audio.currentTime = 0;
    }
    this.dispatchEvent(new Event('queue'));
  }

  seek(ratio) {
    if (!this.audio.duration) return;
    this.audio.currentTime = ratio * this.audio.duration;
  }

  handleEnded() {
    this.next(false);
  }

  handleError() {
    const track = this.current;
    if (track) {
      toast(`Не удалось воспроизвести «${track.title}»`);
    }
    setTimeout(() => this.next(false), 400);
  }

  // --- My Wave ---
  startWave() {
    const seed = pickWaveSeed();
    if (!seed) {
      toast('Сначала добавьте папки с музыкой');
      return;
    }
    const followups = pickWaveTracks(8, [seed.id]);
    const ids = [seed.id, ...followups.map((t) => t.id)];
    this.playQueue(ids, 0, { wave: true });
  }

  appendWaveTrack() {
    const used = this.queue.slice();
    const tail = pickWaveTracks(3, used).map((t) => t.id);
    this.queue.push(...tail);
  }
}

function pickWaveSeed() {
  const all = store.tracks;
  if (!all.length) return null;
  const liked = all.filter((t) => store.likes.has(t.id));
  const recent = store.history.slice(-50).map((h) => h.id);
  const scored = all.map((t) => ({
    track: t,
    score:
      (liked.includes(t) ? 6 : 0) +
      (recent.includes(t.id) ? 1 : 0) +
      Math.random() * 2,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].track;
}

function pickWaveTracks(count, exclude) {
  const all = store.tracks;
  if (!all.length) return [];
  const excl = new Set(exclude);
  const recentIds = new Set(store.history.slice(-30).map((h) => h.id));
  const playCounts = new Map();
  for (const h of store.history) playCounts.set(h.id, (playCounts.get(h.id) || 0) + 1);

  const candidates = all.filter((t) => !excl.has(t.id));
  if (!candidates.length) return [];

  const recentArtists = new Set();
  for (const id of exclude) {
    const t = store.getTrackById(id);
    if (t && t.artist) recentArtists.add(t.artist);
  }

  const out = [];
  const pool = candidates.slice();
  for (let i = 0; i < count && pool.length; i++) {
    const chosen = chooseWeighted(pool, (t) => {
      let w = 1;
      if (store.likes.has(t.id)) w += 5;
      const plays = playCounts.get(t.id) || 0;
      w += Math.min(4, Math.log(1 + plays) * 1.5);
      if (recentIds.has(t.id)) w *= 0.4;
      if (recentArtists.has(t.artist)) w *= 0.7;
      return w;
    });
    if (!chosen) break;
    out.push(chosen);
    if (chosen.artist) recentArtists.add(chosen.artist);
    const idx = pool.indexOf(chosen);
    if (idx >= 0) pool.splice(idx, 1);
  }
  return out;
}

let instance = null;

export function getPlayer() {
  if (!instance) {
    const audio = document.getElementById('audio');
    instance = new Player(audio);
  }
  return instance;
}

export { fmtDuration };
