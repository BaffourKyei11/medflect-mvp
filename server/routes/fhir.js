const express = require('express');
const { authMiddleware, requireOwnership, requirePatientConsent } = require('../middleware/auth');
const { getPatient, getPatients, createPatient, updatePatient, deletePatient } = require('../controllers/fhir/patientController');
const { getObservation, getObservations, createObservation, updateObservation, deleteObservation } = require('../controllers/fhir/observationController');
const { getEncounter, getEncounters, createEncounter, updateEncounter, deleteEncounter } = require('../controllers/fhir/encounterController');

const router = express.Router();

// Patient routes
router.get('/patient/:id', authMiddleware, requireOwnership, requirePatientConsent, getPatient);
router.get('/patient', authMiddleware, getPatients);
router.post('/patient', authMiddleware, createPatient);
router.put('/patient/:id', authMiddleware, requireOwnership, updatePatient);
router.delete('/patient/:id', authMiddleware, requireOwnership, deletePatient);

// Observation routes
router.get('/observation/:id', authMiddleware, requireOwnership, requirePatientConsent, getObservation);
router.get('/observation', authMiddleware, getObservations);
router.post('/observation', authMiddleware, createObservation);
router.put('/observation/:id', authMiddleware, requireOwnership, updateObservation);
router.delete('/observation/:id', authMiddleware, requireOwnership, deleteObservation);

// Encounter routes
router.get('/encounter/:id', authMiddleware, requireOwnership, requirePatientConsent, getEncounter);
router.get('/encounter', authMiddleware, getEncounters);
router.post('/encounter', authMiddleware, createEncounter);
router.put('/encounter/:id', authMiddleware, requireOwnership, updateEncounter);
router.delete('/encounter/:id', authMiddleware, requireOwnership, deleteEncounter);

module.exports = router;
