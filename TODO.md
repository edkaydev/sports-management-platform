# UMU Sports — Project TODO

## Phase 1 — Project Setup

- [x] Create monorepo structure (`backend/`, `frontend/`, `docs/`)
- [x] Write `docker-compose.yml` (MySQL, API, Client)
- [x] Write `backend/Dockerfile`
- [x] Write `frontend/Dockerfile`
- [x] Initialize backend — `npm init`, TypeScript, Express
- [x] Initialize frontend — Vite + React + TypeScript
- [x] Configure ESLint + Prettier (both)
- [x] Set up `.env` files (backend)
- [x] Connect Prisma to MySQL
- [x] Write initial Prisma schema (users, seasons)
- [x] Run first migration
- [x] Verify `GET /api/health` returns 200
- [x] Set up Git branches per feature

---

## Phase 2 — Authentication & RBAC

- [x] Prisma schema — `users`, `refresh_tokens`
- [x] `POST /api/auth/login` — verify credentials, issue JWT
- [x] `POST /api/auth/refresh` — refresh access token from cookie
- [x] `POST /api/auth/logout` — revoke refresh token
- [x] `POST /api/auth/change-password`
- [x] JWT middleware — verify access token on every protected route
- [x] RBAC middleware — check role against allowed roles per route
- [x] Account lockout after 5 failed attempts
- [x] Seed script — create first TUTOR + SPORTS_REP users
- [x] Test all auth endpoints

---

## Phase 3 — Student-Athletes

- [x] Prisma schema — `student_athletes`, `sport_affiliations`, `medical_declarations`
- [x] `GET /api/athletes` — list with filters
- [x] `POST /api/athletes` — create athlete
- [x] `GET /api/athletes/:id` — single athlete
- [x] `GET /api/athletes/:id/profile` — 360° profile
- [x] `PATCH /api/athletes/:id` — update athlete
- [x] `DELETE /api/athletes/:id` — soft delete
- [x] Athlete type logic (REGULAR / SCHOLARSHIP / CONTRACT)
- [x] Seed script — sample athletes
- [x] Test all athlete endpoints

---

## Phase 4 — Sports & Teams

- [x] Prisma schema — `sports`, `teams`, `team_staff`, `team_squad`, `seasons`
- [x] CRUD endpoints for sports
- [x] CRUD endpoints for teams
- [x] CRUD endpoints for seasons
- [x] `GET /api/teams/:id/squad` — team roster
- [x] `POST /api/teams/:id/squad` — add athlete to team
- [x] `DELETE /api/teams/:id/squad/:athleteId` — remove from team
- [x] Seed script — 14 UMU sports, sample teams, current season
- [x] Test all team endpoints

---

## Phase 5 — Academic Performance

- [x] Prisma schema — `academic_records`, `course_results`
- [x] `GET /api/academic-records` — list with filters
- [x] `POST /api/academic-records` — create record
- [x] `PATCH /api/academic-records/:id` — update
- [x] `POST /api/academic-records/import` — CSV bulk import
- [x] Academic standing auto-computation logic
- [x] Academic threshold configuration (configurable by TUTOR)
- [x] Test academic endpoints

---

## Phase 6 — Scholarships & Contracts

- [x] Prisma schema — `scholarships`, `scholarship_renewals`, `athlete_contracts`
- [x] CRUD endpoints for scholarships
- [x] `POST /api/scholarships/:id/renew`
- [x] `POST /api/scholarships/:id/revoke`
- [x] `GET /api/scholarships/dashboard` — at-risk stats
- [x] CRUD endpoints for contracts
- [x] `POST /api/contracts/:id/terminate`
- [x] Auto-flag expired scholarships (scheduled job)
- [x] Auto-flag scholarships at academic risk
- [x] Test scholarship and contract endpoints

---

## Phase 7 — Events & Competitions

- [x] Prisma schema — `events`, `event_participants`, `standings`
- [x] CRUD endpoints for events
- [x] `POST /api/events/:id/participants` — register team/athlete
- [x] `GET /api/events/:id/standings` — group standings
- [x] Auto-generate round-robin fixtures from event participants
- [x] Test event endpoints

---

## Phase 8 — Fixtures & Match Management

- [x] Prisma schema — `matches`, `match_lineups`, `match_events`, `match_scores`, `match_results`, `match_reports`
- [x] CRUD endpoints for matches
- [x] `POST /api/matches/:id/lineup` — submit lineup
- [x] `POST /api/matches/:id/events` — record match event (goal, card, sub)
- [x] `POST /api/matches/:id/result` — submit final result
- [x] `POST /api/matches/:id/report` — submit match report
- [x] Auto-update standings when result recorded
- [x] Test match endpoints

---

## Phase 9 — Recruitment & Trials

- [x] Prisma schema — `prospects`, `trials`, `trial_participants`, `trial_assessments`, `recruitment_records`
- [x] CRUD endpoints for prospects
- [x] CRUD endpoints for trials
- [x] `POST /api/recruitment/trials/:id/assessments` — submit assessment
- [x] `PATCH /api/recruitment/trials/:id/attendance` — mark attendance
- [x] `POST /api/recruitment/prospects/:id/enroll` — convert to student-athlete
- [x] Overall score auto-computation
- [x] Test recruitment endpoints

---

## Phase 10 — Documents

