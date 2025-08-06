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
const aiRoutes = require('./routes/ai');
const blockchainRoutes = require('./routes/blockchain');
const fhirRoutes = require('./routes/fhir');
const syncRoutes = require('./routes/sync');
const dashboardRoutes = require('./routes/dashboard');

// Import services
const { initializeDatabase } = require('./services/database');
const { initializeBlockchain } = require('./services/blockchain');
const { initializeGroq } = require('./services/groq');
const { initializeSync } = require('./services/sync');

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

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://medflect.ai', 'https://app.medflect.ai']
    : ['http://localhost:3000', 'http://localhost:3001'],
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
app.use(rateLimiter);

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
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/fhir', authMiddleware, fhirRoutes);
app.use('/api/sync', authMiddleware, syncRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
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
    await initializeGroq();
    await initializeSync();
    
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