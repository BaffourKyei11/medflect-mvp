const express = require('express');
const router = express.Router();
const { authMiddleware, requireDoctor, requireAdmin } = require('../middleware/auth');
const { aiRateLimit } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');
const Joi = require('joi');

// Lazy-load Groq service to avoid crashing when AI deps/config are missing
let generateClinicalSummary;
let generateClinicalDecisionSupport;
let generatePatientCommunication;
let checkMedicationInteractions;
let isGroqAvailable;

try {
  const groqSvc = require('../services/groq');
  ({
    generateClinicalSummary,
    generateClinicalDecisionSupport,
    generatePatientCommunication,
    checkMedicationInteractions,
    isGroqAvailable
  } = groqSvc);
} catch (e) {
  // Provide safe fallbacks so routes can respond with 503 instead of crashing
  isGroqAvailable = () => false;
  const unavailable = async () => {
    const err = new Error('AI service is currently unavailable');
    err.code = 'AI_SERVICE_UNAVAILABLE';
    throw err;
  };
  generateClinicalSummary = unavailable;
  generateClinicalDecisionSupport = unavailable;
  generatePatientCommunication = unavailable;
  checkMedicationInteractions = unavailable;
}

// AI-specific rate limiting
// Use preconfigured middleware from rateLimiter module

// Input validation schemas
const clinicalSummarySchema = Joi.object({
  patientId: Joi.string().required(),
  encounterId: Joi.string().optional(),
  summaryType: Joi.string().valid('clinical', 'discharge', 'handoff', 'progress').default('clinical')
});

const clinicalDecisionSupportSchema = Joi.object({
  patientId: Joi.string().required(),
  encounterId: Joi.string().optional(),
  query: Joi.string().max(1000).required()
});

const patientCommunicationSchema = Joi.object({
  patientId: Joi.string().required(),
  messageType: Joi.string().valid('appointment_reminder', 'lab_result', 'medication_reminder', 'follow_up').required(),
  context: Joi.string().max(500).optional()
});

const medicationInteractionSchema = Joi.object({
  medications: Joi.array().items(
    Joi.object({
      name: Joi.string().max(100).required(),
      dosage: Joi.string().max(50).required()
    })
  ).min(1).max(20).required()
});

// Middleware to check AI service availability
const checkAIService = (req, res, next) => {
  if (!isGroqAvailable()) {
    return res.status(503).json({
      error: 'AI service is currently unavailable',
      code: 'AI_SERVICE_UNAVAILABLE'
    });
  }
  next();
};

