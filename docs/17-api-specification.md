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
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/auth/change-password
```
Body:   { currentPassword, newPassword }
Access: Authenticated (TUTOR, SPORTS_REP)
```

---

## Athletes

### GET /api/athletes
```
Query: page, pageSize, sport, team, athleteType, status, gender, yearOfStudy, faculty, search
Returns: paginated athlete list
Access: TUTOR, SPORTS_REP
```

### POST /api/athletes
```
Body:   registration form fields (see 03-student-athlete-management.md)
Returns: created athlete
Access: TUTOR, SPORTS_REP
```

### GET /api/athletes/:id
```
Returns: full athlete record
Access: TUTOR, SPORTS_REP
```

### GET /api/athletes/:id/profile
```
Returns: full 360° profile (athlete + sport + academics + scholarship + contract + docs summary)
Access: TUTOR, SPORTS_REP
```

### PATCH /api/athletes/:id
```
Body:   updatable fields
Access: TUTOR, SPORTS_REP
```

### DELETE /api/athletes/:id
```
Soft delete
Access: TUTOR
```

> Note: Related records (academic, scholarships, contracts, documents, performance) are queried via their own endpoints with `athleteId` filter.

---

## Sports & Teams

### GET /api/sports
```
Returns: all active sports
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/sports
```
Body: { name, gender, category, description }
Access: TUTOR, SPORTS_REP
```

### GET /api/teams
```
Query: sport, season, isActive
Returns: team list
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/teams
```
Body: { name, shortName, sportId, seasonId, gender, homeVenue }
Access: TUTOR, SPORTS_REP
```

### GET /api/teams/:id
```
Returns: team with current squad and staff
Access: Authenticated (TUTOR, SPORTS_REP)
```

### GET /api/teams/:id/squad
```
Query: season
Returns: team roster
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/teams/:id/squad
```
Body: { athleteId, position, jerseyNumber, isCaptain }
Access: TUTOR, SPORTS_REP
```

### DELETE /api/teams/:id/squad/:athleteId
```
Access: TUTOR
```

---

## Seasons

### GET /api/seasons
```
Returns: all seasons
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/seasons
```
Body: { name, startDate, endDate, isCurrent }
Access: TUTOR
```

### PATCH /api/seasons/:id
```
Access: TUTOR
```

---

## Events & Competitions

### GET /api/events
```
Query: type, level, sport, season, status, from, to
Returns: paginated event list
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/events
```
Body: event fields (see 05-events-and-competitions.md)
Access: TUTOR, SPORTS_REP
```

### GET /api/events/:id
```
Returns: event with participants, fixtures
Access: Authenticated (TUTOR, SPORTS_REP)
```

### PATCH /api/events/:id
```
Access: TUTOR, SPORTS_REP
```

### GET /api/events/:id/standings
```
Returns: group standings
Access: Authenticated (TUTOR, SPORTS_REP)
```

---

## Matches / Fixtures

### GET /api/matches
```
Query: event, team, sport, status, from, to, page, pageSize
Returns: paginated match list
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/matches
```
Body: match fields (see 06-fixtures-and-match-management.md)
Access: TUTOR, SPORTS_REP
```

### GET /api/matches/:id
```
Returns: match with lineup, events, result
Access: Authenticated (TUTOR, SPORTS_REP)
```

### PATCH /api/matches/:id/status
```
Body: { status }
Access: TUTOR, SPORTS_REP
```

### POST /api/matches/:id/lineup
```
Body: { teamId, entries: [{ athleteId, position, jerseyNumber, isStarter }] }
Access: TUTOR, SPORTS_REP
```

### POST /api/matches/:id/events
```
Body: { eventType, minute, teamId, athleteId, secondaryAthleteId, details }
Access: TUTOR, SPORTS_REP
```

### POST /api/matches/:id/result
```
Body: { homeScore, awayScore, resultType, walkover }
Access: TUTOR, SPORTS_REP
```

### POST /api/matches/:id/report
```
Body: { summary, mvpAthleteId, attendanceCount, notableIncidents, coachingNotes }
Access: TUTOR, SPORTS_REP
```

---

## Performance

### GET /api/performances
```
Query: athleteId, matchId, teamId, seasonId, sportId
Access: TUTOR, SPORTS_REP
```

### POST /api/performances
```
Body: { athleteId, matchId, teamId, seasonId, sportId, ...stats }
Access: TUTOR, SPORTS_REP
```

### GET /api/training-sessions
```
Query: sportId, teamId, seasonId, status
Access: TUTOR, SPORTS_REP
```

### POST /api/training-sessions
```
Body: { sportId, teamId, seasonId, title, location, focusAreas, intensity }
Access: TUTOR, SPORTS_REP
```

---

## Academic Records

### GET /api/academic-records
```
Query: athleteId, academicYear, semester, standing
Access: TUTOR, SPORTS_REP
```

### POST /api/academic-records
```
Body: { athleteId, academicYear, semester, gpa, cgpa, failedUnits, attendance, notes }
Access: TUTOR, SPORTS_REP
```

### PATCH /api/academic-records/:id
```
Access: TUTOR, SPORTS_REP
```

### POST /api/academic-records/import
```
Body: multipart/form-data (CSV file)
Access: TUTOR, SPORTS_REP
```

---

## Scholarships

### GET /api/scholarships
```
Query: athleteId, status, type, expiringWithin
Returns: paginated scholarship list
Access: TUTOR, SPORTS_REP
```

### POST /api/scholarships
```
Body: scholarship fields
Access: TUTOR, SPORTS_REP
```

### PATCH /api/scholarships/:id
```
Access: TUTOR, SPORTS_REP
```

