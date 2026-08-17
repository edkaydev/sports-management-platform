# 02 — Users and Roles

## Overview

The system uses **Role-Based Access Control (RBAC)** with exactly **two roles**:
`TUTOR` (Overall/Sports Tutor) and `SPORTS_REP` (Secretary of Sports on the
University Union). There are no athlete-facing logins; the public website is
available to all visitors without authentication.

---

## Roles

### 1. TUTOR (Sports Tutor / Overall)

The primary operator and overall owner of the system (e.g. the UMU Sports Tutor).

**Responsibilities:**
- Everything SPORTS_REP can do
- Create and manage user accounts
- Permanently delete core records (sports, teams, events, matches, seasons, athletes, news)
- Approve / publish sensitive state changes and verify match results
- Full system configuration

### 2. SPORTS_REP (Secretary of Sports, University Union)

Handles day-to-day sports content and operations on behalf of the Union.

**Responsibilities:**
- Create and edit all content: sports, teams, athletes, fixtures, results, events, news
- Manage squads and team staff assignments
- Record match events, lineups, and reports
- Manage recruitment prospects and trials
- Manage academic records, scholarships, contracts, and documents
- View and export all reports (JSON, CSV, and PDF)

**Restrictions:**
- Cannot create or manage user accounts
- Cannot permanently delete core records (tutor-only)
- Cannot approve/verify results or change core statuses that require tutor authority

---

## Role Permission Summary

| Operation | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create / edit content (athletes, teams, sports, fixtures, results, events, news) | ✅ | ✅ |
| Manage squads / staff / lineups / match events | ✅ | ✅ |
| Manage recruitment, academic, scholarships, contracts, documents | ✅ | ✅ |
| View & export reports (JSON / CSV / PDF) | ✅ | ✅ |
| Delete core records | ✅ | ❌ |
| Manage user accounts | ✅ | ❌ |
| Verify results / approve sensitive state changes | ✅ | ❌ |
| Public website (no login) | — | — |

---

## User Data Model

```
User
├── id (UUID)
├── full_name
├── email (unique)
├── password_hash
├── role (enum: TUTOR | SPORTS_REP)
├── is_active (boolean)
├── profile_photo_url
├── phone_number
├── created_at
├── updated_at
└── last_login_at
```

---

## Authentication

- JWT-based authentication (staff only)
- Access token: short-lived (15 minutes)
- Refresh token: long-lived (7 days)
- Passwords hashed with `bcrypt` (minimum 12 rounds)
- Account lockout after 5 consecutive failed login attempts
- Password change requires current password (no email-based reset in v1.0)

---

## Registration

Users are created via the seed script or database directly. There is no user management API in v1.0.

---

## Notes

- A user has exactly one role (`TUTOR` or `SPORTS_REP`)
- Role changes are performed by the TUTOR only
- The public site is open to everyone and never requires login
