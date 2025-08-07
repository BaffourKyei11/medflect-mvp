const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');
const { RateLimitError } = require('./errorHandler');

// Create rate limiters for different endpoints
const createRateLimiter = (points, duration, blockDuration = 0) => {
  return new RateLimiterMemory({
    points, // Number of requests
    duration, // Per duration in seconds
    blockDuration, // Block duration in seconds (0 = no blocking)
    onConsume: (key, points, remainingPoints) => {
      logger.debug(`Rate limit consumed: ${key}, points: ${points}, remaining: ${remainingPoints}`);
    },
    onBlock: (key, points, remainingPoints) => {
      logger.warning(`Rate limit blocked: ${key}, points: ${points}, remaining: ${remainingPoints}`);
    }
  });
};

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = createRateLimiter(100, 15 * 60);

// Authentication rate limiter (5 attempts per 15 minutes)
const authLimiter = createRateLimiter(5, 15 * 60, 30 * 60); // Block for 30 minutes after 5 failed attempts

// AI operations rate limiter (20 requests per hour)
const aiLimiter = createRateLimiter(20, 60 * 60);

// Blockchain operations rate limiter (10 requests per hour)
const blockchainLimiter = createRateLimiter(10, 60 * 60);

// Patient data access rate limiter (50 requests per hour)
const patientDataLimiter = createRateLimiter(50, 60 * 60);

// File upload rate limiter (10 uploads per hour)
const uploadLimiter = createRateLimiter(10, 60 * 60);

// Admin operations rate limiter (30 requests per hour)
const adminLimiter = createRateLimiter(30, 60 * 60);

// Rate limiting middleware factory
const createRateLimitMiddleware = (limiter, errorMessage = 'Rate limit exceeded') => {
  return async (req, res, next) => {
    try {
      const key = req && req.user ? `user:${req.user.id}` : `ip:${req?.ip}`;
      await limiter.consume(key || 'unknown');
      next();
    } catch (rejRes) {
      const msBeforeNext = (rejRes && typeof rejRes.msBeforeNext === 'number') ? rejRes.msBeforeNext : 1000;
      const secs = Math.round(msBeforeNext / 1000) || 1;
      
      logger.warning('Rate limit exceeded', {
        key: rejRes.key,
        points: rejRes.points,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id
      });

      if (res && typeof res.set === 'function' && typeof res.status === 'function') {
        res.set('Retry-After', String(secs));
        res.status(429).json({
          success: false,
          error: {
            message: errorMessage,
            retryAfter: secs,
            remainingPoints: rejRes?.remainingPoints,
            totalPoints: rejRes?.points
          }
        });
      } else {
        logger.error('Response object missing in rateLimiter middleware; forwarding RateLimitError');
        next(new RateLimitError(errorMessage));
      }
    }
  };
};

// Specific rate limit middlewares
const generalRateLimit = createRateLimitMiddleware(generalLimiter, 'Too many requests');
const authRateLimit = createRateLimitMiddleware(authLimiter, 'Too many authentication attempts');
const aiRateLimit = createRateLimitMiddleware(aiLimiter, 'AI service rate limit exceeded');
const blockchainRateLimit = createRateLimitMiddleware(blockchainLimiter, 'Blockchain operations rate limit exceeded');
const patientDataRateLimit = createRateLimitMiddleware(patientDataLimiter, 'Patient data access rate limit exceeded');
const uploadRateLimit = createRateLimitMiddleware(uploadLimiter, 'File upload rate limit exceeded');
const adminRateLimit = createRateLimitMiddleware(adminLimiter, 'Admin operations rate limit exceeded');

// Dynamic rate limiting based on user role
const dynamicRateLimit = async (req, res, next) => {
  let limiter;
  
  // Choose limiter based on user role and endpoint
  if (req.user) {
    switch (req.user.role) {
      case 'admin':
        limiter = createRateLimiter(100, 15 * 60); // Higher limits for admins
        break;
      case 'doctor':
        limiter = createRateLimiter(80, 15 * 60); // Higher limits for doctors
        break;
      case 'nurse':
        limiter = createRateLimiter(60, 15 * 60); // Medium limits for nurses
        break;
      case 'patient':
        limiter = createRateLimiter(30, 15 * 60); // Lower limits for patients
        break;
      default:
        limiter = generalLimiter;
    }
  } else {
    limiter = createRateLimiter(20, 15 * 60); // Very low limits for unauthenticated users
  }

  try {
    const key = req && req.user ? `user:${req.user.id}` : `ip:${req?.ip}`;
    await limiter.consume(key || 'unknown');
    next();
  } catch (rejRes) {
    const msBeforeNext = (rejRes && typeof rejRes.msBeforeNext === 'number') ? rejRes.msBeforeNext : 1000;
    const secs = Math.round(msBeforeNext / 1000) || 1;
    
    logger.warning('Dynamic rate limit exceeded', {
      key: rejRes.key,
      userRole: req.user?.role,
      endpoint: req.originalUrl,
      remainingPoints: rejRes.remainingPoints
    });

    if (res && typeof res.set === 'function' && typeof res.status === 'function') {
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        error: {
          message: 'Rate limit exceeded',
          retryAfter: secs,
          remainingPoints: rejRes?.remainingPoints
        }
      });
    } else {
      logger.error('Response object missing in dynamicRateLimit; forwarding RateLimitError');
      next(new RateLimitError('Rate limit exceeded'));
    }
  }
};

// Burst protection for sensitive operations
const burstProtection = (maxBurst, windowMs) => {
  const limiter = new RateLimiterMemory({
    points: maxBurst,
    duration: windowMs / 1000,
    onConsume: (key, points, remainingPoints) => {
      logger.debug(`Burst protection: ${key}, remaining: ${remainingPoints}`);
    }
  });

  return createRateLimitMiddleware(limiter, 'Too many rapid requests');
};

// Rate limiting for specific time windows
const createTimeWindowLimiter = (windowMs, maxRequests) => {
  const limiter = new RateLimiterMemory({
    points: maxRequests,
    duration: windowMs / 1000,
  });

  return createRateLimitMiddleware(limiter, `Rate limit exceeded for ${windowMs}ms window`);
};

// Export rate limiters
module.exports = {
  // General rate limiting
  rateLimiter: generalRateLimit,
  
  // Specific rate limiters
  authRateLimit,
  aiRateLimit,
  blockchainRateLimit,
  patientDataRateLimit,
  uploadRateLimit,
  adminRateLimit,
  
  // Dynamic rate limiting
  dynamicRateLimit,
  
  // Burst protection
  burstProtection,
  
  // Time window limiters
  createTimeWindowLimiter,
  
  // Rate limiter instances for direct use
  generalLimiter,
  authLimiter,
  aiLimiter,
  blockchainLimiter,
  patientDataLimiter,
  uploadLimiter,
  adminLimiter
}; 