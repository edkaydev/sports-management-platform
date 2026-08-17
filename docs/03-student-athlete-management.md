# 03 — Student-Athlete Management

## Overview

The **Student-Athlete Profile** is the core record of the system. Every other module — academics, sports, scholarships, recruitment, documents — connects back to this profile.

The goal is a **Student-Athlete 360° view**: one place where the sports department can see everything about a student-athlete without switching between spreadsheets, papers, or other systems.

---

## Student-Athlete Registration

New athletes are registered using data collected from the **UMU Sports Assessment & Registration Form**. This form is currently a Google Form — the system will replace it with a built-in digital form, and also allow manual entry by the Sports Admin.

### Registration Form Fields

#### Personal Information
| Field | Type | Required |
|---|---|---|
| Full Name | Text | ✅ |
| Registration Number | Text | ✅ |
| Year of Study | Number (1–5) | ✅ |
| Gender | Enum: Male / Female | ✅ |
| Programme / Course | Text | ✅ |
| Faculty / School | Text | ✅ |
| Email Address | Email | ✅ |
| Phone Number | Text | ✅ |
| Date of Birth | Date | ✅ |

#### Sports Discipline
| Field | Type | Required |
|---|---|---|
| Primary Sport | Enum (see sport list) | ✅ |
| Secondary Sport | Enum (optional) | ❌ |
| Position / Event | Text | ❌ |

#### Previous Experience
| Field | Type | Required |
|---|---|---|
| Participated before? | Boolean | ✅ |
| Highest level | Enum: Secondary / Club / District / National | If yes |
| Previous clubs / schools | Text | ❌ |

#### Medical Declaration
| Field | Type | Required |
|---|---|---|
| Any medical condition? | Boolean | ✅ |
| If yes, specify | Text | If yes |

#### Athlete Status (set by Admin, not on form)
| Field | Type | Description |
|---|---|---|
| Athlete Type | Enum: REGULAR / SCHOLARSHIP / CONTRACT | See below |
| Contract Details | Text | Only for CONTRACT type |
| Scholarship ID | FK → Scholarship | Only for SCHOLARSHIP type |

---

## Athlete Types

This is critical: **not every athlete is on a scholarship**.

| Type | Description |
|---|---|
| `REGULAR` | Standard student who participates in sports. No financial arrangement. |
| `SCHOLARSHIP` | Student awarded a sports scholarship (full or partial) by the university. |
| `CONTRACT` | Athlete on a formal contract with the university/sports department. May or may not also receive a scholarship. |

> A `CONTRACT` athlete can simultaneously hold a `SCHOLARSHIP`. These are tracked separately.
> See `09-scholarships.md` for scholarship details.

---

## Student-Athlete Data Model

```
StudentAthlete
├── id (UUID)
├── user_id (FK → User, nullable — athlete may not have login yet)
├── full_name
├── registration_number (unique)
├── gender (enum: MALE | FEMALE)
├── date_of_birth
├── email
├── phone_number
├── year_of_study
├── programme
├── faculty
├── athlete_type (enum: REGULAR | SCHOLARSHIP | CONTRACT)
├── status (enum: ACTIVE | INJURED | SUSPENDED | INACTIVE | GRADUATED | WITHDRAWN)
├── profile_photo_url
├── created_at
├── updated_at
│
├── → SportAffiliation[] (which sports/teams)
├── → AcademicRecord[]
├── → Scholarship[] (0 or more)
├── → Contract (0 or 1)
├── → RecruitmentRecord (0 or 1)
├── → Document[]
├── → MedicalDeclaration
└── → PlayerMatchPerformance[]
```

---

## Medical Declaration Model

```
MedicalDeclaration
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── has_condition (boolean)
├── condition_description (text, nullable)
├── declared_at (timestamp)
└── reviewed_by (FK → User, nullable)
```

---

## Sport Affiliation

An athlete can participate in more than one sport. Each affiliation links them to a sport and optionally a team.

```
SportAffiliation
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── sport_id (FK → Sport)
├── team_id (FK → Team, nullable)
├── position (text, e.g. "Midfielder", "Point Guard")
├── jersey_number (integer, nullable)
├── is_captain (boolean, default false)
├── joined_date
├── status (enum: ACTIVE | INJURED | SUSPENDED | INACTIVE)
└── notes
```

---

## Student-Athlete 360° Profile

When a Sports Admin or Coach opens an athlete's profile, they see a unified view:

```
┌─────────────────────────────────────────────────────┐
│  KAYIIRA EDWARD                          [CONTRACT]  │
│  2024/BSCS/001 · BSc Computer Science · Year 3      │
│  ⚽ Football — Midfielder — UMU FC #10              │
├──────────────┬──────────────┬───────────────────────┤
│  ACADEMICS   │   SPORTS     │   STATUS              │
│  GPA: 3.7    │  Matches: 18 │  Scholarship: Active  │
│  Attendance: │  Goals: 7    │  Contract: Active     │
│  92%         │  Assists: 9  │  Documents: ✓ 5/5     │
│  Standing:   │  Starts: 14  │  Medical: ✓ Cleared   │
│  Good        │  Cards: 1    │                       │
├──────────────┴──────────────┴───────────────────────┤
│  ⚠️  ALERTS                                         │
│  · Scholarship renewal due in 14 days               │
│  · Contract expiry: 31 Dec 2026                     │
└─────────────────────────────────────────────────────┘
```

---

## Athlete Status

| Status | Meaning |
|---|---|
| `ACTIVE` | Currently active student-athlete |
| `INJURED` | Temporarily unavailable due to injury |
| `SUSPENDED` | Suspended from participation |
| `GRADUATED` | Completed studies, alumni |
| `WITHDRAWN` | Left university / dropped out |
| `INACTIVE` | No longer participating in sports |

---

## Academic Year & Season Tracking

Athletes are tracked per **academic year**. The `year_of_study`, `programme`, and `semester` are tracked as fields on the `StudentAthlete` record and updated as the athlete progresses.

---

## Search & Filtering

The athlete list should support filtering by:

- Sport / Team
- Athlete type (Regular / Scholarship / Contract)
- Academic standing (Good / Warning / At Risk)
- Status (Active / Injured / Suspended)
- Year of study
- Faculty / Programme
- Gender

---

## Actions Available per Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create athlete profile | ✅ | ✅ |
| Edit athlete profile | ✅ | ✅ |
| View full 360° profile | ✅ | ✅ |
| Change athlete type | ✅ | ✅ |
| Add sport affiliation | ✅ | ✅ |
| Update medical declaration | ✅ | ✅ |
| Deactivate athlete | ✅ | ✅ |
| Export athlete data | ✅ | ✅ |
| Delete athlete (soft) | ✅ | ❌ |
