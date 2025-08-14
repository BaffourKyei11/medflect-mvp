import 'dotenv/config';
// Dev diagnostics: surface any startup errors with full details
process.on('uncaughtException', (err) => {
    console.error('[Fatal] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[Fatal] Unhandled Rejection:', reason);
});
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import client from 'prom-client';
import { firebaseInit } from './services/firebase.js';
import { authRouter } from './routes/auth.js';
import { fhirRouter } from './routes/fhir.js';
import { aiRouter } from './routes/ai.js';
import { consentRouter } from './routes/consent.js';
import { healthRouter } from './routes/health.js';
import { errorHandler } from './middleware/error.js';
import { requireAuth } from './middleware/auth.js';
import { analyticsRouter } from './routes/analytics.js';
import { dashboardRouter } from './routes/dashboard.js';
import { auditRouter } from './routes/audit.js';
import { patientsRouter } from './routes/patients.js';
import { initAIWorker, shutdownAIWorker } from './queue/bullmq.js';
const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: process.env.CORS_ORIGIN || '*' } });
app.set('io', io);
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
// Global rate limit for all /api/* routes
const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const maxReq = Number(process.env.RATE_LIMIT_MAX || 100);
const apiLimiter = rateLimit({ windowMs, max: maxReq, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);
// Metrics
client.collectDefaultMetrics();
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});
// Trace incoming requests (dev aid)
app.use((req, _res, next) => {
    console.log('[REQ]', req.method, req.originalUrl);
    next();
});
// Expose root health to satisfy external healthchecks (proxies, compose, etc.)
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/audit', requireAuth, auditRouter);
app.use('/api/fhir', requireAuth, fhirRouter);
app.use('/api/patients', requireAuth, patientsRouter);
// Allow public access for summarize endpoint used by landing chatbot
app.use('/api/ai', (req, _res, next) => { console.log('[AI]', req.method, req.originalUrl); next(); }, aiRouter);
app.use('/api/consent', requireAuth, consentRouter);
app.use(errorHandler);
// Explicit status route for resilience in case router mount is missed in a stale build
app.get('/api/ai/status', (_req, res) => {
    res.json({
        mock: process.env.MOCK_AI === 'true',
        model: process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b',
        baseURL: process.env.GROQ_BASE_URL || process.env.OPENAI_BASE_URL || 'http://91.108.112.45:4000',
        modelDetails: {
            id: process.env.GROQ_MODEL || 'groq/deepseek-r1-distill-llama-70b',
            object: 'model',
            created: 1677610602,
            owned_by: 'openai'
        }
    });
});
const PORT = Number(process.env.PORT || 3001); // env-driven, defaults to 3001 for local dev
(async () => {
    try {
        // Allow dev startup even if Firebase creds are not configured
        firebaseInit();
        console.log('[Startup] Firebase initialized');
    }
    catch (e) {
        console.warn('[Startup] Firebase initialization skipped:', e.message);
    }
    // Configure server timeouts (protect upstreams and clients)
    server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS || 30000);
    server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS || 35000);
    console.log('[Startup] Timeouts set', {
        requestTimeout: server.requestTimeout,
        headersTimeout: server.headersTimeout
    });
    // Initialize background worker (can be split to separate service later)
    if (process.env.DISABLE_REDIS === 'true') {
        console.log('[Startup] BullMQ disabled via DISABLE_REDIS=true');
    }
    else {
        try {
            await initAIWorker();
            console.log('[Startup] BullMQ AI worker initialized');
        }
        catch (e) {
            console.warn('[Startup] Worker init skipped/failure:', e.message);
        }
    }
    server.listen(PORT, () => console.log(`API listening on :${PORT}`));
})();
// Graceful shutdown
async function shutdown(signal) {
    try {
        console.log(`[Shutdown] Received ${signal}`);
        await shutdownAIWorker();
        server.close(() => {
            console.log('[Shutdown] HTTP server closed');
            process.exit(0);
        });
        // Fallback exit in case close hangs
        setTimeout(() => process.exit(0), 5000).unref();
    }
    catch (e) {
        console.error('[Shutdown] Error during shutdown', e.message);
        process.exit(1);
    }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
