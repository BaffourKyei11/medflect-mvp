import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import { firebaseInit } from './services/firebase.ts';
import { authRouter } from './routes/auth.ts';
import { fhirRouter } from './routes/fhir.ts';
import { aiRouter } from './routes/ai.ts';
import { consentRouter } from './routes/consent.ts';
import { healthRouter } from './routes/health.ts';
import { errorHandler } from './middleware/error.ts';
import { requireAuth } from './middleware/auth.ts';
import { analyticsRouter } from './routes/analytics.ts';
import { dashboardRouter } from './routes/dashboard.ts';

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });
(app as any).set('io', io);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Trace incoming requests (dev aid)
app.use((req, _res, next) => {
  console.log('[REQ]', req.method, req.originalUrl);
  next();
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/fhir', requireAuth, fhirRouter);
// Allow public access for summarize endpoint used by landing chatbot
app.use('/api/ai', (req, _res, next) => { console.log('[AI]', req.method, req.originalUrl); next(); }, aiRouter);
app.use('/api/consent', requireAuth, consentRouter);
app.use(errorHandler);

<<<<<<< HEAD
const PORT = Number(process.env.PORT || 3002); // env-driven, defaults to 3002 for local dev
=======
const PORT = 3002; // forced for debugging to avoid hitting a stale server on 3001
>>>>>>> 37a8a7e546e2f0fbbe507dfb1c308647f56b356d
(async () => {
  try {
    // Allow dev startup even if Firebase creds are not configured
    firebaseInit();
    console.log('[Startup] Firebase initialized');
  } catch (e) {
    console.warn('[Startup] Firebase initialization skipped:', (e as Error).message);
  }
  server.listen(PORT, () => console.log(`API listening on :${PORT}`));
})();
