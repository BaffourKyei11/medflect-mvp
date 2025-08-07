# Medflect Demo

This folder demonstrates how to run and evaluate the Medflect application, with steps and screenshots guidance.

## Prerequisites
- Node.js 18+
- npm 8+
- (Optional) Docker Desktop if you plan to run with docker-compose

## 1) Development Run (recommended for quick demo)
```bash
# From repo root
npm run install-all
cp .env.example .env
npm run dev
```
- Web (Vite): http://localhost:5173/
- API Health: http://localhost:3001/health

## 2) Production Build + Local Run
```bash
# Build frontend
npm run build --prefix packages/web

# Start API serving the built UI
$env:NODE_ENV='production'; $env:SERVE_WEB_DIST='true'; node server/index.js  # PowerShell (Windows)
# or
NODE_ENV=production SERVE_WEB_DIST=true node server/index.js  # bash
```
- UI: http://localhost:3001/
- Health: http://localhost:3001/health

## 3) Docker Compose (API serves UI)
```bash
# Ensure Docker Desktop is running
docker-compose -f docker-compose.mono.yml up -d --build
```
- UI: http://localhost:3001/
- Health: http://localhost:3001/health

## 4) What to look for
- Successful landing page load and navigation
- PWA install prompt (in supported browsers)
- Dark/light mode toggle reflects correctly
- Offline indicator appears when network is disabled (basic PWA behavior)

## 5) Screenshots
Place screenshots in `Demo/screenshots/` with filenames like:
- `01-landing.png` (Landing page)
- `02-theme-toggle.png` (Dark/Light mode)
- `03-offline-indicator.png` (PWA offline state)
- `04-health-endpoint.png` (API health)

## Troubleshooting
- If Docker command fails on Windows, confirm Docker Desktop is running.
- If CSS appears missing in production, ensure `packages/web` built successfully.
- To serve frontend from API, set `SERVE_WEB_DIST=true` in environment.
