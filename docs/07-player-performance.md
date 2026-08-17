# 07 — Player Performance

## Overview

This module tracks individual athlete performance across matches and training sessions. Performance data feeds directly into the Student-Athlete 360° Profile.

---

## Performance Sources

Performance data is collected from:

1. **Match performance records** — statistics recorded per athlete per match
2. **Training sessions** — attendance tracking from training sessions
3. **Trial assessments** — scores from recruitment/trial evaluations

---

## Match Performance Record

After each match, performance stats are recorded per participating athlete.

```
PlayerMatchPerformance
├── id (UUID)
├── athlete_id (FK → StudentAthlete)
├── match_id (FK → Match)
├── team_id (FK → Team)
├── season_id (FK → Season)
├── sport_id (FK → Sport)
│
│  — Core stats —
├── points (integer, default 0)
├── assists (integer, default 0)
├── rebounds (integer, default 0)
├── steals (integer, default 0)
├── blocks (integer, default 0)
├── goals (integer, default 0)
├── shotsOnTarget (integer, default 0)
├── saves (integer, default 0)
├── tackles (integer, default 0)
├── interceptions (integer, default 0)
├── passesCompleted (integer, default 0)
├── passesAttempted (integer, default 0)
├── fouls (integer, default 0)
├── yellowCards (integer, default 0)
├── redCards (integer, default 0)
│
│  — Physical metrics —
├── sprints (integer, default 0)
├── distanceCoveredKm (decimal, nullable)
├── maxSpeedKph (decimal, nullable)
│
│  — Coach rating & notes —
├── rating (decimal 1.0–10.0, nullable)
├── notes (text, nullable)
├── recorded_by (FK → User)
├── created_at
└── updated_at
```

### Stats by Sport

| Sport | Key Stats |
|---|---|
| Football | Goals, shots on target, tackles, interceptions, passes, cards |
| Basketball | Points, rebounds, blocks, steals, assists, fouls |
| Volleyball | Points, blocks, assists, digs, aces |
| Rugby | Tries, tackles, carries, assists |
| Netball | Goals, intercepts, centre pass, rebounds |
| Athletics | Distance/time-based results recorded via match events |

---

## Performance Trends

The system provides trend views for coaches and sports admin:

- Goals / matches over time (line chart)
- Average rating trend across a season
- Comparison across teammates for a selected stat

---

## Top Performers

Leaderboards per sport/team/season:

- Top scorers
- Most assists
- Highest average rating
- Most appearances

---

## Actions by Role

| Action | TUTOR | SPORTS_REP |
|---|:---:|:---:|
| View athlete performance | ✅ | ✅ |
| Submit coach rating | ✅ | ✅ |
| Edit performance record | ✅ | ✅ |
| View leaderboards | ✅ | ✅ |
| View performance trends | ✅ | ✅ |
| Export performance data | ✅ | ✅ |
