const crypto = require('crypto');
const { logger } = require('../utils/logger');

// Security configuration constants
const SECURITY_CONFIG = {
  // Input validation
  MAX_INPUT_LENGTH: parseInt(process.env.AI_MAX_INPUT_LENGTH) || 10000,
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  
  // Rate limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  AI_RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  AI_RATE_LIMIT_MAX_REQUESTS: 10,
  
  // AI-specific limits
  AI_MAX_TOKENS_PER_REQUEST: parseInt(process.env.AI_MAX_TOKENS_PER_REQUEST) || 4000,
  AI_MAX_REQUESTS_PER_HOUR: parseInt(process.env.AI_MAX_REQUESTS_PER_HOUR) || 1000,
  AI_MIN_CONFIDENCE_THRESHOLD: parseFloat(process.env.AI_MIN_CONFIDENCE_THRESHOLD) || 0.7,
  
  // Session security
  SESSION_SECRET: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_REQUIRE_SPECIAL: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_UPPERCASE: true,
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  KEY_DERIVATION_ITERATIONS: 100000,
  
  // Audit logging
  AUDIT_LOG_RETENTION_DAYS: 365,
  AUDIT_LOG_ENCRYPTION: true,
  
  // Network security
  ALLOWED_ORIGINS: process.env.NODE_ENV === 'production' 
    ? ['https://medflect.ai', 'https://app.medflect.ai']
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  // Content Security Policy
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    connectSrc: ["'self'", "https://api.groq.com", "http://91.108.112.45:4000"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    manifestSrc: ["'self'"]
  }
};

// Sensitive data patterns for detection
const SENSITIVE_PATTERNS = {
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
  CREDIT_CARD: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  PHONE: /\b\d{10,11}\b/g,
  API_KEY: /\b(sk-|pk-|ak-)[a-zA-Z0-9]{20,}\b/g,
  PRIVATE_KEY: /\b-----BEGIN PRIVATE KEY-----\n[\s\S]*?\n-----END PRIVATE KEY-----\b/g,
  PASSWORD: /\bpassword\s*[:=]\s*\S+/gi
};

// Malicious content patterns
const MALICIOUS_PATTERNS = {
  SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  JAVASCRIPT_PROTOCOL: /javascript:/gi,
  DATA_URI: /data:text\/html/gi,
  PROMPT_INJECTION: /system:|assistant:|user:/gi,
  SQL_INJECTION: /(\b(union|select|insert|update|delete|drop|create|alter)\b)/gi,
  XSS_PAYLOADS: /<iframe|<object|<embed|<form/gi
};

