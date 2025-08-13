import { firestore } from './firebase.js';
import { randomUUID } from 'crypto';
function isValidBaseResource(t, data) {
    return !!data && typeof data === 'object' && typeof data.resourceType === 'string' && data.resourceType === t;
}
export async function getResource(t, id) {
    const docRef = firestore().collection('fhir').doc(`${t}_${id}`);
    const snap = await docRef.get();
    if (!snap.exists)
        throw new Error('Not found');
    return snap.data();
}
export async function createResource(t, data) {
    if (!isValidBaseResource(t, data))
        throw new Error('Invalid FHIR resource');
    const id = data.id || randomUUID();
    const now = new Date().toISOString();
    const doc = {
        ...data,
        id,
        meta: { ...(data.meta || {}), versionId: (data.meta?.versionId || 0) + 1, lastUpdated: now },
    };
    await firestore().collection('fhir').doc(`${t}_${id}`).set(doc, { merge: true });
    return doc;
}
export async function updateResource(t, id, data) {
    const exist = await getResource(t, id);
    const now = new Date().toISOString();
    const doc = {
        ...exist,
        ...data,
        id,
        meta: { ...(exist.meta || {}), versionId: (exist.meta?.versionId || 0) + 1, lastUpdated: now },
    };
    await firestore().collection('fhir').doc(`${t}_${id}`).set(doc, { merge: true });
    return doc;
}
