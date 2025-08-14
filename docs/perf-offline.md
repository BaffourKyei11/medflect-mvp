# Performance & Offline

- Web
  - Vite route-based code-splitting; SW via Workbox; cache shell + critical GETs (SWR).
  - Pagination, field selection (`_elements`), lazy images, SVG icons.
  - Offline writes via queue with backoff; optimistic UI.
- Mobile
  - Lazy screens; Hermes; background sync task; compact caches.
- Network Resilience
  - Staged uploads for attachments; SSE or light polling for near real-time; exponential backoff.
