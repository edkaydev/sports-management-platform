# 16 — Permissions and Security

## Overview

Security is enforced in layers: authentication (who you are) and authorisation (what role you have). Data scoping is simple because exactly two staff roles exist — no per-record scope restrictions apply.

---

## Authentication

### JWT Implementation

- Access token: signed HS256 JWT, 15 minute expiry
- Refresh token: signed HS256 JWT, 7 day expiry
- Access token transmitted in `Authorization: Bearer <token>` header
- Access token stored client-side in `localStorage`

### Token Payload

```json
{
  "sub": "<user_uuid>",
  "role": "TUTOR",
  "iat": 1723300000,
  "exp": 1723300900
}
```

### Password Policy

- Minimum 8 characters
- Must include at least one uppercase, one lowercase, one number
- Hashed with bcrypt, minimum cost factor 12
- Passwords are never logged or returned in API responses

### Account Lockout

- Account locked after 5 consecutive failed login attempts
- Lockout duration: 30 minutes (auto-unlock) or manual unlock by the TUTOR
- Failed attempt count resets on successful login

### Session Management

- On logout: refresh token revoked, access token discarded client-side
- Refresh tokens are stored in DB to support revocation:

```sql
CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL UNIQUE,  -- SHA-256 of the token
  expires_at  TIMESTAMP NOT NULL,
  revoked     BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## Authorisation — RBAC

Every API route declares the minimum role required. The auth middleware enforces this before the controller executes.

### Middleware Stack (per request)

```
Request
  → verifyToken()       — decodes and validates JWT
  → attachUser()        — loads user from DB, checks is_active
  → requireRole([...])  — checks role against allowed list
  → Controller
```

### Roles

```
TUTOR           (Sports Tutor / Overall — full access)
  └── SPORTS_REP  (Secretary of Sports, University Union — content editing)
```

`TUTOR` always passes all role checks. Content routes allow both `TUTOR` and
`SPORTS_REP`; delete, user-management, and verification routes allow `TUTOR` only.

---

## Data Scoping

No data scoping is required: both roles are department-level staff and see all
department data. The public website exposes a curated read-only set of endpoints
(`/api/public/*`) and requires no authentication.

---

## API Security

### Input Validation
- All request bodies validated with Zod schemas before reaching controllers
- Unknown fields stripped (no mass assignment)
- SQL injection prevented by Prisma parameterised queries (no raw SQL with user input)

### Rate Limiting
- Login endpoint: 10 requests / minute per IP
- General API: 200 requests / minute per authenticated user
- Implemented with `express-rate-limit`

### CORS
- Allowed origins: explicitly configured (not `*`)
- In production: only the frontend domain is allowed

### HTTP Security Headers
Applied via `helmet`:

```
Content-Security-Policy
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
Referrer-Policy: no-referrer
```

### File Upload Security
- MIME type validated server-side (not just extension)
- Files scanned for dangerous content (at minimum: reject executables)
- Files stored with UUID-based keys, not original filenames
- Pre-signed S3 URLs with 1-hour expiry for downloads

---

## Sensitive Data Handling

| Data | Protection |
|---|---|
| Passwords | bcrypt hashed, never returned in API |
| Refresh tokens | SHA-256 hashed before DB storage |
| Medical declarations | Staff-only (TUTOR / SPORTS_REP) |
| Academic records | Staff-only (see `08-academic-performance.md`) |
| Document files | Served via pre-signed URLs, never public |
| Scholarship details | Staff-only |
| Contract terms | Staff-only |

---

## Audit Logging

Every write operation (create, update, delete) is logged to the `audit_logs` table:

```
Action:       UPDATE_SCHOLARSHIP
Entity:       scholarship / <uuid>
User:         tutor@umu.ac.ug
Old value:    { status: 'ACTIVE', end_date: '2026-12-31' }
New value:    { status: 'REVOKED', revoked_at: '2026-08-11' }
IP:           197.x.x.x
Timestamp:    2026-08-11T16:00:00Z
```

Audit logs are:
- Write-only (cannot be edited or deleted)
- Retained indefinitely
- Accessible to the TUTOR only

---

## Security Checklist (pre-launch)

- [ ] All endpoints require authentication except `/api/auth/login`, `/api/auth/refresh`, and `/api/public/*`
- [ ] No sensitive data in JWT payload beyond `sub` and `role`
- [ ] HTTPS enforced in production (redirect HTTP → HTTPS)
- [ ] Database not publicly accessible (firewall rules)
- [ ] Environment variables not committed to version control
- [ ] No default/test credentials in production
- [ ] Dependency audit run (`npm audit`) before deployment
- [ ] File upload MIME validation enabled
- [ ] Rate limiting applied to login endpoint
- [ ] CORS restricted to frontend domain only
