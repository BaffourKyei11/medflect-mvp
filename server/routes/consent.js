const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { grantConsent, revokeConsent, checkConsent, getConsentLog } = require('../controllers/consentController');

const router = express.Router();

// Grant consent (patient)
router.post('/grant', authMiddleware, grantConsent);

// Revoke consent (patient)
router.post('/revoke', authMiddleware, revokeConsent);

// Check consent (any user)
router.get('/check/:patientId/:userId', authMiddleware, checkConsent);

// Get consent log (admin/patient)
router.get('/log/:patientId', authMiddleware, getConsentLog);

module.exports = router;
