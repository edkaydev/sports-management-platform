# 17 — API Specification

## Overview

REST API. All endpoints are prefixed with `/api`. All requests and responses use JSON. Authentication via `Authorization: Bearer <accessToken>` header on all protected routes.

---

## Response Envelope

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

### Paginated List
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 247,
    "totalPages": 13
  }
}
```

### Error
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Athlete not found"
}
```

### Common Error Codes
| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `CONFLICT` | 409 | Duplicate record |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Auth

### POST /api/auth/login
```
Body:   { email, password }
Returns: { accessToken, user: { id, fullName, email, role } }
Sets:   httpOnly refreshToken cookie
Access: Public
```

### POST /api/auth/refresh
```
Reads:  refreshToken cookie
Returns: { accessToken }
Access: Public (uses cookie)
```

### POST /api/auth/logout
```
Clears: refreshToken cookie, revokes refresh token in DB
Access: Authenticated
```

### POST /api/auth/change-password
```
Body:   { currentPassword, newPassword }
Access: Authenticated (own account)
```

---

## Users

### GET /api/users
```
Query: page, pageSize, role, isActive
Returns: paginated user list
Access: SUPER_ADMIN
```

### POST /api/users
```
Body:   { fullName, email, role, phoneNumber }
Returns: created user (system sends invite email)
Access: SUPER_ADMIN
```

### GET /api/users/:id
```
Returns: user record
Access: SUPER_ADMIN | own account
```

### PATCH /api/users/:id
```
Body:   { fullName, phoneNumber, isActive }
Access: SUPER_ADMIN | own account (limited fields)
```

### DELETE /api/users/:id
```
Soft deletes user
Access: SUPER_ADMIN
```

---

## Athletes

### GET /api/athletes
```
Query: page, pageSize, sport, team, athleteType, status, gender, yearOfStudy, faculty, search
Returns: paginated athlete list
Access: SPORTS_ADMIN, COACH (own team only)
```

### POST /api/athletes
```
Body:   registration form fields (see 03-student-athlete-management.md)
Returns: created athlete
Access: SPORTS_ADMIN
```

### GET /api/athletes/:id
```
Returns: full athlete record
Access: SPORTS_ADMIN, COACH (own team), ATHLETE (own)
```

### GET /api/athletes/:id/profile
```
Returns: full 360° profile (athlete + sport + academics + scholarship + contract + docs summary)
Access: SPORTS_ADMIN, COACH (own team), ATHLETE (own)
```

### PATCH /api/athletes/:id
```
Body:   updatable fields
Access: SPORTS_ADMIN
```

### DELETE /api/athletes/:id
```
Soft delete
Access: SPORTS_ADMIN
```

### GET /api/athletes/:id/academic-records
```
Returns: all academic records for athlete
Access: SPORTS_ADMIN, ACADEMIC, COACH (summary only), ATHLETE (own)
```

### GET /api/athletes/:id/scholarships
```
Returns: all scholarship records
Access: SPORTS_ADMIN, ATHLETE (own)
```

### GET /api/athletes/:id/contracts
```
Returns: all contract records
Access: SPORTS_ADMIN, ATHLETE (own)
```

### GET /api/athletes/:id/documents
```
Returns: all documents for athlete
Access: SPORTS_ADMIN, ATHLETE (own)
```

### GET /api/athletes/:id/performance
```
Query: season, sport
Returns: aggregated season stats
Access: SPORTS_ADMIN, COACH (own team), ATHLETE (own)
```

---

## Sports & Teams

### GET /api/sports
```
Returns: all active sports
Access: Authenticated
```

### POST /api/sports
```
Body: { name, gender, category, description }
Access: SPORTS_ADMIN
```

### GET /api/teams
```
Query: sport, season, isActive
Returns: team list
Access: Authenticated
```

### POST /api/teams
```
Body: { name, shortName, sportId, seasonId, gender, homeVenue }
Access: SPORTS_ADMIN
```

### GET /api/teams/:id
```
Returns: team with current squad and staff
Access: Authenticated
```

### GET /api/teams/:id/squad
```
Query: season
Returns: team roster
Access: Authenticated
```

### POST /api/teams/:id/squad
```
Body: { athleteId, position, jerseyNumber, isCaptain }
Access: SPORTS_ADMIN, COACH (own team)
```

### DELETE /api/teams/:id/squad/:athleteId
```
Access: SPORTS_ADMIN
```

---

## Events & Competitions

### GET /api/events
```
Query: type, level, sport, season, status, from, to
Returns: paginated event list
Access: Authenticated
```

### POST /api/events
```
Body: event fields (see 05-events-and-competitions.md)
Access: SPORTS_ADMIN
```

### GET /api/events/:id
```
Returns: event with participants, fixtures
Access: Authenticated
```

### PATCH /api/events/:id
```
Access: SPORTS_ADMIN
```

### GET /api/events/:id/standings
```
Returns: group standings
Access: Authenticated
```

---

## Matches / Fixtures

### GET /api/matches
```
Query: event, team, sport, status, from, to, page, pageSize
Returns: paginated match list
Access: Authenticated
```

