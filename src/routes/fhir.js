const express = require('express');
const { VERSIONS } = require('node-fhir-server-core');
const router = express.Router();

// --- Patient Endpoints ---
// GET /fhir/Patient/:id (by ID)
router.get('/Patient/:id', (req, res) => {
  // TODO: Implement getPatientById
  res.status(501).json({ message: 'Not implemented' });
});

// GET /fhir/Patient (search)
router.get('/Patient', (req, res) => {
  // TODO: Implement searchPatients
  res.status(501).json({ message: 'Not implemented' });
});

// POST /fhir/Patient (create)
router.post('/Patient', (req, res) => {
  // TODO: Implement createPatient
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /fhir/Patient/:id (update)
router.put('/Patient/:id', (req, res) => {
  // TODO: Implement updatePatient
  res.status(501).json({ message: 'Not implemented' });
});

// DELETE /fhir/Patient/:id (delete)
router.delete('/Patient/:id', (req, res) => {
  // TODO: Implement deletePatient
  res.status(501).json({ message: 'Not implemented' });
});

// --- Observation Endpoints ---
// GET /fhir/Observation/:id (by ID)
router.get('/Observation/:id', (req, res) => {
  // TODO: Implement getObservationById
  res.status(501).json({ message: 'Not implemented' });
});

// GET /fhir/Observation (search)
router.get('/Observation', (req, res) => {
  // TODO: Implement searchObservations
  res.status(501).json({ message: 'Not implemented' });
});

// POST /fhir/Observation (create)
router.post('/Observation', (req, res) => {
  // TODO: Implement createObservation
  res.status(501).json({ message: 'Not implemented' });
});

// PUT /fhir/Observation/:id (update)
router.put('/Observation/:id', (req, res) => {
  // TODO: Implement updateObservation
  res.status(501).json({ message: 'Not implemented' });
});

// DELETE /fhir/Observation/:id (delete)
router.delete('/Observation/:id', (req, res) => {
  // TODO: Implement deleteObservation
  res.status(501).json({ message: 'Not implemented' });
});

module.exports = router;
