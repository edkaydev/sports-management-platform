# 13 — Reports and Analytics

## Overview

The reports module gives the Sports Department actionable summaries of department activity. Reports can be viewed in-app or exported as PDF or CSV.

---

## Report Categories

### 1. Department Overview Report

A high-level snapshot of the entire sports department.

**Contents:**
- Total student-athletes (by sport, gender, athlete type)
- Total active teams
- Active competitions this season
- Upcoming fixtures (next 7 days)
- Scholarship summary (active, expiring, at-risk)
- Academic standing summary (good / warning / probation)
- Document completion rate

**Access:** SPORTS_ADMIN, UNIVERSITY_ADMIN

---

### 2. Student-Athlete Report

A list of all student-athletes with key data per athlete.

**Columns:**
- Name, Registration Number, Programme, Year
- Sport(s), Team
- Athlete Type (Regular / Scholarship / Contract)
- GPA, Academic Standing
- Matches Played, Goals, Assists
- Scholarship Status
- Document Completion

**Filters:**
- Sport / Team
- Athlete type
- Academic standing
- Gender
- Year of study
- Active / Inactive

**Access:** SPORTS_ADMIN

---

### 3. Academic Standing Report

All athletes with academic data, grouped by standing.

**Contents:**
- Athletes by standing: Good / Warning / Probation / Suspended
- GPA distribution
- Failed units count
- Low attendance list
- Athletes missing academic records for current semester

**Filters:** Sport, Team, Semester, Faculty

**Access:** SPORTS_ADMIN, ACADEMIC_STAFF

---

### 4. Scholarship Report

Complete overview of scholarship records.

**Contents:**
- All active scholarships with athlete name, type, sponsor, end date, GPA
- Expiring within 30/60/90 days
- At-risk (GPA below minimum)
- Revoked this semester
- Scholarship coverage summary (how many full vs partial)

**Access:** SPORTS_ADMIN, UNIVERSITY_ADMIN

---

### 5. Contract Report

All current athlete contracts.

**Contents:**
- Athlete name, contract type, start, end date, status
- Contracts expiring within 30 days
- Contracts with accompanying scholarships

**Access:** SPORTS_ADMIN

---

### 6. Match Results Report

Summary of all completed matches in a season.

**Contents:**
- Match date, opponent, venue, score, result
- Per-team win/draw/loss record
- Top scorers, top assists
- Cards summary

**Filters:** Sport, Team, Event, Date range

**Access:** SPORTS_ADMIN, COACH, UNIVERSITY_ADMIN

---

### 7. Player Performance Report

Individual or team-level performance stats.

**Contents:**
- Matches played, started, goals, assists, cards, average rating
- Top performers per stat
- Performance over time (trend)

**Filters:** Sport, Team, Season, Player

**Access:** SPORTS_ADMIN, COACH

---

### 8. Fixture Schedule Report

All upcoming fixtures for a given period.

**Contents:**
- Date, time, venue, teams, event/competition name, status

**Filters:** Sport, Team, Date range

**Access:** All roles

---

### 9. Recruitment & Trials Report

Summary of recruitment activity.

**Contents:**
- Prospects registered, by sport
- Trials conducted
- Assessment scores summary
- Selected / Rejected / Pending breakdown
- Conversion rate (trials → enrolled athletes)

**Access:** SPORTS_ADMIN, RECRUITER

---

### 10. Document Compliance Report

Document completeness per athlete.

**Contents:**
- Athletes with complete documents
- Athletes with missing required documents
- Athletes with expired documents
- Document type breakdown

**Access:** SPORTS_ADMIN

---

## Export Formats

All reports support:

| Format | Use Case |
|---|---|
| PDF | Printing, formal submission to administration |
| CSV | Data analysis in Excel / Google Sheets |
| In-app view | Quick reference, with filters |

---

## Dashboard Widgets

The SPORTS_ADMIN home dashboard shows live summary widgets:

```
┌─────────────────────────────────────────────────────────────┐
│  UMU Sports Department                  2025/2026 Season     │
├──────────────┬──────────────┬─────────────┬─────────────────┤
│  247          │  12          │  8          │  34             │
│  Athletes     │  Teams       │  Competitions│  Upcoming Matches│
├──────────────┴──────────────┴─────────────┴─────────────────┤
│  Attention Required                                          │
│  Academic Warnings       7    [View]                         │
│  Scholarships Expiring   4    [View]                         │
│  Missing Documents      12    [View]                         │
│  Match Reports Pending   3    [View]                         │
├─────────────────────────────────────────────────────────────┤
│  Today's Fixtures                                            │
│  2:00 PM   Football (Men)    UMU FC vs UCU                  │
│  4:00 PM   Basketball (M)    UMU Stallions vs MUBS          │
│  5:30 PM   Volleyball (M)    UMU vs KIU                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Scheduled Reports (Future)

In a future version, the system can automatically email periodic reports:

- Weekly fixtures summary (every Monday)
- Monthly academic standing summary
- End-of-semester scholarship review report

---

## Access by Role

| Report | SPORTS_ADMIN | COACH | UNI_ADMIN | ATHLETE |
|---|:---:|:---:|:---:|:---:|
| Department overview | ✅ | ❌ | ✅ | ❌ |
| Student-athlete list | ✅ | 🔶 | ❌ | ❌ |
| Academic standing | ✅ | 👁 | 👁 | 👁 own |
| Scholarship report | ✅ | ❌ | ✅ | 👁 own |
| Contract report | ✅ | ❌ | ❌ | 👁 own |
| Match results | ✅ | ✅ | ✅ | ✅ |
| Player performance | ✅ | 🔶 | ❌ | 👁 own |
| Fixture schedule | ✅ | ✅ | ✅ | ✅ |
| Recruitment report | ✅ | ❌ | ❌ | ❌ |
| Document compliance | ✅ | ❌ | ❌ | ❌ |
