import { Router } from 'express';
import { recordAudit } from '../services/audit.js';

export const patientsRouter = Router();

// Minimal endpoint to accept clinician notes; in a real system this would persist to a DB or FHIR DocumentReference
patientsRouter.post('/:id/notes', async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = (req.body ?? {}) as { note?: unknown };
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    if (!note) return res.status(400).json({ error: 'invalid_payload', details: 'note:string is required' });
    if (note.length > 20000) return res.status(400).json({ error: 'invalid_payload', details: 'note too long' });

    // For now simply record an audit entry; storage can be added later
    await recordAudit({ event: 'patient_note', action: 'create', patientId: id, target: `Patient/${id}`, allowed: true, meta: { length: note.length } }, req);

    // Indicate accepted; no queue on server, but client may have queued if offline
    res.status(201).json({ ok: true, queued: false });
  } catch (e) { next(e); }
});
