# 04 — Sports and Teams

## Overview

This module manages the sports disciplines offered by UMU, the teams within each sport, coaching staff, and squad management.

---

## Sports Disciplines

UMU currently offers the following sports (from the official registration form):

| # | Sport | Gender | Notes |
|---|---|---|---|
| 1 | Football | Men | |
| 2 | Football | Women | |
| 3 | Volleyball | Men | |
| 4 | Volleyball | Women | |
| 5 | Basketball | Men | |
| 6 | Basketball | Women | |
| 7 | Netball | Mixed / Women | |
| 8 | Rugby | Men | |
| 9 | Tennis | Mixed | |
| 10 | Table Tennis | Mixed | |
| 11 | Badminton | Mixed | |
| 12 | Athletics | Mixed | |
| 13 | Chess | Mixed | |
| 14 | Scrabble | Mixed | |

New sports can be added by SPORTS_ADMIN as the department grows.

---

## Sport Data Model

```
Sport
├── id (UUID)
├── name (e.g. "Football")
├── gender (enum: MEN | WOMEN | MIXED)
├── category (enum: TEAM | INDIVIDUAL)
├── is_active (boolean)
├── description (text, optional)
├── created_at
└── updated_at
```

**Category distinction:**
- `TEAM` sports: Football, Basketball, Volleyball, Netball, Rugby, etc.
- `INDIVIDUAL` sports: Athletics, Tennis, Chess, Scrabble, Table Tennis, Badminton

Individual sports may still have a "team" concept for university representation (e.g., a UMU Athletics team that competes together at national level).

---

## Teams

Each sport can have one or more teams. Examples:
- UMU FC (Men's Football)
- UMU Lady Kobs (Women's Football)
- UMU Stallions (Men's Basketball)

### Team Data Model

```
Team
├── id (UUID)
├── name (e.g. "UMU FC")
├── short_name (e.g. "UMU")
├── sport_id (FK → Sport)
├── gender (enum: MEN | WOMEN | MIXED)
├── logo_url (optional)
├── home_venue (text)
├── founding_year (integer, optional)
├── is_active (boolean)
├── season (FK → Season)
├── created_at
└── updated_at
```

---

## Coaching Staff

Each team has an assigned coaching staff. A coach can be assigned to multiple teams.

```
TeamStaff
├── id (UUID)
├── team_id (FK → Team)
├── user_id (FK → User)
├── role (enum: HEAD_COACH | ASSISTANT_COACH | TEAM_MANAGER | FITNESS_TRAINER | PHYSIO | OTHER)
├── assigned_date
├── is_active (boolean)
└── notes
```

---

## Squad (Team Roster)

The squad is the list of athletes registered to a team for a given season.

```
TeamSquad
├── id (UUID)
├── team_id (FK → Team)
├── athlete_id (FK → StudentAthlete)
├── season_id (FK → Season)
├── jersey_number (integer, nullable)
├── position (text)
├── is_captain (boolean)
├── is_vice_captain (boolean)
├── joined_date
├── status (enum: ACTIVE | INJURED | SUSPENDED | TRANSFERRED | RELEASED)
└── notes
```

---

## Season

All team and competition data is scoped to a season (academic year).

```
Season
├── id (UUID)
├── name (e.g. "2025/2026")
├── start_date
├── end_date
├── is_current (boolean)
└── created_by (FK → User)
```

---

## Training Sessions

Coaches can log training sessions for their teams.

```
TrainingSession
├── id (UUID)
├── team_id (FK → Team)
├── coach_id (FK → User)
├── session_date (date)
├── start_time
├── end_time
├── venue
├── type (enum: FITNESS | TACTICAL | TECHNICAL | SCRIMMAGE | RECOVERY | OTHER)
├── notes (text)
├── created_at
└── updated_at

TrainingAttendance
├── session_id (FK → TrainingSession)
├── athlete_id (FK → StudentAthlete)
└── status (enum: PRESENT | ABSENT | EXCUSED | LATE)
```

---

## Team Management Actions

| Action | SPORTS_ADMIN | COACH | TEAM_MANAGER |
|---|:---:|:---:|:---:|
| Create/edit sport | ✅ | ❌ | ❌ |
| Create/edit team | ✅ | ❌ | ❌ |
| Manage squad (add/remove) | ✅ | 🔶 own team | ❌ |
| Assign coaching staff | ✅ | ❌ | ❌ |
| Log training sessions | ✅ | ✅ | ❌ |
| Record training attendance | ✅ | ✅ | ❌ |
| View team roster | ✅ | ✅ | ✅ |
| Export squad list | ✅ | ✅ | ✅ |

---

## Team History

All past seasons' squads and coaching staff are preserved. A coach can view who was on the team in the 2023/2024 season, for example.

---

## Player Transfer / Release

When an athlete changes team (e.g., moves from Reserve to First Team):

```
TransferRecord
├── athlete_id
├── from_team_id
├── to_team_id
├── transfer_date
├── reason (text)
└── processed_by (FK → User)
```

---

## Individual Sport Representation

For individual sports (Athletics, Chess, etc.):

- Athletes are still registered to the sport
- A "team" may be created to represent UMU at competitions (e.g., "UMU Athletics Squad")
- Individual results are tracked per athlete, not per team lineup
