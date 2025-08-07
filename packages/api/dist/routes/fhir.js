import { Router } from 'express';
import { createResource, getResource, updateResource } from '../services/fhirService.js';
import { blockchainClient } from '../services/blockchainClient.js';
export const fhirRouter = Router();
const consentGuard = (cat) => (async (req, res, next) => { const id = req.params.id || req.query.patientId || ''; const ok = await blockchainClient.checkConsent(id, cat); if (!ok && req.method === 'GET')
    return res.status(403).json({ error: 'Consent required' }); next(); });
fhirRouter.get('/:type/:id', consentGuard('clinical'), async (req, res, next) => { try {
    const { type, id } = req.params;
    res.json(await getResource(type, id));
}
catch (e) {
    next(e);
} });
fhirRouter.post('/:type', async (req, res, next) => { try {
    const { type } = req.params;
    const doc = await createResource(type, req.body);
    res.status(201).json(doc);
}
catch (e) {
    next(e);
} });
fhirRouter.put('/:type/:id', async (req, res, next) => { try {
    const { type, id } = req.params;
    res.json(await updateResource(type, id, req.body));
}
catch (e) {
    next(e);
} });
