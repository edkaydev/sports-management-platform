# 01 — Product Overview

## Project Name

**University Sports & Student-Athlete Management System (USSAMS)**
_Codename: UMU Sports_

---

## Problem Statement

Uganda Martyrs University (UMU) Sports Department currently manages student-athletes using a combination of paper forms, spreadsheets, and disconnected Google Forms. The Sports Tutor has no unified system to:

- Track academic performance of student-athletes
- Monitor scholarship eligibility and status
- Manage recruitment, trials, and selection
- Maintain student-athlete documents (registrations, medical, competition forms)
- Manage fixtures, match results, and team lineups across multiple sports
- Get timely alerts about at-risk athletes

The result is information scattered across papers, emails, and informal records — making it nearly impossible to manage student-athletes holistically.

---

## Solution

A web-based **University Sports & Student-Athlete Management System** that gives UMU's Sports Department a single platform to manage the full student-athlete lifecycle:

> Sports performance + Academic performance + Scholarships + Recruitment + Documents

The central concept is the **Student-Athlete 360° Profile** — one view per student that brings together everything the sports department needs to know about them.

---

## Target Institution

**Uganda Martyrs University (UMU)**
Sports Department, Nkozi Campus

---

## Primary Users

| Role | Primary Need |
|---|---|
| TUTOR (Sports Tutor / Overall) | Full department management, user accounts, record deletion |
| SPORTS_REP (Secretary of Sports, University Union) | All day-to-day content editing and operations |
| Public visitors | Browse sports, teams, fixtures, results, and events on the open website (no login) |

---

## Core Modules

| # | Module | Description |
|---|---|---|
| 1 | Student-Athlete Management | Registration, profiles, Student-Athlete 360° |
| 2 | Sports & Teams | Sports disciplines, teams, coaches, squads |
| 3 | Events & Competitions | All sporting events across all levels |
| 4 | Fixtures & Match Management | Scheduling, lineups, live scoring, results |
| 5 | Player Performance | Individual stats, match performance, history |
| 6 | Academic Performance | GPA, results, attendance, academic standing |
| 7 | Scholarships | Scholarship types, eligibility, renewal, tracking |
| 8 | Recruitment & Trials | Pipeline from prospect to team member |
| 9 | Documents & Records | All forms, certificates, clearances per athlete |
| 10 | Notifications & Alerts | System-generated alerts for at-risk situations |
| 11 | Reports & Analytics | Department-level and individual-level reports |
| 12 | Equipment Inventory | Department equipment tracking, assignment, return (TUTOR-only) |
| 13 | News & Announcements | News posts with draft/published workflow |

---

## Sports Disciplines at UMU

Based on the official UMU Sports Registration Form:

1. Football (Men)
2. Football (Women)
3. Volleyball (Men)
4. Volleyball (Women) _(implied)_
5. Basketball (Men)
6. Basketball (Women)
7. Netball
8. Rugby
9. Tennis
10. Table Tennis
11. Badminton
12. Athletics
13. Chess
14. Scrabble

---

## Key Design Principles

1. **Athlete-first** — every piece of data connects back to the student-athlete
2. **Alert-driven** — the system proactively flags problems (academic risk, scholarship expiry, missing documents)
3. **Role-based access** — each user sees only what their role permits
4. **Broad event model** — the system handles everything from informal campus galas to international competitions
5. **Document-aware** — every major action can have attached documents
6. **Audit trail** — all changes are logged with user and timestamp

---

## Out of Scope (v1.0)

- Financial payments / fee management
- Student enrollment / academic registration (integrates with, does not replace)
- Medical records management (flag only, not clinical system)
- Live video/streaming of matches
- Mobile native app (responsive web only in v1.0)

---

## Success Metrics

| Metric | Target |
|---|---|
| All active student-athletes have a profile | 100% |
| Sports Tutor can view any athlete's full status in < 30 seconds | Yes |
| Scholarship reviews triggered automatically | Yes |
| Match results recorded within 24 hours | Yes |
| Documents searchable and filterable | Yes |
| Zero paper forms required for standard operations | v1.0 goal |

---

## Tech Stack (Proposed)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript |
| Backend | Node.js + Express (REST API) |
| Database | MySQL 8 |
| Auth | JWT + Role-Based Access Control |
| File Storage | Local disk (configurable for S3 in future) |
| Hosting | Docker + Ubuntu Server (Nginx reverse proxy) |

> See `14-system-architecture.md` for full technical design.

---

## Document Index

| File | Description |
|---|---|
| `01-product-overview.md` | This document |
| `02-users-and-roles.md` | RBAC, permissions, role definitions |
| `03-student-athlete-management.md` | Athlete profiles and 360° view |
| `04-sports-and-teams.md` | Sports, teams, coaches, squads |
| `05-events-and-competitions.md` | Events model and competition types |
| `06-fixtures-and-match-management.md` | Scheduling, lineups, scoring |
| `07-player-performance.md` | Individual stats and performance tracking |
| `08-academic-performance.md` | Academic records linked to athletes |
| `09-scholarships.md` | Scholarship management and eligibility |
| `10-recruitment-and-trials.md` | Recruitment pipeline and trials |
| `11-documents-and-records.md` | Document management per athlete |
| `12-notifications-and-alerts.md` | System alerts and notifications |
| `13-reports-and-analytics.md` | Reports, dashboards, exports |
| `14-system-architecture.md` | Technical architecture |
| `15-database-specification.md` | Full database schema |
| `16-permissions-and-security.md` | Security model and access control |
| `17-api-specification.md` | REST API endpoints |
| `18-ui-ux-specification.md` | UI/UX guidelines and screen flows |
