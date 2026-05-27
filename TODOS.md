# TODOS

## Rate limiting on auth endpoints
- **What:** Add rate limiting to POST /api/auth/login and POST /api/auth/register (5 attempts/IP/minute)
- **Why:** Prevents brute force attacks on login. bcryptjs's 200ms hashing helps but isn't enough alone
- **Pros:** 15 lines with express-rate-limit, protects internet-facing auth from day one
- **Cons:** Adds one dependency (express-rate-limit)
- **Priority:** P1 — build before opening to real users
- **Depends on:** Auth routes being implemented first

## Password reset flow
- **What:** Email-based password reset: POST /api/auth/forgot-password (sends email with reset token) + POST /api/auth/reset-password (consumes token + sets new password)
- **Why:** Users will forget passwords. Without this, the only recovery is manual DB intervention
- **Pros:** Completes the auth loop, removes a support burden, expected by users
- **Cons:** Requires email sending infrastructure (SMTP/SendGrid), adds ~3 new routes + a UI page
- **Priority:** P2 — build before marketing to external users
- **Depends on:** Auth routes + email configuration

## Token refresh mechanism
- **What:** Add refresh tokens (stored in httpOnly cookie) + POST /api/auth/refresh endpoint, so users don't re-login when JWT expires
- **Why:** Simple JWT without refresh means users get logged out when token expires, which is a bad UX surprise
- **Pros:** Transparent session extension, better UX, can use shorter-lived access tokens (15min vs 24h)
- **Cons:** Adds complexity to auth flow, requires cookie handling in CORS config
- **Priority:** P3 — nice to have, not blocking
- **Depends on:** Auth routes

## Image cleanup on project delete
- **What:** When a project is deleted, also delete its image file from the filesystem
- **Why:** Orphaned files accumulate disk space over time
- **Pros:** Keeps disk usage honest, easy to implement (fs.unlink in delete handler)
- **Cons:** Risk of accidental data loss if delete is called incorrectly
- **Priority:** P3 — defer until there's a project delete feature
- **Depends on:** Project delete endpoint
