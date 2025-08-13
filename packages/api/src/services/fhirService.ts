import { firestore } from './firebase.ts';
import { randomUUID } from 'crypto';

export type FhirResource = { resourceType: string; id?: string; meta?: any; [k: string]: any };

function isValidBaseResource(t: string, data: any): data is FhirResource {
  return !!data && typeof data === 'object' && typeof data.resourceType === 'string' && data.resourceType === t;
}

export async function getResource(t: string, id: string): Promise<FhirResource> {
  const docRef = firestore().collection('fhir').doc(`${t}_${id}`);
  const snap = await docRef.get();
  if (!snap.exists) throw new Error('Not found');
  return snap.data() as FhirResource;
}

export async function createResource(t: string, data: FhirResource): Promise<FhirResource> {
  if (!isValidBaseResource(t, data)) throw new Error('Invalid FHIR resource');
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

export async function updateResource(t: string, id: string, data: FhirResource): Promise<FhirResource> {
  const exist: FhirResource = await getResource(t, id);
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
