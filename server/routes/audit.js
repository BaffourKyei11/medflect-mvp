const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getAuditLogs, getAuditLogById } = require('../controllers/auditController');

const router = express.Router();

// Get all audit logs (admin only)
router.get('/', authMiddleware, getAuditLogs);

// Get audit log by ID (admin only)
router.get('/:id', authMiddleware, getAuditLogById);

module.exports = router;
