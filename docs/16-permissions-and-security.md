# 16 — Permissions and Security

## Overview

Security is enforced at three layers: authentication (who you are), authorisation (what role you have), and data scoping (which records you can access within your role).

---

## Authentication

### JWT Implementation

- Access token: signed HS256 JWT, 15 minute expiry
- Refresh token: signed HS256 JWT, 7 day expiry, stored in `httpOnly; Secure; SameSite=Strict` cookie
- Access token transmitted in `Authorization: Bearer <token>` header
- Access token stored in memory only (never `localStorage` or `sessionStorage`)

### Token Payload

```json
{
  "sub": "<user_uuid>",
  "role": "SPORTS_ADMIN",
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
- Lockout duration: 30 minutes (auto-unlock) or manual unlock by SUPER_ADMIN
- Failed attempt count resets on successful login

### Session Management

- On logout: refresh token cookie is cleared, access token discarded client-side
- SUPER_ADMIN can invalidate all sessions for a user (force logout)
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
  → scopeCheck()        — checks data-level scope (own team, own data)
  → Controller
```

### Role Hierarchy (for inheritance checks)

```
SUPER_ADMIN
  └── SPORTS_ADMIN
        ├── COACH
        ├── TEAM_MANAGER
        ├── OFFICIAL
        ├── RECRUITER
        └── ACADEMIC
              └── ATHLETE
```

`SUPER_ADMIN` and `SPORTS_ADMIN` implicitly pass all role checks.

---

## Data Scoping

Beyond role-level checks, the system enforces **data scoping** — a COACH can only see/edit data for their assigned teams.

### Scope Rules

| Role | Scope Restriction |
|---|---|
| COACH | Can only access athletes and matches in their assigned teams |
| TEAM_MANAGER | Can only access data for their assigned team |
| OFFICIAL | Can only record match events for matches they are assigned to |
| ACADEMIC | Can only enter academic data for athletes in their faculty |
| ATHLETE | Can only read their own profile, performance, documents |
| RECRUITER | Can only access prospects and trials they created or are assigned to |

Scope is enforced in the **service layer**, not just middleware, so it cannot be bypassed by direct DB calls.

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
| Medical declarations | Only accessible to SPORTS_ADMIN and the athlete |
| Academic records | Role-restricted (see `08-academic-performance.md`) |
| Document files | Served via pre-signed URLs, never public |
| Scholarship details | Not visible to COACH or TEAM_MANAGER |
| Contract terms | SPORTS_ADMIN only |

---

## Audit Logging

Every write operation (create, update, delete) is logged to the `audit_logs` table:

```
Action:       UPDATE_SCHOLARSHIP
Entity:       scholarship / <uuid>
User:         sports_admin@umu.ac.ug
Old value:    { status: 'ACTIVE', end_date: '2026-12-31' }
New value:    { status: 'REVOKED', revoked_at: '2026-08-11' }
IP:           197.x.x.x
Timestamp:    2026-08-11T16:00:00Z
```

Audit logs are:
- Write-only (cannot be edited or deleted, even by SUPER_ADMIN)
- Retained indefinitely
- Accessible to SUPER_ADMIN only

---

## Security Checklist (pre-launch)

- [ ] All endpoints require authentication except `/api/auth/login` and `/api/auth/refresh`
- [ ] No sensitive data in JWT payload beyond `sub` and `role`
- [ ] HTTPS enforced in production (redirect HTTP → HTTPS)
- [ ] Database not publicly accessible (firewall rules)
- [ ] Environment variables not committed to version control
- [ ] No default/test credentials in production
- [ ] Dependency audit run (`npm audit`) before deployment
- [ ] File upload MIME validation enabled
- [ ] Rate limiting applied to login endpoint
- [ ] CORS restricted to frontend domain only
