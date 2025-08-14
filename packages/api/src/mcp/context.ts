import { firestore } from '../services/firebase.js';

export type PatientContext = {
  patientId: string;
  demographics?: any;
  conditions: any[];
  medications: any[];
  allergies: any[];
  observations: any[];
  labs: any[];
  encounters: any[];
  notes: any[];
};

const TYPES = {
  demographics: ['Patient'],
  conditions: ['Condition'],
  medications: ['MedicationStatement', 'MedicationRequest'],
  allergies: ['AllergyIntolerance'],
  observations: ['Observation'],
  labs: ['DiagnosticReport', 'Observation'],
  encounters: ['Encounter'],
  notes: ['DocumentReference', 'Composition'],
};

async function queryByTypeAndSubject(types: string[], patientId: string, limit = 20) {
  const db = firestore();
  const results: any[] = [];
  for (const t of types) {
    const snap = await db
      .collection('fhir')
      .where('resourceType', '==', t)
      .where('subject.reference', '==', `Patient/${patientId}`)
      .orderBy('meta.lastUpdated', 'desc')
      .limit(limit)
      .get();
    snap.forEach((d) => results.push(d.data()));
  }
  return results;
}

export async function fetchPatientContext(patientId: string): Promise<PatientContext> {
  const [conditions, medications, allergies, observations, labs, encounters, notes] = await Promise.all([
    queryByTypeAndSubject(TYPES.conditions, patientId, 25),
    queryByTypeAndSubject(TYPES.medications, patientId, 25),
    queryByTypeAndSubject(TYPES.allergies, patientId, 25),
    queryByTypeAndSubject(TYPES.observations, patientId, 25),
    queryByTypeAndSubject(TYPES.labs, patientId, 25),
    queryByTypeAndSubject(TYPES.encounters, patientId, 10),
    queryByTypeAndSubject(TYPES.notes, patientId, 10),
  ]);

  // Try to fetch Patient resource separately (no subject on Patient itself)
  let demographics: any | undefined;
  try {
    const patSnap = await firestore().collection('fhir').doc(`Patient_${patientId}`).get();
    if (patSnap.exists) demographics = patSnap.data();
  } catch {}

  return { patientId, demographics, conditions, medications, allergies, observations, labs, encounters, notes };
}