### POST /api/matches
```
Body: match fields (see 06-fixtures-and-match-management.md)
Access: SPORTS_ADMIN
```

### GET /api/matches/:id
```
Returns: match with lineup, events, result
Access: Authenticated
```

### PATCH /api/matches/:id/status
```
Body: { status }
Access: SPORTS_ADMIN, OFFICIAL
```

### POST /api/matches/:id/lineup
```
Body: { teamId, entries: [{ athleteId, position, jerseyNumber, isStarter }] }
Access: SPORTS_ADMIN, COACH (own team)
```

### POST /api/matches/:id/events
```
Body: { eventType, minute, teamId, athleteId, secondaryAthleteId, details }
Access: SPORTS_ADMIN, COACH, OFFICIAL
```

### POST /api/matches/:id/result
```
Body: { homeScore, awayScore, resultType, walkover }
Access: SPORTS_ADMIN, OFFICIAL
```

### POST /api/matches/:id/report
```
Body: { summary, mvpAthleteId, attendanceCount, notableIncidents, coachingNotes }
Access: SPORTS_ADMIN, COACH, OFFICIAL
```

---

## Academic Records

### GET /api/academic-records
```
Query: athleteId, academicYear, semester, standing
Access: SPORTS_ADMIN, ACADEMIC
```

### POST /api/academic-records
```
Body: { athleteId, academicYear, semester, gpa, cgpa, failedUnits, attendance, notes }
Access: SPORTS_ADMIN, ACADEMIC
```

### PATCH /api/academic-records/:id
```
Access: SPORTS_ADMIN, ACADEMIC
```

### POST /api/academic-records/import
```
Body: multipart/form-data (CSV file)
Access: SPORTS_ADMIN, ACADEMIC
```

---

## Scholarships

### GET /api/scholarships
```
Query: athleteId, status, type, expiringWithin
Returns: paginated scholarship list
Access: SPORTS_ADMIN
```

### POST /api/scholarships
```
Body: scholarship fields
Access: SPORTS_ADMIN
```

### PATCH /api/scholarships/:id
```
Access: SPORTS_ADMIN
```

### POST /api/scholarships/:id/renew
```
Body: { newEndDate, notes }
Access: SPORTS_ADMIN
```

### POST /api/scholarships/:id/revoke
```
Body: { reason }
Access: SPORTS_ADMIN
```

---

## Contracts

### GET /api/contracts
```
Query: athleteId, status, expiringWithin
Access: SPORTS_ADMIN
```

### POST /api/contracts
```
Body: contract fields
Access: SPORTS_ADMIN
```

### PATCH /api/contracts/:id
```
Access: SPORTS_ADMIN
```

### POST /api/contracts/:id/terminate
```
Body: { terminationDate, reason }
Access: SPORTS_ADMIN
```

---

## Recruitment

### GET /api/prospects
```
Query: sport, status, source, search
Access: SPORTS_ADMIN, RECRUITER
```

### POST /api/prospects
```
Body: prospect fields
Access: SPORTS_ADMIN, RECRUITER
```

### GET /api/trials
```
Query: sport, status, from, to
Access: SPORTS_ADMIN, COACH, RECRUITER
```

### POST /api/trials
```
Body: trial fields
Access: SPORTS_ADMIN, RECRUITER
```

### POST /api/trials/:id/assessments
```
Body: assessment fields per prospect
Access: SPORTS_ADMIN, COACH, RECRUITER
```

### POST /api/prospects/:id/enroll
```
Converts prospect to student-athlete
Access: SPORTS_ADMIN
```

---

## Documents

### GET /api/documents
```
Query: athleteId, category, status, ownerType, search
Access: SPORTS_ADMIN
```

### POST /api/documents
```
Body: multipart/form-data (file + metadata)
Access: SPORTS_ADMIN, COACH (team docs), ATHLETE (own docs)
```

### GET /api/documents/:id/download
```
Returns: pre-signed URL (60 min expiry)
Access: Role-dependent
```

### DELETE /api/documents/:id
```
Access: SPORTS_ADMIN
```

---

## Notifications

### GET /api/notifications
```
Query: isRead, severity
Returns: notifications for current user
Access: Authenticated
```

### PATCH /api/notifications/:id/read
```
Marks notification as read
Access: Own notifications only
```

### PATCH /api/notifications/read-all
```
Marks all as read for current user
Access: Authenticated
```

---

## Reports

### GET /api/reports/department-overview
```
Access: SPORTS_ADMIN, UNI_ADMIN
```

### GET /api/reports/athletes
```
Query: filters + format (json | csv | pdf)
Access: SPORTS_ADMIN
```

### GET /api/reports/academic-standing
```
Query: sport, team, semester, format
Access: SPORTS_ADMIN, ACADEMIC
```

### GET /api/reports/scholarships
```
Query: status, format
Access: SPORTS_ADMIN, UNI_ADMIN
```

### GET /api/reports/match-results
```
Query: sport, team, event, from, to, format
Access: SPORTS_ADMIN, COACH, UNI_ADMIN
```

### GET /api/reports/player-performance
```
Query: athleteId, team, season, format
Access: SPORTS_ADMIN, COACH
```