// Middleware to validate and sanitize input
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.security('Input validation failed', {
        userId: req.user.id,
        error: error.details[0].message,
        endpoint: req.path,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({
        error: 'Invalid input data',
        details: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    req.validatedData = value;
    next();
  };
};

// Generate clinical summary
router.post('/clinical-summary', 
  authMiddleware,
  requireDoctor,
  aiRateLimit,
  checkAIService,
  validateInput(clinicalSummarySchema),
  async (req, res, next) => {
    try {
      const { patientId, encounterId, summaryType } = req.validatedData;
      const userId = req.user.id;

      logger.ai('Clinical summary request received', {
        userId,
        patientId,
        encounterId,
        summaryType,
        timestamp: new Date().toISOString()
      });

      const result = await generateClinicalSummary(
        patientId, 
        encounterId, 
        summaryType, 
        userId
      );

      res.json({
        success: true,
        data: result,
        message: 'Clinical summary generated successfully'
      });

    } catch (error) {
      logger.errorWithContext(error, 'clinical_summary_route', {
        userId: req.user.id,
        patientId: req.validatedData?.patientId
      });
      next(error);
    }
  }
);

// Generate clinical decision support
router.post('/clinical-decision-support',
  authMiddleware,
  requireDoctor,
  aiRateLimit,
  checkAIService,
  validateInput(clinicalDecisionSupportSchema),
  async (req, res, next) => {
    try {
      const { patientId, encounterId, query } = req.validatedData;
      const userId = req.user.id;

      logger.ai('Clinical decision support request received', {
        userId,
        patientId,
        encounterId,
        queryLength: query.length,
        timestamp: new Date().toISOString()
      });

      const result = await generateClinicalDecisionSupport(
        patientId,
        encounterId,
        query,
        userId
      );

      res.json({
        success: true,
        data: result,
        message: 'Clinical decision support generated successfully'
      });

    } catch (error) {
      logger.errorWithContext(error, 'clinical_decision_support_route', {
        userId: req.user.id,
        patientId: req.validatedData?.patientId
      });
      next(error);
    }
  }
);

// Generate patient communication
router.post('/patient-communication',
  authMiddleware,
  requireDoctor,
  aiRateLimit,
  checkAIService,
  validateInput(patientCommunicationSchema),
  async (req, res, next) => {
    try {
      const { patientId, messageType, context } = req.validatedData;
      const userId = req.user.id;

      logger.ai('Patient communication request received', {
        userId,
        patientId,
        messageType,
        contextLength: context?.length || 0,
        timestamp: new Date().toISOString()
      });

      const result = await generatePatientCommunication(
        patientId,
        messageType,
        context,
        userId
      );

      res.json({
        success: true,
        data: result,
        message: 'Patient communication generated successfully'
      });

    } catch (error) {
      logger.errorWithContext(error, 'patient_communication_route', {
        userId: req.user.id,
        patientId: req.validatedData?.patientId
      });
      next(error);
    }
  }
);

// Check medication interactions
router.post('/medication-interactions',
  authMiddleware,
  requireDoctor,
  aiRateLimit,
  checkAIService,
  validateInput(medicationInteractionSchema),
  async (req, res, next) => {
    try {
      const { medications } = req.validatedData;
      const userId = req.user.id;

      logger.ai('Medication interaction check request received', {
        userId,
        medicationCount: medications.length,
        timestamp: new Date().toISOString()
      });

      const result = await checkMedicationInteractions(medications, userId);

      res.json({
        success: true,
        data: result,
        message: 'Medication interaction analysis completed'
      });

    } catch (error) {
      logger.errorWithContext(error, 'medication_interaction_route', {
        userId: req.user.id
      });
      next(error);
    }
  }
);

// Get AI service status
router.get('/status',
  authMiddleware,
  async (req, res) => {
    try {
      const isAvailable = isGroqAvailable();
      
      res.json({
        success: true,
        data: {
          available: isAvailable,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.errorWithContext(error, 'ai_status_route');
      res.status(500).json({
        error: 'Failed to get AI service status',
        code: 'AI_STATUS_ERROR'
      });
    }
  }
);

// Get AI interaction history (admin only)
router.get('/interactions',
  authMiddleware,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { getQuery, allQuery } = require('../services/database');
      
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      const offset = (page - 1) * limit;
      
      const interactions = await allQuery(`
        SELECT 
          ai.id,
          ai.action,
          ai.input_length,
          ai.output_length,
          ai.tokens,
          ai.duration,
          ai.confidence_score,
          ai.model,
          ai.created_at,
          ai.provider,
          ai.security_hash,
          ai.error_log,
          ai.nlp_results,
          u.email as user_email,
          p.id as patient_id,
          p.mrn as patient_mrn,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name
        FROM ai_interactions ai
        JOIN users u ON ai.user_id = u.id
        LEFT JOIN patients p ON ai.patient_id = p.id
        ORDER BY ai.created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const totalCount = await getQuery('SELECT COUNT(*) as count FROM ai_interactions');
      
      res.json({
        success: true,
        data: {
          interactions,
          pagination: {
            page,
            limit,
            total: totalCount.count,
            pages: Math.ceil(totalCount.count / limit)
          }
        }
      });

    } catch (error) {
      logger.errorWithContext(error, 'ai_interactions_route');
      next(error);
    }
  }
);

// Get AI interaction statistics (admin only)
router.get('/statistics',
  authMiddleware,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { getQuery, allQuery } = require('../services/database');
      
      // Get daily usage for the last 30 days
      const dailyUsage = await allQuery(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_requests,
          SUM(tokens) as total_tokens,
          AVG(duration) as avg_duration,
          AVG(confidence_score) as avg_confidence
        FROM ai_interactions
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      // Get usage by action type
      const actionStats = await allQuery(`
        SELECT 
          action,
          COUNT(*) as count,
          AVG(duration) as avg_duration,
          AVG(confidence_score) as avg_confidence
        FROM ai_interactions
        GROUP BY action
        ORDER BY count DESC
      `);

      // Get top users
      const topUsers = await allQuery(`
        SELECT 
          u.email,
          u.first_name,
          u.last_name,
          COUNT(ai.id) as request_count,
          SUM(ai.tokens) as total_tokens
        FROM ai_interactions ai
        JOIN users u ON ai.user_id = u.id
        GROUP BY ai.user_id
        ORDER BY request_count DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          dailyUsage,
          actionStats,
          topUsers
        }
      });

    } catch (error) {
      logger.errorWithContext(error, 'ai_statistics_route');
      next(error);
    }
  }
);

// Clinical NLP extraction endpoint
const { extractClinicalEntities } = require('../services/clinicalNLP');
const nlpSchema = Joi.object({
  text: Joi.string().required(),
  engine: Joi.string().valid('spacy', 'medcat').default('spacy'),
  entities: Joi.array().items(Joi.string()).optional(),
  model: Joi.string().optional()
});

router.post('/nlp', authMiddleware, aiRateLimit, async (req, res, next) => {
  try {
    const { error, value } = nlpSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const { text, engine, entities, model } = value;
    const result = await extractClinicalEntities(text, { engine, entities, model });
    res.json({ success: true, engine, result });
  } catch (e) {
    logger.errorWithContext(e, 'nlp_api_error');
    res.status(500).json({ error: e.message });
  }
});

module.exports = router; 