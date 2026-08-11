# 12 — Notifications and Alerts

## Overview

The system proactively surfaces important information so the Sports Tutor does not have to manually check every athlete, document, and scholarship. Notifications are generated automatically by system rules and delivered in-app (and optionally by email).

---

## Notification Types

### Academic Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `ACADEMIC_WARNING` | Athlete GPA drops below warning threshold | SPORTS_ADMIN, COACH (own team) |
| `ACADEMIC_PROBATION` | Athlete on academic probation | SPORTS_ADMIN |
| `FAILED_UNIT` | Athlete has failed one or more units | SPORTS_ADMIN, COACH |
| `LOW_ATTENDANCE` | Attendance below 75% | SPORTS_ADMIN, COACH |
| `MISSING_ACADEMIC_RECORD` | No semester results entered for current semester | SPORTS_ADMIN |

---

### Scholarship & Contract Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `SCHOLARSHIP_EXPIRING` | Scholarship expires within 30 days | SPORTS_ADMIN |
| `SCHOLARSHIP_EXPIRED` | Scholarship past end date | SPORTS_ADMIN |
| `SCHOLARSHIP_AT_RISK` | Athlete GPA below scholarship minimum | SPORTS_ADMIN |
| `SCHOLARSHIP_REVIEW` | Athlete status changed (withdrawn, suspended) | SPORTS_ADMIN |
| `CONTRACT_EXPIRING` | Contract expires within 30 days | SPORTS_ADMIN |
| `CONTRACT_EXPIRED` | Contract past end date | SPORTS_ADMIN |

---

### Document Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `DOCUMENT_EXPIRING` | Document expiry within 30 days | SPORTS_ADMIN |
| `DOCUMENT_EXPIRED` | Document past expiry date | SPORTS_ADMIN |
| `DOCUMENT_MISSING` | Required document not uploaded for athlete | SPORTS_ADMIN |

---

### Match & Fixture Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `FIXTURE_REMINDER` | Upcoming match within 24 hours | COACH, TEAM_MANAGER, ATHLETE |
| `LINEUP_DUE` | Lineup not submitted 3 hours before match | COACH |
| `MATCH_RESULT_PENDING` | Match completed but no result recorded | SPORTS_ADMIN, OFFICIAL |
| `MATCH_REPORT_PENDING` | Match completed but no report submitted | COACH, OFFICIAL |

---

### Recruitment Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `TRIAL_REMINDER` | Trial scheduled within 24 hours | COACH, RECRUITER |
| `ASSESSMENT_PENDING` | Trial completed but no assessments submitted | COACH, RECRUITER |
| `PROSPECT_AWAITING_DECISION` | Assessment done, no selection outcome set | SPORTS_ADMIN |

---

### Performance Alerts

| Alert Key | Trigger | Recipients |
|---|---|---|
| `POOR_FORM` | Average rating < 5.0 over last 5 matches | COACH |
| `FREQUENT_CARDS` | 2+ yellow cards in last 5 matches | COACH, SPORTS_ADMIN |
| `TRAINING_ABSENCES` | Missed 3+ consecutive training sessions | COACH |

---

## Notification Data Model

```
Notification
├── id (UUID)
├── type (enum — alert key from above)
├── severity (enum: INFO | WARNING | CRITICAL)
├── title (text)
├── message (text)
├── recipient_user_id (FK → User)
├── related_athlete_id (FK → StudentAthlete, nullable)
├── related_entity_type (enum: MATCH | SCHOLARSHIP | DOCUMENT | TRIAL | etc.)
├── related_entity_id (UUID, nullable)
├── is_read (boolean, default false)
├── read_at (timestamp, nullable)
├── created_at (timestamp)
└── expires_at (timestamp, nullable)
```

---

## Notification Delivery

### In-App (always)
- Bell icon with unread count in the top navigation
- Notification panel shows all unread notifications
- Grouped by severity: Critical → Warning → Info
- Click notification → navigate to the relevant record

### Email (optional, configurable)
- SPORTS_ADMIN can configure which alert types trigger emails
- Email uses a simple plain-text format (no heavy HTML templates)
- Unsubscribe / mute per alert type available in user settings

---

## Notification Rules Configuration

SPORTS_ADMIN can adjust thresholds and toggle alerts:

```
NotificationRule
├── alert_key (enum)
├── is_enabled (boolean)
├── threshold_value (decimal, nullable — for GPA/attendance rules)
├── days_before_expiry (integer, nullable — for expiry alerts)
├── send_email (boolean)
└── updated_by (FK → User)
```

---

## Digest / Summary

Instead of individual alerts, SPORTS_ADMIN can opt for a **daily digest** email that groups all pending alerts into one message:

```
Daily Sports Department Summary — 11 Aug 2026

CRITICAL (2)
  · John Doe — Scholarship expired (Football)
  · Jane Akello — Academic probation

WARNING (5)
  · 3 athletes have missing documents
  · 2 match reports pending submission

INFO (3)
  · 4 upcoming fixtures this week
  · 1 trial scheduled tomorrow
```

---

## Notification Dashboard

The Sports Admin homepage shows an "Attention Required" panel:

```
Attention Required

Academic           7 athletes with warnings
Scholarships       4 expiring within 30 days
Documents          12 missing or expired
Match Reports       3 pending submission
Recruitment         2 prospects awaiting decision
```

Each item is a link to the filtered list of affected records.
