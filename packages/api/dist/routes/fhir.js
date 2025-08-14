import { Router } from 'express';
import { createResource, getResource, updateResource } from '../services/fhirService.js';
import { blockchainClient } from '../services/blockchainClient.js';
import { recordAudit } from '../services/audit.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
export const fhirRouter = Router();
// Minimal JSON Schemas for core FHIR resources we handle commonly.
// These validate only essential structure to avoid over-restriction in low-bandwidth contexts.
// Ajv typing under NodeNext can present construct/call issues; cast to any in dev.
const ajv = new Ajv({ allErrors: true, removeAdditional: 'failing' });
addFormats(ajv);
const baseResource = {
    type: 'object',
    required: ['resourceType'],
    additionalProperties: true,
    properties: {
        resourceType: { type: 'string' },
        id: { type: 'string' }
    }
};
const patientSchema = {
    ...baseResource,
    properties: { ...baseResource.properties, resourceType: { const: 'Patient' }, name: { type: 'array' } }
};
const encounterSchema = {
    ...baseResource,
    properties: { ...baseResource.properties, resourceType: { const: 'Encounter' }, subject: { type: 'object' } }
};
const observationSchema = {
    ...baseResource,
    properties: { ...baseResource.properties, resourceType: { const: 'Observation' }, subject: { type: 'object' } }
};
const consentSchema = {
    ...baseResource,
    properties: { ...baseResource.properties, resourceType: { const: 'Consent' }, patient: { type: 'object' } }
};
const validators = {
    Patient: ajv.compile(patientSchema),
    Encounter: ajv.compile(encounterSchema),
    Observation: ajv.compile(observationSchema),
    Consent: ajv.compile(consentSchema)
};
const validateResource = (typeParam) => (req, res, next) => {
    try {
        const type = (typeParam || '').trim();
        const body = req.body || {};
        if (!body || typeof body !== 'object')
            return res.status(400).json({ error: 'Invalid JSON body' });
        if (!body.resourceType)
            return res.status(400).json({ error: 'Missing resourceType' });
        if (body.resourceType !== type)
            return res.status(400).json({ error: `resourceType must be ${type}` });
        const v = validators[type];
        if (v) {
            const ok = v(body);
            if (!ok) {
                return res.status(422).json({ error: 'FHIR validation failed', details: v.errors });
            }
        }
        return next();
    }
    catch (e) {
        return res.status(400).json({ error: 'Validation error', details: e?.message });
    }
};
const consentGuard = (cat) => (async (req, res, next) => {
    const id = req.params.id || req.query.patientId || '';
    const ok = await blockchainClient.checkConsent(id, cat);
    if (!ok && req.method === 'GET')
        return res.status(403).json({ error: 'Consent required' });
    next();
});
fhirRouter.get('/:type/:id', consentGuard('clinical'), async (req, res, next) => {
    const { type, id } = req.params;
    try {
        const r = await getResource(type, id);
        const pid = typeof req.query.patientId === 'string' ? req.query.patientId : undefined;
        await recordAudit({ event: 'fhir_read', action: 'read', target: `${type}/${id}`, allowed: true, patientId: pid }, req);
        res.json(r);
    }
    catch (e) {
        const err = e;
        await recordAudit({ event: 'fhir_read', action: 'read', target: `${type}/${id}`, allowed: false, meta: { error: err?.message } }, req);
        next(e);
    }
});
fhirRouter.post('/:type', (req, res, next) => validateResource(req.params.type)(req, res, next), async (req, res, next) => {
    const { type } = req.params;
    try {
        const doc = await createResource(type, req.body);
        const pid = req.body?.subject?.reference?.split('/')?.[1];
        await recordAudit({ event: 'fhir_create', action: 'create', target: `${type}/${doc.id || ''}`, allowed: true, patientId: pid }, req);
        res.status(201).json(doc);
    }
    catch (e) {
        const err = e;
        await recordAudit({ event: 'fhir_create', action: 'create', target: `${type}`, allowed: false, meta: { error: err?.message } }, req);
        next(e);
    }
});
fhirRouter.put('/:type/:id', (req, res, next) => validateResource(req.params.type)(req, res, next), async (req, res, next) => {
    const { type, id } = req.params;
    try {
        const doc = await updateResource(type, id, req.body);
        const pid = req.body?.subject?.reference?.split('/')?.[1];
        await recordAudit({ event: 'fhir_update', action: 'update', target: `${type}/${id}`, allowed: true, patientId: pid }, req);
        res.json(doc);
    }
    catch (e) {
        const err = e;
        await recordAudit({ event: 'fhir_update', action: 'update', target: `${type}/${id}`, allowed: false, meta: { error: err?.message } }, req);
        next(e);
    }
});
