# 07 — Player Performance

## Overview

This module tracks individual athlete performance across matches, training sessions, and competitions. Performance data feeds directly into the Student-Athlete 360° Profile.

---

## Performance Sources

Performance data is collected from:

1. **Match events** — goals, assists, cards, substitutions recorded during a match
2. **Coach ratings** — subjective per-match ratings submitted by the coach after each game
3. **Training attendance** — attendance records from training sessions
4. **Trial assessments** — scores from recruitment/trial evaluations

---

## Match Performance Record

After each match, the system auto-generates a performance snapshot per athlete, which the coach can supplement with ratings.

```
PlayerMatchPerformance
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── match_id (FK → Match)
├── team_id (FK → Team)
├── was_starter (boolean)
├── minutes_played (integer)
├── was_substituted_off (boolean)
├── substituted_off_minute (integer, nullable)
├── was_substituted_on (boolean)
├── substituted_on_minute (integer, nullable)
│
│  — Auto-populated from MatchEvent records —
├── goals (integer, default 0)
├── assists (integer, default 0)
├── yellow_cards (integer, default 0)
├── red_cards (integer, default 0)
├── own_goals (integer, default 0)
├── penalties_scored (integer, default 0)
├── penalties_missed (integer, default 0)
│
│  — Coach-submitted ratings (1–10) —
├── rating_overall (decimal 1.0–10.0, nullable)
├── rating_technical (decimal, nullable)
├── rating_physical (decimal, nullable)
├── rating_tactical (decimal, nullable)
├── coach_notes (text, nullable)
├── rated_by (FK → User — Coach)
└── rated_at (timestamp)
```

---

## Season Aggregate Stats

Aggregated automatically from individual match performance records.

```
PlayerSeasonStats
├── athlete_id (FK → StudentAthlete)
├── team_id (FK → Team)
├── season_id (FK → Season)
├── sport_id (FK → Sport)
│
├── matches_played
├── matches_started
├── minutes_played
├── goals
├── assists
├── yellow_cards
├── red_cards
├── own_goals
├── average_rating (computed)
└── last_updated (timestamp)
```

These are recalculated whenever a match performance record is saved or updated.

---

## Sport-Specific Stats

Different sports track different statistics. The system supports a flexible **custom stats** model in addition to the core stats.

```
SportStatDefinition
├── id (UUID)
├── sport_id (FK → Sport)
├── stat_key (e.g. "blocks", "rebounds", "tries", "conversions")
├── stat_label (e.g. "Blocks", "Rebounds")
├── data_type (enum: INTEGER | DECIMAL | BOOLEAN)
└── is_active (boolean)

PlayerCustomStat
├── match_performance_id (FK → PlayerMatchPerformance)
├── stat_definition_id (FK → SportStatDefinition)
└── value (text — stored as string, cast on read)
```

### Examples by Sport

| Sport | Custom Stats |
|---|---|
| Football | Shots, Shots on Target, Saves (GK), Clean Sheet (GK), Tackles |
| Basketball | Points, Rebounds, Blocks, Steals, Turnovers, Field Goal % |
| Volleyball | Spikes, Blocks, Serves, Digs, Aces |
| Rugby | Tries, Conversions, Tackles, Carries |
| Netball | Goals, Intercepts, Centre Pass |
| Athletics | Time (seconds), Distance (metres), Height (metres) |

---

## Performance Trends

The system provides trend views for coaches and sports admin:

- Goals / matches over time (line chart)
- Average rating trend across a season
- Minutes played per match (bar chart)
- Comparison across teammates for a selected stat

---

## Top Performers

Leaderboards per sport/team/season:

- Top scorers
- Most assists
- Highest average rating
- Most appearances
- Most minutes played

---

## Performance Flags

The system automatically flags performance-related concerns:

| Flag | Trigger |
|---|---|
| `POOR_FORM` | Average rating < 5.0 over last 5 matches |
| `ABSENT_TRAINING` | Missed > 3 consecutive training sessions |
| `FREQUENT_CARDS` | 2+ yellow cards in last 5 matches |
| `INACTIVE` | No match appearance in 30+ days (while team is active) |

These flags surface on the athlete's 360° profile and the notifications dashboard.

---

## Individual Sport Performance

For individual sports (Athletics, Tennis, Chess, etc.):

```
IndividualEventResult
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── match_id (FK → Match)
├── event_name (e.g. "100m Sprint", "Long Jump")
├── result_value (decimal — time in seconds, distance in metres, etc.)
├── result_unit (enum: SECONDS | METRES | POINTS | RANK)
├── position (integer — finishing position)
├── is_personal_best (boolean)
├── notes (text)
└── recorded_by (FK → User)
```

---

## Actions by Role

| Action | SPORTS_ADMIN | COACH | OFFICIAL | ATHLETE |
|---|:---:|:---:|:---:|:---:|
| View athlete performance | ✅ | 🔶 own team | ❌ | 👁 own only |
| Submit coach rating | ✅ | ✅ | ❌ | ❌ |
| Edit performance record | ✅ | 🔶 | ❌ | ❌ |
| View leaderboards | ✅ | ✅ | ❌ | ✅ |
| View performance trends | ✅ | ✅ | ❌ | 👁 own only |
| Export performance data | ✅ | 🔶 | ❌ | ❌ |
