# 05 — Events and Competitions

## Overview

UMU's sports department runs a wide variety of sporting activities — from informal campus galas to international university competitions. The system uses a **single unified events model** that handles all of them, rather than separate modules for different event types.

---

## Event Types

| Type | Examples |
|---|---|
| `GALA` | Campus Gala, Faculty Gala, Sports Day |
| `TOURNAMENT` | Campus Basketball Tournament, Faculty Football Cup |
| `LEAGUE` | University Football League |
| `COMPETITION` | Inter-university competition, national championship |
| `FRIENDLY` | UMU vs Makerere (informal), Wednesday friendly |
| `TRIAL` | Team selection trials, scouting trials |
| `TRAINING` | Team training session, fitness camp |
| `FESTIVAL` | Sports festival, multi-sport event |
| `SPECIAL` | One-off event that doesn't fit a standard type |

---

## Event Levels

Events are classified by their scope:

```
INTERNAL
├── CAMPUS       — Campus-wide events
├── FACULTY      — Inter-faculty or faculty-level
└── UNIVERSITY   — Whole-university level

EXTERNAL
├── LOCAL        — Local club/school opponents
├── NATIONAL     — National inter-university or championships
├── REGIONAL     — East African / regional competitions
└── INTERNATIONAL — International university games
```

---

## Event Data Model

```
Event
├── id (UUID)
├── name (e.g. "2026 UMU Faculty Gala")
├── type (enum: see Event Types above)
├── level (enum: see Event Levels above)
├── sport_id (FK → Sport)
├── season_id (FK → Season)
├── organizer (text — e.g. "UMU Sports Department", "FUUSA")
├── host_institution (text, for external events)
├── venue
├── start_date (date)
├── end_date (date)
├── description (text)
├── status (enum: PLANNED | ACTIVE | COMPLETED | CANCELLED | POSTPONED)
├── format (enum: KNOCKOUT | ROUND_ROBIN | LEAGUE | GROUP_STAGE | SINGLE_MATCH | OTHER)
├── max_teams (integer, nullable)
├── max_participants (integer, nullable)
├── registration_deadline (date, nullable)
├── created_by (FK → User)
├── created_at
└── updated_at
```

---

## Competition Structure

For structured competitions (leagues, tournaments, group stages), the system supports:

### Groups / Pools

```
CompetitionGroup
├── id (UUID)
├── event_id (FK → Event)
├── name (e.g. "Group A")
└── teams[] (FK → Team[])
```

### Standings

```
Standing
├── event_id
├── group_id (nullable)
├── team_id
├── played
├── won
├── drawn
├── lost
├── goals_for
├── goals_against
├── goal_difference
├── points
└── position
```

Standings are recalculated automatically each time a match result is recorded.

### Knockout Rounds

```
KnockoutRound
├── event_id
├── round_name (e.g. "Quarter Final", "Semi Final", "Final")
├── round_number (integer)
└── matches[] (FK → Match[])
```

---

## Event Participants

Teams or individual athletes registered to participate in an event:

```
EventParticipant
├── event_id (FK → Event)
├── participant_type (enum: TEAM | INDIVIDUAL)
├── team_id (FK → Team, if TEAM)
├── athlete_id (FK → StudentAthlete, if INDIVIDUAL)
├── registered_at
└── status (enum: REGISTERED | CONFIRMED | WITHDRAWN | DISQUALIFIED)
```

---

## Example Events

### Example 1 — Faculty Gala
```
Name:     2026 UMU Faculty Gala
Type:     GALA
Level:    FACULTY
Sport:    Football
Format:   ROUND_ROBIN
Teams:    Faculty of Science, Faculty of Business, Faculty of Education, Faculty of ICT
```

### Example 2 — Inter-University Match
```
Name:     UMU vs UCU Friendly
Type:     FRIENDLY
Level:    LOCAL
Sport:    Basketball (Men)
Format:   SINGLE_MATCH
Venue:    UMU Sports Ground
```

### Example 3 — National Competition
```
Name:     FUUSA National University Games 2026
Type:     COMPETITION
Level:    NATIONAL
Sport:    (Multi-sport)
Organizer: FUUSA
Host:     Gulu University
Format:   GROUP_STAGE → KNOCKOUT
```

### Example 4 — Training Camp
```
Name:     UMU FC Pre-Season Training Camp
Type:     TRAINING
Level:    UNIVERSITY
Sport:    Football (Men)
Format:   OTHER
Venue:    UMU Training Ground
```

---

## Event Calendar

All events appear in a shared sports department calendar. The calendar view supports:

- Filter by sport
- Filter by event type
- Filter by level (internal / external)
- Monthly / weekly / list view
- Export to PDF or iCal

---

## Event Documents

Each event can have attached documents:

- Invitation letter
- Competition rules / regulations
- Travel/accommodation details
- Results sheet
- Post-event report

---

## Event Status Transitions

```
PLANNED → ACTIVE → COMPLETED
         ↓         ↓
      POSTPONED  CANCELLED
         ↓
       ACTIVE → COMPLETED
```

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| Create / edit event | ✅ | ✅ |
| Register team to event | ✅ | ✅ |
| View events | ✅ | ✅ |
| View calendar | ✅ | ✅ |
| Upload event documents | ✅ | ✅ |
| Cancel / postpone event | ✅ | ✅ |
| Manage competition structure | ✅ | ✅ |
| View standings | ✅ | ✅ |
| Delete event | ✅ | ❌ |
