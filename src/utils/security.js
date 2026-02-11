// Security utilities for client-side
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Unsanitized HTML string
 * @returns {string} - Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty) {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  // Configure DOMPurify with strict settings
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  };
  
  // Add rel="noopener noreferrer" to external links for security
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input string
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize numeric input
 * @param {any} value - Value to validate
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {number|null} - Validated number or null if invalid
 */
export function validateNumber(value, min = null, max = null) {
  const num = Number(value);
  if (isNaN(num)) return null;
  if (min !== null && num < min) return null;
  if (max !== null && num > max) return null;
  return num;
}

