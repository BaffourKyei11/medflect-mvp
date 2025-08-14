import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

export const auditRouter = Router();

// GET /api/audit?patientId=...&limit=100
// Reads from data/consent_audit.log and returns JSON lines, newest first.
// This is a lightweight reader suitable for small to moderate logs in MVP.
auditRouter.get('/', async (req, res, next) => {
  try {
    const { patientId, limit } = req.query as { patientId?: string; limit?: string };
    const lim = Math.max(1, Math.min(1000, Number(limit || 100)));
    const file = path.resolve(process.cwd(), 'data', 'consent_audit.log');

    let text = '';
    try {
      text = await fs.readFile(file, 'utf8');
    } catch (e: any) {
      if (e && e.code === 'ENOENT') return res.json([]); // no log yet
      throw e;
    }

    const lines = text.split(/\r?\n/).filter(Boolean);
    const entries = lines.map((l) => {
      try { return JSON.parse(l); } catch { return null; }
    }).filter(Boolean) as any[];

    // newest first
    entries.reverse();

    const filtered = patientId ? entries.filter((e) => e.patientId === patientId) : entries;

    res.json(filtered.slice(0, lim));
  } catch (e) { next(e); }
});
