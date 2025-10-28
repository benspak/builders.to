/**
 * Secure error logging utility
 * Prevents sensitive data from being logged
 */

// List of sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'token',
  'authorization',
  'secret_key',
  'api_key',
  'stripe_key',
  'jwt_secret',
  'webhook_secret',
  'email', // Sometimes, depending on context
  'card_number',
  'cvv',
  'ssn',
  'account_number'
];

/**
 * Sanitize an object by removing or masking sensitive fields
 */
const sanitizeObject = (obj, depth = 0) => {
  if (depth > 3) return '[Max depth reached]';
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Check if this key is sensitive
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.constructor === Object) {
        sanitized[key] = sanitizeObject(value, depth + 1);
      } else {
        sanitized[key] = `[${value.constructor.name}]`;
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' ? sanitizeObject(item, depth + 1) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Sanitize error message to prevent sensitive data leaks
 */
const sanitizeErrorMessage = (error) => {
  if (!error) return 'Unknown error';

  // If it's already a string, check for sensitive patterns
  if (typeof error === 'string') {
    let message = error;
    // Remove potential passwords, tokens, etc.
    message = message.replace(/(password|token|secret|key)=[^\s]+/gi, '$1=[REDACTED]');
    return message;
  }

  // If it's an Error object, return safe message
  if (error instanceof Error) {
    // Don't include stack traces in production
    if (process.env.NODE_ENV === 'production') {
      return `Error: ${error.message}`;
    }
    return error;
  }

  return String(error);
};

/**
 * Log an error securely
 */
export const logError = (context, error, requestData = null) => {
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] Error in ${context}:`);
  console.error('Message:', sanitizeErrorMessage(error));

  // Only log sanitized request data in development
  if (requestData && process.env.NODE_ENV === 'development') {
    console.error('Request data:', sanitizeObject(requestData));
  }

  // Only log full stack in development
  if (error instanceof Error && error.stack && process.env.NODE_ENV === 'development') {
    console.error('Stack:', error.stack);
  }
};

/**
 * Wrap async route handlers to catch and log errors securely
 */
export const safeAsyncHandler = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      const context = req.route?.path || req.path || 'unknown';

      // Extract safe request info (no sensitive headers)
      const safeRequestData = {
        method: req.method,
        path: req.path,
        query: req.query,
        user: req.user ? { id: req.user.id } : null
      };

      logError(context, error, safeRequestData);

      // Send generic error response to client
      res.status(500).json({ error: 'Server error' });
    }
  };
};

export default {
  sanitizeObject,
  sanitizeErrorMessage,
  logError,
  safeAsyncHandler
};