- [x] Prisma schema — `documents`, `document_requirements`
- [x] `GET /api/documents` — list with filters
- [x] `POST /api/documents` — upload (multipart)
- [x] `GET /api/documents/:id/download` — download
- [x] `DELETE /api/documents/:id`
- [x] `PATCH /api/documents/:id/verify` — verify/unverify
- [x] Document expiry tracking + auto-status update
- [x] Athlete document checklist (completeness check)
- [x] File storage — local (`uploads/` dir, env-configurable)
- [x] Test document endpoints

---

## Phase 11 — Notifications & Alerts

- [x] Prisma schema — `notifications`
- [x] Notification service — create + deliver notifications
- [x] `GET /api/notifications` — list for current user
- [x] `PATCH /api/notifications/:id/read`
- [x] `PATCH /api/notifications/read-all`
- [x] Event-driven notifications
- [x] Test notification triggers

---

## Phase 12 — Reports

- [x] `GET /api/reports/department-overview`
- [x] `GET /api/reports/athletes`
- [x] `GET /api/reports/academic-standing`
- [x] `GET /api/reports/scholarships`
- [x] `GET /api/reports/contracts`
- [x] `GET /api/reports/recruitment`
- [x] CSV export
- [x] PDF export (pdfkit)

---

## Phase 12b — Equipment Inventory (bonus)

- [x] Prisma schema — `equipment_items`, `equipment_assignments`
- [x] CRUD endpoints for equipment (`/api/equipment`)
- [x] Assign / return equipment to athlete or team
- [x] TUTOR-only access

---

## Phase 12c — News & Announcements (bonus)

- [x] Prisma schema — `news_posts`
- [x] CRUD endpoints (`/api/news`)
- [x] Public news feed (`/api/public/news`)
- [x] Slug-based detail route

---

## Phase 13 — Frontend

### Setup
- [x] Vite + React + TypeScript scaffold
- [x] Tailwind CSS configured
- [x] React Router v6 routes defined
- [x] Axios instance with auth interceptors (auto-refresh on 401 via `/api/auth/refresh`)
- [x] Auth context (store user + role in memory, `hasRole()` helper)
- [x] Protected route wrapper (redirect to login if not authenticated)
- [x] Dashboard layout (sidebar + top bar)
- [x] TUTOR-only route guard

### Auth screens
- [x] Login page

### Dashboard
- [x] Dashboard (stats, attention required, fixtures)

### Athletes
- [x] Athlete list page (table, filters, search)
- [x] Athlete 360° profile page
- [x] Add athlete form
- [x] Edit athlete form

### Sports & Teams
- [x] Sports list + add/edit
- [x] Team list + add/edit
- [x] Squad management (add/remove players)

### Academic Performance
- [x] Academic records list (year/semester/standing filters)
- [x] Add/edit academic record modal
- [x] CSV bulk import with row-level error reporting

### Scholarships & Contracts
- [x] Scholarship dashboard stats (active, expiring, at-risk, revoked)
- [x] Scholarship list with status filter
- [x] Add/edit scholarship modal
- [x] Renew scholarship modal
- [x] Revoke scholarship modal
- [x] Contract list with status filter
- [x] Add/edit contract modal
- [x] Terminate contract modal

### Events & Competitions
- [x] Event list + add/edit
- [x] Event detail (participants, fixtures, standings)

### Fixtures & Matches
- [x] Fixture list
- [x] Match detail (lineup, live events, result)
- [x] Match event recording interface
- [x] Match report form

### Recruitment
- [x] Prospect list (search + sport/status filters)
- [x] Add/edit prospect modal
- [x] Enroll prospect as student-athlete
- [x] Trial list (sport/status filters)
- [x] Schedule/edit trial modal
- [x] Trial detail panel (participants, attendance toggle)
- [x] Assessment form (6 score fields + outcome)

### Documents
- [x] Document list (search + category/status/verification filters)
- [x] Upload document modal (multipart)
- [x] Verify/unverify toggle
- [x] Delete with confirmation
- [x] Expired date highlighted in red

### Notifications
- [x] Notification panel (bell with unread count in top bar)
- [x] Notification list page (mark one / mark all read)

### Reports
- [x] Reports page with department overview + export buttons

### Equipment (TUTOR only)
- [x] Equipment list + add/edit/delete
- [x] Assign / return equipment

### News Management
- [x] News management page (create/edit/delete posts)

### Public Site
- [x] Home page
- [x] Public fixtures + results
- [x] Public sports catalogue (list + detail)
- [x] Public teams (list + detail with squad)
- [x] Public events (list + detail with standings)
- [x] Public news (list + article detail)

---

## Phase 14 — Testing & QA

- [x] Unit tests for service layer (Jest)
- [x] Integration tests for all API endpoints (Supertest)
- [x] Role/permission tests (each endpoint tested with wrong role)
- [ ] Manual QA with Sports Tutor walkthrough

---

## Phase 15 — Deployment

- [ ] Production `docker-compose.prod.yml`
- [ ] Nginx config (reverse proxy + SSL)
- [ ] Environment variables secured (secrets manager or .env.prod)
- [ ] Database backup script (daily cron)
- [ ] Domain configured (`umu-sports.umu.ac.ug`)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Smoke test on production
- [ ] Hand over to Sports Tutor with user guide

---

## Known Issues / Outstanding Work

- File uploads are stored locally in `backend/uploads/`. For production with multiple replicas or cloud hosting, migrate to S3 or equivalent object storage.
- The 26 test `.txt` files in `backend/uploads/` from development should be cleaned up before any demo or production deployment.
- Deployment phase (Phase 15) is not yet complete — no production Nginx config or SSL setup.
