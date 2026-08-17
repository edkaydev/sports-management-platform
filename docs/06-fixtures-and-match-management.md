# 06 — Fixtures and Match Management

## Overview

This module covers scheduling matches (fixtures), setting lineups, recording live match events, and capturing final results and reports.

---

## Fixture

A fixture is a scheduled match between two participants (teams or individuals) within an event.

```
Match
├── id (UUID)
├── event_id (FK → Event)
├── sport_id (FK → Sport)
├── season_id (FK → Season)
├── match_number (integer, for ordering within tournaments)
├── round (text, e.g. "Group Stage", "Semi Final", "Final")
├── home_team_id (FK → Team, nullable for individual sports)
├── away_team_id (FK → Team, nullable)
├── home_individual_id (FK → StudentAthlete, for individual sports)
├── away_individual_id (FK → StudentAthlete, for individual sports)
├── venue
├── scheduled_date (date)
├── scheduled_time (time)
├── actual_start_time (timestamp, nullable)
├── actual_end_time (timestamp, nullable)
├── home_score (integer, nullable)
├── away_score (integer, nullable)
├── status (enum: SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | POSTPONED | ABANDONED)
├── match_type (enum: LEAGUE | KNOCKOUT | FRIENDLY | GALA | TRIAL | OTHER)
├── notes (text)
├── created_by (FK → User)
├── created_at
└── updated_at
```

---

## Fixture Scheduling

TUTOR and SPORTS_REP can:
- Create individual fixtures
- Auto-generate fixtures for a round-robin / league (all teams play each other)
- Bulk-generate knockout brackets

Each fixture can be assigned to an event (required) and a competition round (optional for friendlies).

---

## Match Lineup

Before a match starts, the coach submits the starting lineup and named substitutes.

```
MatchLineup
├── id (UUID)
├── match_id (FK → Match)
├── team_id (FK → Team)
├── submitted_by (FK → User — Coach)
├── submitted_at (timestamp)
└── is_confirmed (boolean)

LineupEntry
├── lineup_id (FK → MatchLineup)
├── athlete_id (FK → StudentAthlete)
├── jersey_number (integer)
├── position (text)
├── is_starter (boolean)
├── is_captain (boolean)
└── order (integer — shirt number order)
```

---

## Match Events

During a match, the following events can be recorded (sport-dependent):

```
MatchEvent
├── id (UUID)
├── match_id (FK → Match)
├── event_type (enum — see below)
├── minute (integer — match minute, nullable)
├── team_id (FK → Team, nullable)
├── athlete_id (FK → StudentAthlete, nullable)
├── secondary_athlete_id (FK → StudentAthlete, nullable — e.g. assist provider)
├── details (text, nullable — additional context)
└── recorded_by (FK → User)
└── recorded_at (timestamp)
```

### Event Types by Sport

**Football / Rugby / Basketball / Volleyball / Netball**

| Event Type | Description |
|---|---|
| `GOAL` | Goal scored (Football, Netball) |
| `POINT` | Point scored (Basketball, Volleyball) |
| `TRY` | Try scored (Rugby) |
| `ASSIST` | Assist on a goal/try |
| `YELLOW_CARD` | Yellow card / warning |
| `RED_CARD` | Red card / ejection |
| `SUBSTITUTION` | Player substitution (in/out) |
| `INJURY` | Player injury during match |
| `PENALTY` | Penalty awarded |
| `PENALTY_GOAL` | Penalty converted |
| `OWN_GOAL` | Own goal |
| `FOUL` | Foul committed |
| `HALF_TIME` | Half-time break |
| `FULL_TIME` | Final whistle |
| `EXTRA_TIME_START` | Extra time begins |
| `SHOOTOUT_GOAL` | Penalty shootout goal |
| `SHOOTOUT_MISS` | Penalty shootout miss |

**Athletics**

| Event Type | Description |
|---|---|
| `RESULT` | Final time / distance / height |
| `DNS` | Did not start |
| `DNF` | Did not finish |
| `DQ` | Disqualified |

---

## Score Tracking

Scores are updated automatically as `GOAL`, `POINT`, or `TRY` events are recorded. The final score is also manually editable by the TUTOR or SPORTS_REP in case of corrections.

---

## Match Result

Scores are stored directly on the `Match` model (`home_score`, `away_score`). The result is determined by comparing scores.

---

## Match Report

After the match, the coach or official submits a written report.

```
MatchReport
├── id (UUID)
├── match_id (FK → Match, unique)
├── submitted_by (FK → User)
├── submitted_at (timestamp)
├── summary (text)
├── mvp_athlete_id (FK → StudentAthlete, nullable)
├── attendance_count (integer, nullable)
├── notable_incidents (text)
├── coaching_notes (text)
└── created_at
```

---

## Fixture Calendar

All scheduled matches appear in the department calendar:

- Filter by sport / team / event
- Color-coded by status (Scheduled / In Progress / Completed / Cancelled)
- Weekly and monthly view
- Export to PDF

---

## Notifications Triggered

- Fixture created → notify team coach and players
- Lineup deadline approaching → notify coach
- Match started → update status
- Match completed → notify relevant parties, update standings
- Match cancelled/postponed → notify all participants

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create fixture | ✅ | ✅ |
| Edit fixture details | ✅ | ✅ |
| Submit lineup | ✅ | ✅ |
| Record match events | ✅ | ✅ |
| Edit final score | ✅ | ✅ |
| Submit match report | ✅ | ✅ |
| Delete match | ✅ | ❌ |
| View fixtures | ✅ | ✅ | ✅ | ✅ |
| View match events | ✅ | ✅ | ✅ | ✅ |
| Verify/approve result | ✅ | ❌ | ✅ | ❌ |
