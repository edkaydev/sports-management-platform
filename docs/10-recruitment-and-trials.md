# 10 — Recruitment and Trials

## Overview

The recruitment module manages the full pipeline from prospect discovery to team selection. The Sports Tutor and coaches can run formal trials, record assessments, and select athletes for teams — replacing the current paper-based process.

---

## Recruitment Pipeline

```
PROSPECT
    ↓
REGISTERED (trial application received)
    ↓
TRIAL SCHEDULED
    ↓
TRIAL COMPLETED (assessment recorded)
    ↓
ASSESSMENT REVIEW
    ↓
SELECTED / REJECTED
    ↓
ENROLLED (becomes a full StudentAthlete)
```

---

## Prospect

A prospect is someone who has not yet been formally enrolled as a student-athlete. They may be a new student, a transfer, or an external candidate.

```
Prospect
├── id (UUID)
├── full_name
├── email (nullable)
├── phone_number (nullable)
├── gender (enum: MALE | FEMALE)
├── date_of_birth (nullable)
├── school_or_institution (previous school/club)
├── programme_applied (nullable — if new UMU student)
├── sport_id (FK → Sport)
├── position (text, nullable)
├── previous_level (enum: SECONDARY | CLUB | DISTRICT | NATIONAL | INTERNATIONAL | NONE)
├── previous_clubs (text, nullable)
├── previous_achievements (text, nullable)
├── referred_by (text — name of coach/scout who referred them)
├── source (enum: SELF | SCOUT | COACH_REFERRAL | WALK_IN | OTHER)
├── status (enum: PROSPECT | REGISTERED | TRIAL_SCHEDULED | TRIAL_COMPLETED | SELECTED | REJECTED | ENROLLED | WITHDRAWN)
├── notes (text)
├── created_by (FK → User)
├── created_at
└── updated_at
```

---

## Trial

A trial is a scheduled assessment event for one or more prospects.

```
Trial
├── id (UUID)
├── sport_id (FK → Sport)
├── team_id (FK → Team, nullable — which team is recruiting)
├── trial_date (date)
├── start_time (time)
├── venue
├── conducted_by (FK → User — Coach or Recruiter)
├── season_id (FK → Season)
├── description (text, nullable)
├── status (enum: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED)
├── created_by (FK → User)
├── created_at
└── updated_at

TrialParticipant
├── trial_id (FK → Trial)
├── prospect_id (FK → Prospect)
└── attended (boolean, default false)
```

---

## Trial Assessment

After the trial, the coach or recruiter records an assessment for each participant.

```
TrialAssessment
├── id (UUID)
├── trial_id (FK → Trial)
├── prospect_id (FK → Prospect)
├── assessed_by (FK → User — Coach / Recruiter)
├── assessed_at (timestamp)
│
│  — Scored 1–10 —
├── score_technical (decimal, nullable)
├── score_physical (decimal, nullable)
├── score_speed (decimal, nullable)
├── score_tactical (decimal, nullable)
├── score_teamwork (decimal, nullable)
├── score_discipline (decimal, nullable)
├── score_academic (decimal, nullable — based on known academic history)
│
├── overall_score (decimal — average or weighted, computed)
├── recommended_position (text, nullable)
├── recommendation (enum: STRONGLY_RECOMMEND | RECOMMEND | NEUTRAL | NOT_RECOMMENDED)
├── selection_outcome (enum: SELECTED | RESERVE | REJECTED | PENDING)
├── coach_notes (text)
└── updated_at
```

### Scouting Report Card (example output)

```
Prospect:       John Doe
Sport:          Football (Men)
Trial Date:     2026-09-05
Assessed by:    Coach Ssemakula

Technical       8.0 / 10
Physical        7.5 / 10
Speed           8.5 / 10
Tactical        7.0 / 10
Teamwork        9.0 / 10
Discipline      9.0 / 10
Academic        7.0 / 10

Overall Score   8.0 / 10

Recommendation: SELECTED
Position:       Right Midfielder
Notes:          Strong on the ball, good work rate.
```

---

## Enrollment After Selection

When a prospect is marked as `SELECTED`, the Sports Admin converts them to a full `StudentAthlete` record:

1. System prompts: "Convert prospect to student-athlete?"
2. Admin confirms
3. A new `StudentAthlete` record is created, pre-populated from the `Prospect` record
4. The `RecruitmentRecord` is linked to the new athlete profile
5. Prospect status becomes `ENROLLED`

```
RecruitmentRecord
├── athlete_id (FK → StudentAthlete)
├── prospect_id (FK → Prospect)
├── trial_id (FK → Trial)
├── assessment_id (FK → TrialAssessment)
├── enrolled_date
└── enrolled_by (FK → User)
```

---

## Recruitment Documents

Each prospect/trial can have documents attached:

- Recommendation letter
- Previous club clearance
- Academic records
- Trial assessment form (PDF export)
- Medical clearance

---

## Bulk Trial Management

For large trials (e.g., 40 prospects at a gala trial):

- Import prospect list from CSV
- Print trial number cards
- Record attendance by trial number
- Batch-enter scores per trial number

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create prospect | ✅ | ✅ |
| Schedule trial | ✅ | ✅ |
| Record trial attendance | ✅ | ✅ |
| Submit assessment | ✅ | ✅ |
| Make selection decision | ✅ | ✅ |
| Convert prospect to athlete | ✅ | ✅ |
| View trial results | ✅ | ✅ |
| Export trial report | ✅ | ✅ |
