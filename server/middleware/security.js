// Server-side security middleware
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Rate limiting configuration
 */
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs, // Time window in milliseconds
    max, // Maximum number of requests per window
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for health checks and counter endpoints
    // Counter endpoints are polled frequently and have their own protections (auth, deduplication)
    skip: (req) => {
      const path = req.path || req.url || req.originalUrl || '';
      return path === '/health' || 
             path === '/api/global-counter/count' || 
             path === '/api/global-counter/increment' ||
             path.includes('/global-counter');
    },
  });
};

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Strict rate limiter for payment endpoints
export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: {
    error: 'Too many payment requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Security headers middleware using Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'", // Note: 'unsafe-eval' needed for some React features
        "https://static.cloudflareinsights.com", // Allow Cloudflare Insights
      ],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://*.firebaseio.com",
        "https://*.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://static.cloudflareinsights.com", // Allow Cloudflare Insights
      ],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

/**
 * Input validation middleware
 */
export const validateInput = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  };
};

/**
 * Common validation rules
 */
export const validationRules = {
  // Validate lesson ID (param)
  lessonId: param('lessonId')
    .isInt({ min: 1 })
    .withMessage('Lesson ID must be a positive integer'),
  
  // Validate lesson ID (body)
  lessonIdBody: body('lessonId')
    .isInt({ min: 1 })
    .withMessage('Lesson ID must be a positive integer'),
  
  // Validate section ID
  sectionId: param('sectionId')
    .isInt({ min: 1 })
    .withMessage('Section ID must be a positive integer'),
  
  // Validate unit ID
  unitId: param('unitId')
    .isInt({ min: 1, max: 7 })
    .withMessage('Unit ID must be between 1 and 7'),
  
  // Validate question ID
  questionId: param('questionId')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  
  // Validate payment amount
  paymentAmount: body('amount')
    .isInt({ min: 100, max: 1000000 }) // $1 to $10,000 in cents
    .withMessage('Amount must be between $1.00 and $10,000.00'),
  
  // Validate currency
  currency: body('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp'])
    .withMessage('Currency must be usd, eur, or gbp'),
  
  // Validate user ID
  userId: body('userId')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('User ID is required and must be a valid string'),
  
  // Validate question count
  questionCount: body('questionCount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Question count must be between 1 and 1000'),
};

/**
 * Sanitize string input
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * Validate numeric input
 */
export function validateNumeric(value, min = null, max = null) {
  const num = Number(value);
  if (isNaN(num)) return null;
  if (min !== null && num < min) return null;
  if (max !== null && num > max) return null;
  return num;
}

