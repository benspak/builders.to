# Security - Error Logging

## Overview

This document outlines the security measures implemented to prevent sensitive data leakage through error logs.

## Secure Error Logging Implementation

### Error Logger Utility (`backend/utils/errorLogger.js`)

A centralized error logging utility has been implemented to sanitize all error logs and prevent sensitive data exposure.

### Features

1. **Automatic Sensitive Field Detection**
   - Automatically redacts fields containing: `password`, `token`, `secret`, `key`, `email`, `cvv`, `ssn`, `account_number`, etc.
   - Performs deep sanitization of nested objects (up to 3 levels deep)

2. **Production vs Development Behavior**
   - **Production**: Only logs generic error messages without stack traces
   - **Development**: Logs detailed information including stack traces and sanitized request data

3. **Sanitization Strategy**
   - Sensitive fields are replaced with `[REDACTED]`
   - Query details and parameters are never logged
   - Stack traces are only shown in development mode
   - Request data is sanitized before logging

### Usage

All route handlers now use the `logError` function:

```javascript
import { logError } from '../utils/errorLogger.js';

try {
  // ... code ...
} catch (error) {
  logError('Route Context', error, {
    // Safe context data
    userId: req.user?.id,
    listingId: req.body.listingId
  });
  res.status(500).json({ error: 'Server error' });
}
```

### Sensitive Data Never Logged

The following data is **NEVER** logged:
- Passwords or password hashes
- JWT tokens or session tokens
- API keys or secret keys
- Database connection strings
- Stripe keys or webhook secrets
- Credit card information
- Personal identification numbers (SSN, etc.)
- Email addresses (in sensitive contexts)
- Authentication headers

### Updated Files

The following files have been updated to use secure error logging:

1. `backend/routes/auth.js` - Authentication routes
2. `backend/routes/payments.js` - Payment processing routes
3. `backend/routes/dashboard.js` - Dashboard routes
4. `backend/routes/listings.js` - Listing management routes
5. `backend/routes/profiles.js` - User profile routes
6. `backend/database/db.js` - Database query error handling
7. `backend/server.js` - Server-level error handling

## Best Practices

1. **Always use `logError()` instead of `console.error()`**
2. **Never log full request bodies** - only safe metadata
3. **Never log database queries or parameters**
4. **Never log full error objects** - use the sanitization utility
5. **Always return generic error messages to clients**
6. **Never expose stack traces in production**

## Health Check Endpoint

The `/health/db` endpoint now also sanitizes error responses:
- Production: Returns generic error message
- Development: Returns detailed error for debugging

## Testing

To test error logging, you can check the logs in different environments:

- **Development**: Full error details are logged for debugging
- **Production**: Only sanitized, safe error information is logged

## Security Benefits

1. ✅ Prevents credential leakage in logs
2. ✅ Prevents sensitive user data exposure
3. ✅ Protects API keys and tokens
4. ✅ Reduces attack surface for attackers analyzing logs
5. ✅ Complies with data protection regulations (GDPR, etc.)
6. ✅ Maintains useful debugging info in development

## Additional Security Measures

The application also implements:
- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS protection
- Environment-based configuration
- Password hashing with bcrypt
- JWT token-based authentication

## Compliance

This implementation helps ensure compliance with:
- GDPR (General Data Protection Regulation)
- PCI DSS (Payment Card Industry Data Security Standard)
- SOC 2 (for future certification)
- Other industry-specific security requirements
