import { Router } from 'express';
import { blockchainClient } from '../services/blockchainClient.js';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// Ajv default export interop under NodeNext
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Ajv = require('ajv');

export const consentRouter = Router();

// Lightweight rate limit for consent mutations
const limiter = rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false });
consentRouter.use(limiter);

// Validation schema for upsert payloads
const ajv = new Ajv({ removeAdditional: 'failing' });
const upsertSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    patientId: { type: 'string', minLength: 1 },
    // current UI uses a single string category like 'read'
    consent: { type: 'string', minLength: 1 }
  },
  required: ['patientId', 'consent']
} as const;
const validateUpsert = ajv.compile(upsertSchema);
import { recordAudit } from '../services/audit.js';

// GET /api/consent/:patientId -> { patientId, consent }
consentRouter.get('/:patientId', async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    // infer single consent state from on-chain client by checking 'read' category
    const hasRead = await blockchainClient.checkConsent(patientId, 'read');
    res.json({ patientId, consent: hasRead ? 'read' : 'none' });
  } catch (e) { next(e); }
});

// POST /api/consent { patientId, consent } -> upsert (grant/revoke)
consentRouter.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const ok = validateUpsert(body);
    if (!ok) return res.status(400).json({ error: 'invalid_payload', details: validateUpsert.errors });
    const { patientId, consent } = body as { patientId: string; consent: string };

    let result = false;
    if (consent && consent.toLowerCase() === 'read') {
      result = await blockchainClient.grantConsent(patientId, 'read');
    } else {
      // Treat any non-'read' value as revoke for now
      result = await blockchainClient.revokeConsent(patientId, 'read');
    }

    // Record audit trail
    await recordAudit({ event: 'consent_upsert', patientId, action: consent, result, target: 'consent/read' }, req);

    res.json({ ok: result });
  } catch (e) { next(e); }
});
