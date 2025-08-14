import { promises as fs } from 'fs';
import path from 'path';
import type { Request } from 'express';

export type AuditEntry = {
  event: string;
  patientId?: string;
  actor?: string;
  target?: string;
  action?: string; // alias for event in some callers
  resource?: string; // free-form resource path
  allowed?: boolean;
  result?: any;
  meta?: Record<string, any>;
};

function getActorFromReq(req?: Request): string {
  try {
    const anyReq = req as any;
    if (anyReq?.user?.sub) return String(anyReq.user.sub);
  } catch {}
  return 'system';
}

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  try { await fs.mkdir(dir, { recursive: true }); } catch {}
}

export async function recordAudit(entry: AuditEntry, req?: Request) {
  const enriched = {
    ...entry,
    actor: entry.actor || getActorFromReq(req),
    timestamp: new Date().toISOString()
  } as const;

  const file = path.resolve(process.cwd(), 'data', 'consent_audit.log');
  await ensureDir(file);
  await fs.appendFile(file, JSON.stringify(enriched) + '\n', 'utf8');

  try {
    const io = (req as any)?.app?.get?.('io');
    if (io) io.emit('audit:event', enriched);
  } catch {}

  return enriched;
}
