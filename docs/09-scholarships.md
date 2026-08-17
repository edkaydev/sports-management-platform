# 09 — Scholarships and Contracts

## Overview

Not every student-athlete at UMU is on a scholarship. Athletes fall into three categories:

| Type | Description |
|---|---|
| `REGULAR` | Standard student. Participates in sports, no financial arrangement. |
| `SCHOLARSHIP` | Awarded a university sports scholarship (full or partial). |
| `CONTRACT` | Formally contracted athlete. Paid or has a formal agreement with the sports department. May also hold a scholarship simultaneously. |

This module manages scholarships and contracts as **separate but linked** records on the athlete profile.

---

## Scholarships

### Scholarship Types

| Type | Description |
|---|---|
| `FULL` | University covers full tuition and/or accommodation |
| `PARTIAL` | University covers a percentage of tuition/fees |
| `SPONSORSHIP` | External sponsor funds the athlete via the university |
| `BURSARY` | Need-based sports support grant |

---

### Scholarship Data Model

```
Scholarship
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── scholarship_type (enum: FULL | PARTIAL | SPONSORSHIP | BURSARY)
├── sponsor_name (text — e.g. "UMU", "Nile Breweries", "FUUSA")
├── coverage_description (text — what exactly is covered)
├── coverage_percentage (decimal 0–100, nullable)
├── start_date (date)
├── end_date (date)
├── renewable (boolean)
├── renewal_count (integer, default 0)
├── status (enum: ACTIVE | EXPIRED | SUSPENDED | REVOKED | RENEWED | PENDING)
├── academic_requirement_gpa (decimal — minimum GPA to maintain scholarship)
├── sports_requirement (text — e.g. "Must be in first team, attend all training")
├── awarded_by (FK → User — TUTOR / SPORTS_REP)
├── awarded_at (timestamp)
├── revoked_by (FK → User, nullable)
├── revoked_at (timestamp, nullable)
├── revocation_reason (text, nullable)
├── notes (text)
└── updated_at
```

---

### Scholarship Status Logic

The system monitors scholarship eligibility each semester:

```
if athlete.academic_record.gpa < scholarship.academic_requirement_gpa:
    → flag: SCHOLARSHIP_AT_RISK

if today > scholarship.end_date AND status == ACTIVE:
    → auto-set status = EXPIRED
    → trigger SCHOLARSHIP_EXPIRED alert

if athlete.status == WITHDRAWN or ACADEMIC_SUSPENSION:
    → flag for review → trigger SCHOLARSHIP_REVIEW_REQUIRED alert
```

---

### Scholarship Renewal

When a scholarship is renewed:

```
ScholarshipRenewal
├── scholarship_id (FK → Scholarship)
├── previous_end_date
├── new_end_date
├── renewed_by (FK → User)
├── renewed_at (timestamp)
├── gpa_at_renewal (decimal)
├── notes (text)
└── renewal_number (integer)
```

---

### Scholarship Documents

Each scholarship should have supporting documents attached:

- Scholarship award letter
- Scholarship agreement (signed)
- Sponsor letter (if external)
- Renewal letters
- Academic transcript at time of award

---

## Contracts

A contract athlete has a formal engagement agreement with the sports department. This is separate from a scholarship.

```
AthleteContract
├── id (UUID)
├── athlete_id (FK → StudentAthlete, unique — one active contract at a time)
├── contract_type (enum: PLAYING | COACHING_DEVELOPMENT | AMBASSADOR | OTHER)
├── start_date (date)
├── end_date (date)
├── terms_summary (text — brief description of contract terms)
├── has_accompanying_scholarship (boolean)
├── scholarship_id (FK → Scholarship, nullable — links to scholarship if applicable)
├── signed_by_athlete (boolean)
├── signed_at (timestamp, nullable)
├── status (enum: ACTIVE | EXPIRED | TERMINATED | SUSPENDED)
├── created_by (FK → User)
├── created_at
├── terminated_by (FK → User, nullable)
├── termination_date (date, nullable)
├── termination_reason (text, nullable)
└── notes (text)
```

> A contracted athlete can simultaneously hold a scholarship. The two records are linked but managed independently.

---

### Contract Documents

Each contract must have:
- Signed contract document (PDF upload)
- Any amendments
- Termination letter (if terminated)

---

## Scholarship vs Contract Summary

| Feature | Scholarship | Contract |
|---|---|---|
| Financial nature | Fee coverage / grant | Formal playing/engagement agreement |
| Academic requirements | Yes (minimum GPA) | Not mandatory (but tracked) |
| Can co-exist | Yes — athlete can have both | Yes — can also have a scholarship |
| Renewable | Yes | Yes (new contract) |
| Revocable | Yes | Yes (termination) |
| Documents required | Award letter, agreement | Signed contract |

---

## Scholarship Dashboard

The Sports Admin sees a summary of all active scholarships:

```
Active Scholarships          34
Expiring in 30 days           4
Pending Renewal               6
At Academic Risk              3
Revoked this semester         1
```

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create scholarship | ✅ | ✅ |
| Edit scholarship | ✅ | ✅ |
| Renew scholarship | ✅ | ✅ |
| Revoke scholarship | ✅ | ✅ |
| View scholarships | ✅ | ✅ |
| Create contract | ✅ | ✅ |
| View contracts | ✅ | ✅ |
| Upload scholarship docs | ✅ | ✅ |
| View scholarship dashboard | ✅ | ❌ | ❌ |
