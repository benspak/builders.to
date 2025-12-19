# Security Audit Command

Run a comprehensive security audit focused on code review, SOC2 awareness, and vendor risk assessment.

## What To Do

1. **Launch parallel agents for each area:**

### Agent 1: Dependency & CVE Scan
- Run `npm audit`
- Check for known CVEs in dependencies
- Flag outdated packages with security implications
- Check for deprecated/unmaintained packages

### Agent 2: OWASP Top 10 Review
- **Injection** - SQL, NoSQL, command injection vectors
- **Broken Authentication** - session management, credential storage, brute force protection
- **Sensitive Data Exposure** - data in transit, at rest, logging sensitive info
- **Broken Access Control** - authorization checks, privilege escalation paths
- **Security Misconfiguration** - default configs, error handling exposing info, unnecessary features
- **Cross-Site Scripting (XSS)** - input sanitization, output encoding
- **Insecure Deserialization** - if applicable
- **Insufficient Logging & Monitoring** - security events logged, audit trails

### Agent 3: AI Security (Run only if AI features detected in codebase)
First scan for AI integrations (OpenAI, Anthropic, etc.). If found:
- **Prompt injection** - can user input manipulate AI behavior?
- **Data leakage** - can AI be tricked into revealing other users' data, system prompts, or internal info?
- **Embedding poisoning** - can malicious knowledge base content affect responses?
- **Rate limiting on AI endpoints** - prevent abuse/cost attacks
- **Input validation** - length limits, content filtering before AI processing

If no AI features detected, skip this section and note "No AI integrations found" in the report.

### Agent 4: Auth & Access Control Deep Dive
- NextAuth/Auth.js implementation (OAuth providers, session strategy, callbacks)
- Session management (timeout, invalidation, cookie settings)
- API route protection (auth checks on all protected endpoints)
- Resource ownership checks (users can only edit their own projects/companies)
- CSRF protection (Next.js built-in + any custom measures)

### Agent 5: Infrastructure & Config
- **CORS configuration** - overly permissive origins?
- **Rate limiting** - sensitive endpoints covered?
- **Security headers** - CSP, X-Frame-Options, X-Content-Type-Options, HSTS, etc.
- **HTTPS enforcement** - redirects, HSTS
- **File upload security** - type validation, size limits, storage location, path traversal prevention
- **Environment variables** - secrets management, .env in .gitignore
- **render.yaml / deployment configs** - exposed secrets, insecure defaults
- **next.config.mjs** - image domains, redirects, headers

### Agent 6: Database Security (Prisma)
- Verify Prisma is used consistently (no raw SQL with string concatenation)
- Connection string handling (not in code, not logged)
- Row-level security (users can only access their own data via proper where clauses)
- Data exposure in API responses (no password hashes, tokens, etc. leaked)
- Cascade deletes configured properly

### Agent 7: Third-Party Vendor Risk Assessment
Scan codebase to identify all third-party services (check package.json, imports, env vars). For EACH vendor found:
- Search for recent CVEs, breaches, security incidents
- Check their SOC2/security certifications if relevant
- Assess what data they have access to
- Note any concerns

**Common vendors to check for (verify which are actually used):**
- NextAuth / Auth.js (authentication)
- Discord API (OAuth)
- Twitter/X API (OAuth)
- Prisma (ORM)
- Render.com (hosting)
- Stripe / Polar (payments - if present)
- Any analytics services
- Any logging/monitoring services

## Severity Levels

- **Critical** - Actively exploitable, data breach risk, fix immediately
- **High** - Significant risk, needs fix before next release
- **Medium** - Should be addressed, schedule for near-term
- **Low** - Minor issues, backlog

Include a prioritized "Fix Order" list - what to tackle first based on risk vs effort.

## SOC2 Awareness (Informational)

Flag findings relevant to SOC2 Trust Service Criteria for future reference:
- **Security** - protection against unauthorized access
- **Availability** - system uptime and recovery
- **Processing Integrity** - accurate and timely processing
- **Confidentiality** - protection of confidential information
- **Privacy** - PII handling

Note: SOC2 compliance is not currently required but flagging these items helps future-proof the codebase.

## Output

1. Create `SECURITY_AUDIT_{date}.md` in project root (use actual date, e.g., `SECURITY_AUDIT_2025-12-19.md`)
2. Include:
   - Executive summary with risk overview
   - Findings by category with severity levels
   - Specific file:line references for all code issues
   - Prioritized fix order (what to do first)
   - SOC2 relevance notes where applicable
   - Vendor risk assessment summary

3. After the report:
   - Give verbal summary of top findings
   - Provide a blurb for team groupchat (casual, FYI tone, under 280 chars, highlight anything urgent)

## Scope

- Application code (src/)
- Infrastructure configs (render.yaml, next.config.mjs)
- Prisma schema
- Middleware
- API routes

## Out of Scope

- Penetration testing / active exploitation
- Historical audits of previous fixes
- Compliance certification work (just flag SOC2-relevant items)

## No Code Changes
This is research only. Do not modify any files except creating the audit report.
