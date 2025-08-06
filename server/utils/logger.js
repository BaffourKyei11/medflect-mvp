const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'medflect-ai',
    hospital: process.env.HOSPITAL_NAME || '37 Military Hospital',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'medflect.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // Separate file for AI operations
    new winston.transports.File({
      filename: path.join(logsDir, 'ai.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Separate file for blockchain operations
    new winston.transports.File({
      filename: path.join(logsDir, 'blockchain.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  // Handle exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  
  // Handle rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add custom methods for specific logging contexts
logger.ai = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'ai' });
};

logger.blockchain = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'blockchain' });
};

logger.patient = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'patient' });
};

logger.clinical = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'clinical' });
};

logger.sync = (message, meta = {}) => {
  logger.info(message, { ...meta, context: 'sync' });
};

logger.security = (message, meta = {}) => {
  logger.warn(message, { ...meta, context: 'security' });
};

// Performance logging
logger.performance = (operation, duration, meta = {}) => {
  logger.info(`Performance: ${operation} took ${duration}ms`, {
    ...meta,
    context: 'performance',
    operation,
    duration
  });
};

// Audit logging for compliance
logger.audit = (action, userId, resource, meta = {}) => {
  logger.info(`Audit: ${action} by user ${userId} on ${resource}`, {
    ...meta,
    context: 'audit',
    action,
    userId,
    resource,
    timestamp: new Date().toISOString()
  });
};

// Error logging with context
logger.errorWithContext = (error, context, meta = {}) => {
  logger.error(error.message, {
    ...meta,
    context,
    stack: error.stack,
    errorCode: error.code,
    errorType: error.constructor.name
  });
};

// Success logging
logger.success = (message, meta = {}) => {
  logger.info(`✅ ${message}`, { ...meta, context: 'success' });
};

// Warning logging
logger.warning = (message, meta = {}) => {
  logger.warn(`⚠️ ${message}`, { ...meta, context: 'warning' });
};

// Info logging with emoji
logger.info = (message, meta = {}) => {
  logger.info(`ℹ️ ${message}`, meta);
};

// Debug logging
logger.debug = (message, meta = {}) => {
  logger.debug(`🔍 ${message}`, meta);
};

module.exports = { logger }; 