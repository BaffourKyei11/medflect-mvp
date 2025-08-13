# Medflect Setup & Usage Guide

## Prerequisites
- Node.js 18+
- Yarn or npm
- Mobile: Expo CLI (for React Native)
- Firebase project with Firestore enabled (for backend persistence)

## 1. Install Dependencies
```sh
npm install
```

## 2. Environment Variables
Copy `.env.example` to `.env` and fill in Firebase and JWT settings. For the API, provide Firebase Admin credentials via base64-encoded service account JSON:
```
# API
PORT=3001
JWT_SECRET=your_jwt_secret
FIREBASE_SERVICE_ACCOUNT=BASE64_ENCODED_SERVICE_ACCOUNT_JSON

# Web (Firebase client SDK)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Start Backend
```sh
npm run dev
```
Backend runs on http://localhost:3001

## 4. Start Web Client
```sh
cd packages/web
npm install
npm start
```
Web app runs on http://localhost:3001

## 5. Start Mobile Client
```sh
cd packages/mobile
npm install
expo start
```

## 6. Login Flow
- Go to `/login` (web) or launch the app (mobile)
- Enter username/password (see backend seed or create user)
- JWT is stored on login

## 7. Patient List & Detail
- After login, view Patient List
- Click/tap a patient to see details and vitals
- Add new vitals using the form

## 8. Running Tests & Lint
```sh
npm test
npm run lint
```

## 9. Data Persistence (Firebase)
- All FHIR resources are stored in Firebase Firestore
- Patient/Observation CRUD flows via backend (Firestore via `firebase-admin`)

## 10. CI/CD
- All pushes/merges to `main` run lint & tests on web/mobile

---
For more, see `/src`, `/packages/web`, `/packages/mobile`, and `/services`.

## Offline Support & Sync

The PWA uses the Firebase Web SDK with IndexedDB-backed persistence and a service worker for offline capability:

- Enable persistence is already configured in `packages/web/src/lib/firebase.ts`.
- The app will read/write to Firestore when online and serve cached data when offline.
- Conflicts are handled by Firestore's last-write-wins; add domain-specific resolution in the API if needed.
