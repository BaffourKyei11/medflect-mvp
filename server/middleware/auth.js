const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');
const { getUserById } = require('../services/userService');

// JWT token validation middleware
const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (!user.isActive) {
      throw new AuthenticationError('User account is deactivated');
    }

    // Add user to request object
    req.user = user;
    
    // Log successful authentication
    logger.audit('authentication_success', user.id, 'api_access', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });

    next();
  } catch (error) {
    logger.security('Authentication failed', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      error: error.message
    });

    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      logger.security('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        ip: req.ip
      });

      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Specific role middlewares
const requireDoctor = authorize('doctor', 'admin');
const requireNurse = authorize('nurse', 'doctor', 'admin');
const requireAdmin = authorize('admin');
const requirePatient = authorize('patient', 'doctor', 'nurse', 'admin');

// Resource ownership middleware
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;
      const userRole = req.user.role;

      // Admins can access all resources
      if (userRole === 'admin') {
        return next();
      }

      // Get resource ownership info
      const resource = await getResourceOwnership(resourceType, resourceId);
      
      if (!resource) {
        return next(new AuthorizationError(`${resourceType} not found`));
      }

      // Check if user owns the resource or has appropriate role
      if (resource.userId === userId || 
          (userRole === 'doctor' && resourceType === 'patient') ||
          (userRole === 'nurse' && resourceType === 'patient')) {
        return next();
      }

      logger.security('Unauthorized resource access attempt', {
        userId,
        userRole,
        resourceType,
        resourceId,
        endpoint: req.originalUrl
      });

      return next(new AuthorizationError('Access denied to this resource'));
    } catch (error) {
      next(error);
    }
  };
};

// Patient data access middleware
const requirePatientConsent = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.body.patientId;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!patientId) {
      return next(new AuthorizationError('Patient ID is required'));
    }

    // Check if user has consent to access patient data
    const hasConsent = await checkPatientConsent(patientId, userId, userRole);
    
    if (!hasConsent) {
      logger.security('Patient data access without consent', {
        userId,
        userRole,
        patientId,
        endpoint: req.originalUrl
      });

      return next(new AuthorizationError('Patient consent required for data access'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

// API key validation for external integrations
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return next(new AuthenticationError('API key required'));
  }

  // Validate API key (implement your validation logic)
  const isValidKey = validateApiKeyLogic(apiKey);
  
  if (!isValidKey) {
    logger.security('Invalid API key used', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl
    });

    return next(new AuthenticationError('Invalid API key'));
  }

  next();
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  const userId = req.user?.id || req.ip;
  const operation = req.originalUrl;
  
  // Implement rate limiting for sensitive operations
  const isAllowed = checkRateLimit(userId, operation);
  
  if (!isAllowed) {
    logger.security('Rate limit exceeded for sensitive operation', {
      userId,
      operation,
      ip: req.ip
    });

    return next(new AuthorizationError('Too many sensitive operations'));
  }

  next();
};

// Audit middleware for compliance
const auditMiddleware = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      logger.audit(action, req.user?.id, req.originalUrl, {
        method: req.method,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Helper functions
const getResourceOwnership = async (resourceType, resourceId) => {
  // Implement resource ownership lookup
  // This would query your database to get ownership info
  return null;
};

const checkPatientConsent = async (patientId, userId, userRole) => {
  // Implement patient consent checking logic
  // This would check blockchain for consent tokens
  return true;
};

const validateApiKeyLogic = (apiKey) => {
  // Implement API key validation
  return process.env.API_KEYS?.includes(apiKey) || false;
};

const checkRateLimit = (userId, operation) => {
  // Implement rate limiting logic
  return true;
};

module.exports = {
  authMiddleware,
  authorize,
  requireDoctor,
  requireNurse,
  requireAdmin,
  requirePatient,
  requireOwnership,
  requirePatientConsent,
  validateApiKey,
  sensitiveOperationLimit,
  auditMiddleware
}; 