### POST /api/scholarships/:id/renew
```
Body: { newEndDate, notes }
Access: TUTOR, SPORTS_REP
```

### POST /api/scholarships/:id/revoke
```
Body: { reason }
Access: TUTOR, SPORTS_REP
```

---

## Contracts

### GET /api/contracts
```
Query: athleteId, status, expiringWithin
Access: TUTOR, SPORTS_REP
```

### POST /api/contracts
```
Body: contract fields
Access: TUTOR, SPORTS_REP
```

### PATCH /api/contracts/:id
```
Access: TUTOR, SPORTS_REP
```

### POST /api/contracts/:id/terminate
```
Body: { terminationDate, reason }
Access: TUTOR, SPORTS_REP
```

---

## Recruitment

### GET /api/recruitment/prospects
```
Query: sport, status, source, search
Access: TUTOR, SPORTS_REP
```

### POST /api/recruitment/prospects
```
Body: prospect fields
Access: TUTOR, SPORTS_REP
```

### GET /api/recruitment/trials
```
Query: sport, status, from, to
Access: TUTOR, SPORTS_REP
```

### POST /api/recruitment/trials
```
Body: trial fields
Access: TUTOR, SPORTS_REP
```

### POST /api/recruitment/trials/:id/assessments
```
Body: assessment fields per prospect
Access: TUTOR, SPORTS_REP
```

### PATCH /api/recruitment/trials/:id/attendance
```
Body: { athleteId, attended }
Access: TUTOR, SPORTS_REP
```

### POST /api/recruitment/prospects/:id/enroll
```
Converts prospect to student-athlete
Access: TUTOR, SPORTS_REP
```

### GET /api/recruitment/report
```
Query: sport, season, format
Returns: recruitment summary report
Access: TUTOR, SPORTS_REP
```

---

## Documents

### GET /api/documents
```
Query: athleteId, category, status, ownerType, search
Access: TUTOR, SPORTS_REP
```

### POST /api/documents
```
Body: multipart/form-data (file + metadata)
Access: TUTOR, SPORTS_REP
```

### GET /api/documents/:id/download
```
Returns: pre-signed URL (60 min expiry)
Access: TUTOR, SPORTS_REP
```

### DELETE /api/documents/:id
```
Access: TUTOR
```

### PATCH /api/documents/:id/verify
```
Body: { isVerified }
Access: TUTOR
```

### GET /api/documents/athletes/:athleteId/checklist
```
Returns: document completeness checklist for athlete
Access: TUTOR, SPORTS_REP
```

---

## Notifications

### GET /api/notifications
```
Query: isRead, severity
Returns: notifications for current user
Access: Authenticated (TUTOR, SPORTS_REP)
```

### PATCH /api/notifications/:id/read
```
Marks notification as read
Access: Own notifications only
```

### PATCH /api/notifications/read-all
```
Marks all as read for current user
Access: Authenticated (TUTOR, SPORTS_REP)
```

---

## Reports

### GET /api/reports/overview
```
Access: TUTOR, SPORTS_REP
```

### GET /api/reports/athletes
```
Query: filters + format (json | csv | pdf)
Access: TUTOR, SPORTS_REP
```

### GET /api/reports/academic-standing
```
Query: sport, team, semester, format
Access: TUTOR, SPORTS_REP
```

### GET /api/reports/scholarships
```
Query: status, format
Access: TUTOR, SPORTS_REP
```

### GET /api/reports/contracts
```
Query: status, format
Access: TUTOR, SPORTS_REP
```

### GET /api/reports/fixtures
```
Query: sport, team, from, to, format
Access: TUTOR, SPORTS_REP
```

---

## Equipment (TUTOR only)

### GET /api/equipment
```
Query: search, category, status
Returns: paginated equipment list
Access: TUTOR
```

### POST /api/equipment
```
Body: { name, category, description, quantity, condition, purchaseDate }
Access: TUTOR
```

### PATCH /api/equipment/:id
```
Access: TUTOR
```

### DELETE /api/equipment/:id
```
Access: TUTOR
```

### POST /api/equipment/:id/assign
```
Body: { athleteId | teamId, notes }
Access: TUTOR
```

### POST /api/equipment/:id/return
```
Body: { assignmentId, condition, notes }
Access: TUTOR
```

---

## News

### GET /api/news
```
Query: status, search
Returns: paginated news posts
Access: Authenticated (TUTOR, SPORTS_REP)
```

### POST /api/news
```
Body: { title, content, status }
Access: TUTOR, SPORTS_REP
```

### PATCH /api/news/:id
```
Access: TUTOR, SPORTS_REP
```

### DELETE /api/news/:id
```
Access: TUTOR
```

---

## Public (no authentication)

Open, read-only endpoints powering the public website. No `Authorization` header required.

### GET /api/public/fixtures
```
Query: sport, team, event, from, to
Returns: upcoming / scheduled fixtures
Access: Public
```

### GET /api/public/results
```
Query: sport, team, event, from, to
Returns: completed matches with results
Access: Public
```

### GET /api/public/sports
```
Returns: sport catalogue (with team counts)
Access: Public
```

### GET /api/public/sports/:id
```
Returns: sport detail with its teams
Access: Public
```

### GET /api/public/teams
```
Query: sport
Returns: team list with season record
Access: Public
```

### GET /api/public/teams/:id
```
Returns: team detail — squad, staff, fixtures, results, season record
Access: Public
```

### GET /api/public/events
```
Query: type, level, sport, status, from, to
Returns: event list
Access: Public
```

### GET /api/public/events/:id
```
Returns: event detail — participants, fixtures, results, standings
Access: Public
```

### GET /api/public/news
```
Returns: published news posts
Access: Public
```

### GET /api/public/news/:slug
```
Returns: single published news post
Access: Public
```
