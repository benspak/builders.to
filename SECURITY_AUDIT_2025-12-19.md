# Security Audit Report - builders.to

**Audit Date:** 2025-12-19
**Auditor:** Automated Security Analysis (Claude)
**Project:** builders.to Next.js Application
**Framework:** Next.js 14.2.35, NextAuth v5-beta.30, Prisma 5.22.0

---

## Executive Summary

This comprehensive security audit examined the builders.to codebase across seven key areas: dependency vulnerabilities, OWASP Top 10 compliance, AI security, authentication/authorization, infrastructure configuration, database security, and third-party vendor risks.

### Risk Overview

| Severity | Count | Key Issues |
|----------|-------|------------|
| **Critical** | 4 | Wildcard image domains, no rate limiting, IDOR in image reordering, file extension bypass |
| **High** | 6 | Missing security headers, NextAuth beta in production, session timeout, input validation |
| **Medium** | 8 | CSRF config, trustHost setting, query logging, markdown sanitization |
| **Low** | 4 | Deprecated packages, account enumeration, documentation |

**Overall Security Score: 6/10** - Application requires fixes before production deployment.

---

## Critical Findings

### 1. IDOR Vulnerability in Image Reordering (CRITICAL)
**File:** `src/app/api/projects/[id]/images/route.ts:167-175`

**Issue:** Image reordering doesn't verify that provided imageIds belong to the project. An attacker can manipulate images from ANY project.

```typescript
// VULNERABLE CODE
await Promise.all(
  imageIds.map((imageId: string, index: number) =>
    prisma.projectImage.update({
      where: { id: imageId },  // No projectId verification!
      data: { order: index },
    })
  )
);
```

**Fix:**
```typescript
// First verify all images belong to this project
const images = await prisma.projectImage.findMany({
  where: { id: { in: imageIds }, projectId: id }
});
if (images.length !== imageIds.length) {
  return NextResponse.json({ error: "Invalid image IDs" }, { status: 400 });
}
```

---

### 2. Wildcard Image Domain in Next.js Config (CRITICAL)
**File:** `next.config.mjs:23`

**Issue:** Next.js Image component allows images from ANY domain:
```javascript
{ protocol: 'https', hostname: '**' }  // DANGEROUS
```

**Risk:** SSRF attacks, malicious content hosting, bandwidth abuse.

**Fix:** Replace with explicit domain allowlist:
```javascript
remotePatterns: [
  { protocol: 'https', hostname: 'cdn.discordapp.com' },
  { protocol: 'https', hostname: 'pbs.twimg.com' },
  { protocol: 'https', hostname: 'abs.twimg.com' },
]
```

---

### 3. No Rate Limiting on API Endpoints (CRITICAL)
**Files:** All API routes in `src/app/api/`

**Issue:** No rate limiting on any endpoint, including:
- `/api/upload` - File uploads
- `/api/comments` - Comment spam
- `/api/upvotes` - Vote manipulation
- `/api/projects` - Project creation

**Risk:** DoS attacks, spam, storage exhaustion, brute force.

