# 08 — Academic Performance

## Overview

One of the core problems identified by the UMU Sports Tutor is the inability to track student-athletes' academic progress. This module allows the sports department to monitor academic standing, receive alerts for at-risk athletes, and link academic status to scholarship eligibility.

The sports department does **not** own academic data — it reads academic data that is provided by Academic Staff or imported from the university's academic system.

---

## Academic Record

Each athlete has academic records per semester.

```
AcademicRecord
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── academic_year (e.g. "2025/2026")
├── semester (enum: SEM1 | SEM2 | RESIT)
├── year_of_study (integer)
├── gpa (decimal 0.0–5.0, nullable)
├── cgpa (cumulative GPA, decimal, nullable)
├── total_credit_units_taken (integer)
├── total_credit_units_passed (integer)
├── failed_units (integer, default 0)
├── attendance_percentage (decimal 0–100, nullable)
├── academic_standing (enum: see below)
├── entered_by (FK → User — Academic Staff)
├── created_at
├── notes (text, nullable)
└── updated_at
```

### Academic Standing Values

| Value | Description |
|---|---|
| `GOOD_STANDING` | Meeting all academic requirements |
| `WARNING` | GPA dropped below threshold or failed units |
| `PROBATION` | Continued underperformance, at risk of suspension |
| `ACADEMIC_SUSPENSION` | Suspended from academic activities |
| `WITHDRAWN` | No longer enrolled |

---

## Course / Unit Results

Granular results per course (optional — may not always be available):

```
CourseResult
├── id (UUID)
├── academic_record_id (FK → AcademicRecord)
├── course_code (e.g. "CSC2101")
├── course_name (e.g. "Data Structures")
├── credit_units (integer)
├── marks (decimal, nullable)
├── grade (text, e.g. "A", "B+", "F")
├── result (enum: PASS | FAIL | INCOMPLETE | WITHDRAWN)
└── retake (boolean, default false)
```

---

## Academic Thresholds

These thresholds determine when an alert is triggered. They are hardcoded in the service layer (not configurable via DB in v1.0).

| Threshold | Default |
|---|---|
| Min GPA for Good Standing | 2.5 |
| Min GPA for Scholarship | 2.0 |
| Max Failed Units (Warning) | 1 |
| Max Failed Units (Probation) | 3 |
| Min Attendance (Warning) | 75% |

---

## Academic Standing Logic

The system automatically computes `academic_standing` based on entered data:

```
if gpa >= min_gpa_for_good_standing AND failed_units == 0:
    → GOOD_STANDING

elif gpa >= min_gpa_for_good_standing AND failed_units <= max_failed_units_warning:
    → WARNING

elif gpa < min_gpa_for_good_standing OR failed_units > max_failed_units_warning:
    → WARNING

elif failed_units >= max_failed_units_probation:
    → PROBATION

if attendance < min_attendance_warning:
    → add ATTENDANCE_FLAG (separate from standing)
```

The sports admin can manually override the computed standing with a reason.

---

## Academic Alerts

The system automatically generates alerts when:

| Trigger | Alert Type |
|---|---|
| GPA falls below threshold | `ACADEMIC_WARNING` |
| 1+ unit failed | `FAILED_UNIT` |
| 3+ units failed | `ACADEMIC_PROBATION` |
| Attendance < 75% | `LOW_ATTENDANCE` |
| No academic record entered for current semester | `MISSING_RECORD` |
| Scholarship minimum GPA not met | `SCHOLARSHIP_AT_RISK` |

See `12-notifications-and-alerts.md` for full alert specification.

---

## Academic History View

The Sports Tutor or Coach can view an athlete's academic history across all semesters:

```
Semester    Year    GPA    Failed Units    Standing
SEM1 24/25   2      3.4        0          Good
SEM2 24/25   2      2.8        1          Warning ⚠
SEM1 25/26   3      3.1        0          Good
```

A trend chart shows GPA movement over time.

---

## Data Entry

### Option A — Manual Entry by Academic Staff
Academic Staff assigned to a faculty log into the system and enter GPA, results, and standing per athlete.

### Option B — Bulk Import
The TUTOR or SPORTS_REP uploads a CSV/Excel file with columns:
```
registration_number, academic_year, semester, gpa, cgpa, failed_units, attendance, standing
```

The system validates:
- Registration number exists
- GPA is within 0.0–5.0
- Semester is valid
- No duplicate record for same athlete/year/semester

### Option C — Integration (Future)
In future versions, the system can query UMU's academic management system via API to pull results automatically.

---

## Privacy and Access

Academic data is sensitive. Access is strictly controlled:

| Role | Access |
|---|---|
| TUTOR | Full read + write (can enter/edit) |
| SPORTS_REP | Full read + write (can enter/edit) |

---

## Academic Impact on Other Modules

| Module | How academic data is used |
|---|---|
| Scholarships | GPA check for scholarship eligibility and renewal |
| Recruitment | Academic score included in trial/scouting report |
| Notifications | Alerts triggered by academic thresholds |
| Reports | Academic standing summary in department reports |
| 360° Profile | GPA, standing, attendance shown on athlete profile |
