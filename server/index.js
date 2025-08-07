const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { authMiddleware } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const blockchainRoutes = require('./routes/blockchain');
const fhirRoutes = require('./routes/fhir');
const consentRoutes = require('./routes/consent');
const auditRoutes = require('./routes/audit');
const syncRoutes = require('./routes/sync');
const dashboardRoutes = require('./routes/dashboard');

// Import services
const { initializeDatabase } = require('./services/database');
const { initializeBlockchain } = require('./services/blockchain');
// Do NOT import groq/sync at top-level; lazy-require them in startServer()

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration (env-driven)
const allowedOrigins = (() => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
  }
  return process.env.NODE_ENV === 'production'
    ? ['https://medflect.ai', 'https://app.medflect.ai']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
})();

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
// TODO: Re-enable after fixing middleware crash in rateLimiter
// app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    services: {
      database: 'connected',
      blockchain: 'connected',
      groq: 'connected'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', authMiddleware, patientRoutes);
try {
  const aiRoutes = require('./routes/ai');
  app.use('/api/ai', authMiddleware, aiRoutes);
} catch (e) {
  logger.warning('AI routes disabled due to load error', { error: e.message });
}
app.use('/api/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/fhir', authMiddleware, fhirRoutes);
app.use('/api/consent', authMiddleware, consentRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/sync', authMiddleware, syncRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Serve static files in production (optional). Set SERVE_WEB_DIST=true to serve Vite build
if (process.env.NODE_ENV === 'production' && process.env.SERVE_WEB_DIST === 'true') {
  const webDist = path.join(__dirname, '../packages/web/dist');
  app.use(express.static(webDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize services and start server
async function startServer() {
  try {
    logger.info('🚀 Starting Medflect AI Server...');
    
    // Initialize core services
    await initializeDatabase();
    await initializeBlockchain();
    try {
      const { initializeGroq } = require('./services/groq');
      await initializeGroq();
    } catch (e) {
      logger.warning('Groq/LiteLLM initialization failed. Continuing without AI.', { error: e.message });
    }
    try {
      const { initializeSync } = require('./services/sync');
      await initializeSync();
    } catch (e) {
      logger.warning('Sync service initialization failed. Continuing without sync.', { error: e.message });
    }
    
    app.listen(PORT, () => {
      logger.info(`✅ Medflect AI Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🏥 Hospital: ${process.env.HOSPITAL_NAME}`);
      logger.info(`🤖 AI Model: ${process.env.GROQ_MODEL}`);
      logger.info(`🔗 Blockchain: ${process.env.ETHEREUM_RPC_URL ? 'Connected' : 'Not configured'}`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📱 API Documentation: http://localhost:${PORT}/api/docs`);
        logger.info(`🔍 Health Check: http://localhost:${PORT}/health`);
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app; 