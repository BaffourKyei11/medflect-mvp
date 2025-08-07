import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import Ajv from 'ajv';

export const analyticsRouter = Router();

// Basic rate limiting to protect from abuse
const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
analyticsRouter.use(limiter);

// JSON schema validation for analytics event payloads
const ajv = new Ajv({ removeAdditional: 'failing' });
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    event: { type: 'string', minLength: 1 },
    props: { type: 'object', additionalProperties: true },
    ts: { type: 'string' }
  },
  required: ['event']
} as const;
const validate = ajv.compile(schema);

analyticsRouter.post('/', async (req, res, next) => {
  try {
    const evt = req.body || {};
    const ok = validate(evt);
    if (!ok) {
      return res.status(400).json({ error: 'invalid_payload', details: validate.errors });
    }
    const line = JSON.stringify({ ...evt, _ts: new Date().toISOString() }) + '\n';
    const dir = path.resolve(process.cwd(), 'data');
    const file = path.join(dir, 'analytics.log');
    try { await fs.mkdir(dir, { recursive: true }); } catch {}
    await fs.appendFile(file, line, 'utf8');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