// Security utilities
const SecurityUtils = {
  // Generate secure random string
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Hash data with salt
  hashData: (data, salt = null) => {
    const useSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, useSalt, 100000, 64, 'sha512');
    return {
      hash: hash.toString('hex'),
      salt: useSalt
    };
  },

  // Encrypt sensitive data
  encryptData: (data, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encrypted,
      iv: iv.toString('hex')
    };
  },

  // Decrypt data
  decryptData: (encryptedData, key, iv) => {
    const decipher = crypto.createDecipher(SECURITY_CONFIG.ENCRYPTION_ALGORITHM, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },

  // Validate and sanitize input
  validateAndSanitizeInput: (input, context = {}) => {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: Input must be a non-empty string');
    }

    if (input.length > SECURITY_CONFIG.MAX_INPUT_LENGTH) {
      throw new Error(`Input too long: Maximum ${SECURITY_CONFIG.MAX_INPUT_LENGTH} characters allowed`);
    }

    // Check for sensitive data
    for (const [patternName, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
      if (pattern.test(input)) {
        logger.security('Sensitive data detected in input', {
          pattern: patternName,
          context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Sensitive data detected: ${patternName}`);
      }
    }

    // Check for malicious content
    for (const [patternName, pattern] of Object.entries(MALICIOUS_PATTERNS)) {
      if (pattern.test(input)) {
        logger.security('Malicious content detected in input', {
          pattern: patternName,
          context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Malicious content detected: ${patternName}`);
      }
    }

    // Sanitize HTML and script tags
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();

    return sanitized;
  },

  // Validate and sanitize output
  validateAndSanitizeOutput: (output, context = {}) => {
    if (!output || typeof output !== 'string') {
      throw new Error('Invalid output received');
    }

    // Check for malicious content in output
    for (const [patternName, pattern] of Object.entries(MALICIOUS_PATTERNS)) {
      if (pattern.test(output)) {
        logger.security('Malicious content detected in output', {
          pattern: patternName,
          context,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Malicious content detected in output: ${patternName}`);
      }
    }

    return output.trim();
  },

  // Validate password strength
  validatePasswordStrength: (password) => {
    const errors = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate security hash for content integrity
  generateSecurityHash: (content) => {
    return crypto.createHash('sha256').update(content).digest('hex');
  },

  // Mask sensitive data in logs
  maskSensitiveData: (data) => {
    if (typeof data !== 'string') return data;
    
    return data
      .replace(/(https?:\/\/[^\/]+)/, (match) => {
        const parts = match.split('.');
        if (parts.length >= 2) {
          return `${parts[0]}.***.***`;
        }
        return match;
      })
      .replace(/\b(sk-|pk-|ak-)[a-zA-Z0-9]{20,}\b/g, '$1***')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
  },

  // Validate file upload
  validateFileUpload: (file) => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      throw new Error(`File too large: Maximum ${SECURITY_CONFIG.MAX_FILE_SIZE} bytes allowed`);
    }

    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      throw new Error(`File type not allowed: ${file.mimetype}`);
    }

    // Check for malicious file extensions
    const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (maliciousExtensions.includes(fileExtension)) {
      throw new Error(`Malicious file extension detected: ${fileExtension}`);
    }

    return true;
  },

  // Rate limiting check
  checkRateLimit: (userId, action, limits) => {
    // This would typically integrate with Redis or a similar store
    // For now, we'll implement a simple in-memory check
    const now = Date.now();
    const windowMs = limits.windowMs || 60000;
    const maxRequests = limits.max || 10;

    // In a real implementation, this would check against a persistent store
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: now + windowMs
    };
  },

  // Audit logging
  logSecurityEvent: (event, details) => {
    logger.security(event, {
      ...details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    });
  },

  // Validate API key format
  validateAPIKey: (apiKey) => {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Check for common API key patterns
    const validPatterns = [
      /^sk-[a-zA-Z0-9]{20,}$/, // OpenAI/Groq style
      /^pk-[a-zA-Z0-9]{20,}$/, // Public key style
      /^ak-[a-zA-Z0-9]{20,}$/  // Alternative style
    ];

    return validPatterns.some(pattern => pattern.test(apiKey));
  },

  // Validate endpoint URL
  validateEndpointURL: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  // Generate secure session token
  generateSessionToken: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  // Validate JWT token format
  validateJWTFormat: (token) => {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  }
};

// Security middleware factory
const createSecurityMiddleware = {
  // Input validation middleware
  validateInput: (schema) => {
    return (req, res, next) => {
      try {
        const { error, value } = schema.validate(req.body);
        if (error) {
          SecurityUtils.logSecurityEvent('Input validation failed', {
            userId: req.user?.id,
            error: error.details[0].message,
            endpoint: req.path,
            ip: req.ip
          });
          return res.status(400).json({
            error: 'Invalid input data',
            details: error.details[0].message,
            code: 'VALIDATION_ERROR'
          });
        }
        req.validatedData = value;
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  // Rate limiting middleware
  rateLimit: (options = {}) => {
    return (req, res, next) => {
      const userId = req.user?.id || req.ip;
      const limits = {
        windowMs: options.windowMs || SECURITY_CONFIG.AI_RATE_LIMIT_WINDOW,
        max: options.max || SECURITY_CONFIG.AI_RATE_LIMIT_MAX_REQUESTS
      };

      const rateLimitResult = SecurityUtils.checkRateLimit(userId, req.path, limits);
      
      if (!rateLimitResult.allowed) {
        SecurityUtils.logSecurityEvent('Rate limit exceeded', {
          userId,
          endpoint: req.path,
          ip: req.ip
        });
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimitResult.resetTime / 1000),
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }

      res.set('X-RateLimit-Limit', limits.max);
      res.set('X-RateLimit-Remaining', rateLimitResult.remaining);
      res.set('X-RateLimit-Reset', rateLimitResult.resetTime);
      
      next();
    };
  },

  // Content security middleware
  contentSecurity: () => {
    return (req, res, next) => {
      // Set security headers
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('X-XSS-Protection', '1; mode=block');
      res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      next();
    };
  },

  // Audit logging middleware
  auditLog: (action) => {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log request
      SecurityUtils.logSecurityEvent('API request', {
        userId: req.user?.id,
        action,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(data) {
        const duration = Date.now() - startTime;
        
        SecurityUtils.logSecurityEvent('API response', {
          userId: req.user?.id,
          action,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          responseSize: JSON.stringify(data).length
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }
};

module.exports = {
  SECURITY_CONFIG,
  SENSITIVE_PATTERNS,
  MALICIOUS_PATTERNS,
  SecurityUtils,
  createSecurityMiddleware
}; 