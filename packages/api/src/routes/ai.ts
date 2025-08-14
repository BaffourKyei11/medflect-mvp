import { Router } from 'express';
import { generateSummary, generateChatCompletion } from '../services/aiService.js';
import { createResource } from '../services/fhirService.js';
import { recordAudit } from '../services/audit.js';

export const aiRouter = Router();

// Simple public ping for debugging auth issues
aiRouter.get('/ping', (_req, res) => {
  res.json({ ok: true, route: 'ai/ping', timestamp: new Date().toISOString() });
});

// Public AI status for UI/debug
aiRouter.get('/status', (_req, res) => {
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

// Summarize for a specific patient and persist a FHIR DocumentReference
aiRouter.post('/summary/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const r = await generateSummary(patientId);
    const doc = await createResource('DocumentReference', {
      resourceType: 'DocumentReference',
      status: 'current',
      subject: { reference: `Patient/${patientId}` },
      date: new Date().toISOString(),
      description: 'AI summary',
      content: [{ attachment: { contentType: 'text/plain', data: Buffer.from(r.summary).toString('base64') } }],
      extension: [{ url: 'http://medflect.ai/provenance', valueString: JSON.stringify(r.provenance) }]
    });
    await recordAudit({ event: 'ai_summary', action: 'generate', patientId, target: `DocumentReference/${doc.id}`, allowed: true, meta: { model: r.provenance?.model } }, req);
    res.json({ summary: r.summary, provenance: r.provenance, documentReferenceId: doc.id });
  } catch (e) { next(e); }
});

// Generic chat completion endpoint used by the web chatbot
aiRouter.post('/summarize', async (req, res, next) => {
  try {
    const { messages, model } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'invalid_payload', details: 'messages[] required' });
    }
    const r = await generateChatCompletion({ messages, model });
    await recordAudit({ event: 'ai_chat', action: 'summarize', target: 'ai/summarize', allowed: true, meta: { model: r.provenance?.model } }, req);
    res.json({ summary: r.summary, provenance: r.provenance });
  } catch (e) { next(e); }
});
