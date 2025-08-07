# Medflect Web (PWA)

React + TypeScript + Vite + Tailwind v4 Progressive Web App for Medflect.

## Environment

Create `.env.local` in `packages/web/` with:

```
VITE_API_BASE=http://localhost:3001
VITE_GROQ_BASE=http://91.108.112.45:4000
```

Backend serves built UI if `SERVE_WEB_DIST=true` (see repo root README).

## Development

```
npm install
npm run dev
```

Open the URL printed by Vite (e.g., http://localhost:5173).

## Build

```
npm run build
```

Artifacts in `packages/web/dist`. In production, API can serve this with `SERVE_WEB_DIST=true`.

## Key Features

- Auth with JWT, guarded routes
- Dashboard, Patients, Patient Detail, AI Summary (with fallback), Consent, Audit, Sync
- Offline-first PWA: service worker caching
- Offline write queue: POST/PUT/PATCH/DELETE are queued when offline and auto-flush on reconnect
- Sync Indicator bar shows queued count and allows manual flush
- Theme: light/dark/system via `ThemeContext`

## Offline Queue Behavior

- When offline or on network error, mutating requests are enqueued in IndexedDB.
- API responses return `{ queued: true }` with HTTP 202 to support optimistic UI.
- Queue auto-flushes on reconnect and can be manually triggered from the Sync bar.

## Useful Env/Configs

- `VITE_API_BASE` — Backend API base (default: http://localhost:3001)
- `VITE_GROQ_BASE` — Fallback AI endpoint base

## Accessibility & PWA

- Installable PWA with offline caching (workbox via `vite-plugin-pwa`).
- High-contrast dark mode, keyboard navigation, aria-live announcements for sync/offline.
