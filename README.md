# Sonara

Hybrid Spotify + SoundCloud player with a unified library, search and mixed playlists.
Modern dark UI in Plexamp/Tidal style. Built with Electron + React + Vite + TypeScript + Tailwind.

> **Status**: design-system complete, mock data wired, auto-update channel ready. Spotify and
> SoundCloud network integrations are scaffolded — real OAuth + Web Playback SDK + SoundCloud
> embed/widget endpoints land in subsequent commits.

## Features

- **Unified search** — single input, Spotify and SoundCloud results merged with provider filters.
- **Unified library** — every track from both services in one list, with grid/list toggle.
- **Mixed playlists** — combine Spotify and SoundCloud tracks in the same playlist; persisted locally.
- **My Wave** — mood-driven endless mix, biased toward your liked tracks.
- **Liked** — one-click favorites stored locally, mixed across providers.
- **Quality dark UI** — glass-blur surfaces, ambient cover-driven backdrop, gradient accents,
  carefully tuned typography (Inter), `cubic-bezier(0.16, 1, 0.3, 1)` motion.
- **Auto-update** via GitHub Releases.

## Develop

```bash
npm install
npm run dev
```

## Build (Windows installer)

```bash
npm run build      # produces dist-installer/Sonara-Setup-<version>.exe
npm run publish    # uploads to GitHub Releases
```

## Architecture

- `src/main/` — Electron main process (IPC, persistence via electron-store, auto-updater).
- `src/preload/` — context-isolated bridge exposing `window.sonara` to the renderer.
- `src/renderer/` — React UI:
  - `components/` — design-system primitives (Sidebar, PlayerBar, TrackCard, …).
  - `views/` — Home, Search, Library, Liked, Wave, Spotify, SoundCloud, Playlist, Settings.
  - `store/` — Zustand stores (router, player, library/playlists).
  - `lib/` — utilities and mock data (replaced provider-by-provider).
- `src/shared/` — types shared across processes.

## License

MIT — see `LICENSE`.
