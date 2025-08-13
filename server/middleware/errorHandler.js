const { logger } = require('../utils/logger');

// Custom error classes
class MedflectError extends Error {
  constructor(message, statusCode = 500, context = 'general') {
    super(message);
    this.name = 'MedflectError';
    this.statusCode = statusCode;
    this.context = context;
    this.isOperational = true;
  }
}

class ValidationError extends MedflectError {
  constructor(message, field = null) {
    super(message, 400, 'validation');
    this.name = 'ValidationError';
    this.field = field;
  }
}

class AuthenticationError extends MedflectError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'authentication');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends MedflectError {
  constructor(message = 'Access denied') {
    super(message, 403, 'authorization');
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends MedflectError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'not_found');
    this.name = 'NotFoundError';
  }
}

class ConflictError extends MedflectError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'conflict');
    this.name = 'ConflictError';
  }
}

class RateLimitError extends MedflectError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'rate_limit');
    this.name = 'RateLimitError';
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.errorWithContext(err, 'error_handler', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new NotFoundError(message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ConflictError(message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Groq API errors
  if (err.message?.includes('groq') || err.message?.includes('Groq')) {
    const message = 'AI service temporarily unavailable';
    error = new MedflectError(message, 503, 'ai_service');
  }

  // Blockchain errors
  if (err.message?.includes('blockchain') || err.message?.includes('ethereum')) {
    const message = 'Blockchain service temporarily unavailable';
    error = new MedflectError(message, 503, 'blockchain_service');
  }

  // Database errors
  if (err.code === 'SQLITE_BUSY' || err.code === 'SQLITE_LOCKED') {
    const message = 'Database temporarily unavailable';
    error = new MedflectError(message, 503, 'database');
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    const message = 'Service temporarily unavailable';
    error = new MedflectError(message, 503, 'network');
  }

  // Default error response
  const errorResponse = {
    success: false,
    error: {
      message: error.message || 'Server Error',
      statusCode: error.statusCode || 500,
      context: error.context || 'general',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Add additional context for specific error types
  if (error instanceof ValidationError && error.field) {
    errorResponse.error.field = error.field;
  }

  // Log the final error response
  logger.error('Error response sent', {
    statusCode: errorResponse.error.statusCode,
    message: errorResponse.error.message,
    context: errorResponse.error.context,
    url: req.originalUrl
  });

  res.status(error.statusCode || 500).json(errorResponse);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  MedflectError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
}; 