**Fix:** Implement rate limiting using `@upstash/ratelimit`:
```typescript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

---

### 4. File Extension Bypass in Upload (CRITICAL)
**File:** `src/app/api/upload/route.ts:75-76`

**Issue:** File extension derived from user-provided filename:
```typescript
const ext = file.name.split(".").pop() || "jpg";  // User controlled!
```

**Risk:** Malicious file uploads (e.g., `image.php.jpg`).

**Fix:**
```typescript
const MIME_TO_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp' };
const ext = MIME_TO_EXT[file.type];
```

---

## High Severity Findings

### 5. Missing Security Headers (HIGH)
**File:** `next.config.mjs`

**Issue:** No security headers configured (CSP, X-Frame-Options, HSTS, X-Content-Type-Options).

**Fix:** Add headers configuration:
```javascript
async headers() {
  return [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

---

### 6. NextAuth Beta in Production (HIGH)
**File:** `package.json`

**Issue:** Using `next-auth@5.0.0-beta.30` - beta software in production carries unknown vulnerability risks.

**Fix:** Monitor for stable v5 release or use stable v4.x.

---

### 7. Missing Session Timeout Configuration (HIGH)
**File:** `src/lib/auth.ts:9`

**Issue:** No explicit session expiration configured:
```typescript
session: { strategy: "jwt" }  // Missing maxAge
```

**Fix:**
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,  // 30 days
  updateAge: 24 * 60 * 60,    // 24 hours
}
```

---

### 8. Verbose Error Logging (HIGH)
**Files:** All API routes

**Issue:** Error details logged to console may expose stack traces, schema info in production.

**Fix:** Use structured logging service with sensitive data filtering.

---

### 9. ESLint Deprecated (HIGH)
**Package:** `eslint@8.57.1`

**Issue:** ESLint 8.x is deprecated and no longer receives security patches.

**Fix:** `npm install eslint@^9 eslint-config-next@latest --save-dev`

---

### 10. No Input Length Validation (HIGH)
**Files:** `src/app/api/comments/route.ts`, `src/app/api/projects/route.ts`

**Issue:** User content (comments, descriptions) stored without length limits.

**Fix:**
```typescript
if (content.length > 10000) {
  return NextResponse.json({ error: "Content too long" }, { status: 400 });
}
```

---

## Medium Severity Findings

### 11. trustHost Set to True (MEDIUM)
**File:** `src/lib/auth.ts:37`

**Issue:** `trustHost: true` bypasses host verification. Acceptable for Render.com but should be documented.

---

### 12. Missing Markdown Sanitization (MEDIUM)
**File:** `src/app/projects/[slug]/page.tsx:202`

**Issue:** ReactMarkdown used without explicit sanitization plugin.

**Fix:** Add `rehype-sanitize`:
```typescript
import rehypeSanitize from 'rehype-sanitize';
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>{content}</ReactMarkdown>
```

---

### 13. Query Logging in Development (MEDIUM)
**File:** `src/lib/prisma.ts:10`

**Issue:** Development logging may expose PII in query parameters.

---

### 14. Missing URL Validation (MEDIUM)
**Files:** Project creation/update routes

**Issue:** Project URLs not validated for `javascript:` protocol or XSS vectors.

---

### 15. No Image Upload Limits (MEDIUM)
**File:** `src/app/api/projects/[id]/images/route.ts`

**Issue:** No limit on images per request or per project.

**Fix:** Add `MAX_IMAGES_PER_PROJECT = 50` validation.

---

### 16. Deprecated Packages (MEDIUM)
**Packages:** `inflight`, `rimraf@3`, `json5@1.0.2`

**Issue:** Memory leaks (inflight), known CVE (json5).

**Fix:** Update parent packages or run `npm audit fix`.

---

### 17. Missing Environment Validation (MEDIUM)
**File:** `src/lib/auth.ts:12-17`

**Issue:** OAuth credentials accessed with `!` assertion without validation.

---

### 18. Company Association Race Condition (MEDIUM)
**File:** `src/app/api/projects/route.ts:146-158`

**Issue:** Company ownership validated before creation - potential race condition.

**Fix:** Use database transaction for atomicity.

---

## Low Severity Findings

### 19. No Security Event Logging (LOW)
**Issue:** Failed auth attempts, authorization failures not logged.

### 20. No CORS Configuration (LOW)
**Status:** Currently secure (same-origin default).

### 21. Account Enumeration (LOW)
**Status:** Mitigated by OAuth-only authentication.

### 22. Render Database IP Allowlist (LOW)
**Status:** Acceptable for internal networking.

---

## Positive Security Findings

| Area | Status | Notes |
|------|--------|-------|
| SQL Injection Prevention | ✅ PASS | Prisma ORM used exclusively, no raw SQL |
| Resource Ownership Checks | ✅ PASS | Consistent userId verification on mutations |
| Path Traversal Protection | ✅ PASS | File serving validates paths correctly |
| Cascade Deletes | ✅ PASS | Properly configured in Prisma schema |
| Secret Management | ✅ PASS | .env files in .gitignore |
| React XSS Protection | ✅ PASS | No dangerouslySetInnerHTML found |
| AI Security | ✅ N/A | No AI integrations detected |

---

## Vendor Risk Assessment

| Vendor | Risk Level | Key Concerns |
|--------|------------|--------------|
| NextAuth (Auth.js) | **HIGH** | Beta version, OAuth tokens stored plaintext |
| Prisma | LOW-MEDIUM | SOC 2 compliant, recent version |
| Discord API | LOW | SOC 2 certified, stable OAuth |
| Twitter/X API | MEDIUM | Platform instability, reliability concerns |
| Render.com | LOW-MEDIUM | SOC 2 certified, free tier limitations |
| Sharp | MEDIUM-HIGH | Image processing library, potential CVEs |

---

## Prioritized Fix Order

### Week 1 (Critical)
1. Fix IDOR in image reordering
2. Remove wildcard image domains
3. Implement rate limiting on sensitive endpoints
4. Fix file extension validation

### Week 2 (High)
5. Add security headers
6. Configure session timeouts
7. Add input length validation
8. Upgrade ESLint to v9

### Month 1 (Medium)
9. Add markdown sanitization
10. Implement URL validation
11. Add environment variable validation
12. Fix deprecated packages
13. Add image upload limits

### Quarter 1 (Low/Monitoring)
14. Add security event logging
15. Document security decisions
16. Regular dependency audits
17. Consider stable NextAuth version

---

## SOC2 Relevance Notes

| Trust Service Criteria | Findings |
|----------------------|----------|
| **Security** | Missing rate limiting, IDOR vulnerability, no security headers |
| **Availability** | No redundancy, single-region deployment |
| **Processing Integrity** | Race condition in company validation |
| **Confidentiality** | Query logging may expose PII, OAuth tokens stored plaintext |
| **Privacy** | User data in US region, proper access controls on mutations |

---

## Files Reviewed

### Configuration
- `next.config.mjs`
- `render.yaml`
- `.gitignore`
- `.env.example`
- `prisma/schema.prisma`
- `package.json`

### Application Code
- `src/lib/auth.ts`
- `src/lib/prisma.ts`
- `src/lib/utils.ts`
- `src/middleware.ts`
- All routes in `src/app/api/**/*.ts`
- Key components in `src/components/**`

---

## Conclusion

The builders.to application has a solid foundation with good practices in SQL injection prevention, resource ownership verification, and React XSS protection. However, **critical vulnerabilities in access control (IDOR), infrastructure configuration (wildcard domains, no rate limiting), and file upload handling must be addressed before production deployment.**

The most urgent fix is the IDOR vulnerability in image reordering, which could allow attackers to manipulate other users' data.

---

**Report Generated:** 2025-12-19
**Next Audit Recommended:** After critical fixes are deployed

