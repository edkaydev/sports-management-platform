# UMU Sports — Project TODO

## Phase 1 — Project Setup

- [ ] Create monorepo structure (`backend/`, `frontend/`, `docs/`)
- [ ] Write `docker-compose.yml` (MySQL, API, Client)
- [ ] Write `backend/Dockerfile`
- [ ] Write `frontend/Dockerfile`
- [ ] Initialize backend — `npm init`, TypeScript, Express
- [ ] Initialize frontend — Vite + React + TypeScript
- [ ] Configure ESLint + Prettier (both)
- [ ] Set up `.env` files (backend)
- [ ] Connect Prisma to MySQL
- [ ] Write initial Prisma schema (users, seasons)
- [ ] Run first migration
- [ ] Verify `GET /api/health` returns 200
- [ ] Set up Git branches per feature

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
- [x] Seed script — create first SUPER_ADMIN user
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

- [ ] Prisma schema — `academic_records`, `course_results`
- [ ] `GET /api/academic-records` — list with filters
- [ ] `POST /api/academic-records` — create record
- [ ] `PATCH /api/academic-records/:id` — update
- [ ] `POST /api/academic-records/import` — CSV bulk import
- [ ] Academic standing auto-computation logic
- [ ] Academic threshold configuration (configurable by SPORTS_ADMIN)
- [ ] Test academic endpoints

---

## Phase 6 — Scholarships & Contracts

- [ ] Prisma schema — `scholarships`, `scholarship_renewals`, `athlete_contracts`
- [ ] CRUD endpoints for scholarships
- [ ] `POST /api/scholarships/:id/renew`
- [ ] `POST /api/scholarships/:id/revoke`
- [ ] CRUD endpoints for contracts
- [ ] `POST /api/contracts/:id/terminate`
- [ ] Auto-flag expired scholarships (scheduled job)
- [ ] Auto-flag scholarships at academic risk
- [ ] Test scholarship and contract endpoints

---

## Phase 7 — Events & Competitions

- [ ] Prisma schema — `events`, `event_participants`, `competition_groups`, `standings`, `knockout_rounds`
- [ ] CRUD endpoints for events
- [ ] `POST /api/events/:id/participants` — register team/athlete
- [ ] `GET /api/events/:id/standings` — group standings
- [ ] Auto-generate round-robin fixtures from event participants
- [ ] Auto-generate knockout bracket
- [ ] Test event endpoints

---

## Phase 8 — Fixtures & Match Management

- [ ] Prisma schema — `matches`, `match_lineups`, `lineup_entries`, `match_events`, `match_scores`, `match_results`, `match_reports`
- [ ] CRUD endpoints for matches
- [ ] `POST /api/matches/:id/lineup` — submit lineup
- [ ] `POST /api/matches/:id/events` — record match event (goal, card, sub)
- [ ] `POST /api/matches/:id/result` — submit final result
- [ ] `POST /api/matches/:id/report` — submit match report
- [ ] Auto-update standings when result recorded
- [ ] Test match endpoints

---

## Phase 9 — Recruitment & Trials

- [ ] Prisma schema — `prospects`, `trials`, `trial_participants`, `trial_assessments`, `recruitment_records`
- [ ] CRUD endpoints for prospects
- [ ] CRUD endpoints for trials
- [ ] `POST /api/trials/:id/assessments` — submit assessment
- [ ] `POST /api/prospects/:id/enroll` — convert to student-athlete
- [ ] Overall score auto-computation
- [ ] Test recruitment endpoints

---

## Phase 10 — Documents

- [ ] Prisma schema — `documents`, `document_requirements`
- [ ] `GET /api/documents` — list with filters
- [ ] `POST /api/documents` — upload (multipart)
- [ ] `GET /api/documents/:id/download` — pre-signed URL
- [ ] `DELETE /api/documents/:id`
- [ ] Document expiry tracking + auto-status update
- [ ] Athlete document checklist (completeness check)
- [ ] File storage — S3 or local depending on env
- [ ] Test document endpoints

---

## Phase 11 — Notifications & Alerts

- [ ] Prisma schema — `notifications`, `notification_rules`
- [ ] Notification service — create + deliver notifications
- [ ] `GET /api/notifications` — list for current user
- [ ] `PATCH /api/notifications/:id/read`
- [ ] `PATCH /api/notifications/read-all`
- [ ] Scheduled jobs for: scholarship expiry, document expiry, missing academic records
- [ ] Event-driven notifications: match result, lineup due, trial pending
- [ ] Email delivery via Nodemailer (optional, toggle per rule)
- [ ] Test notification triggers

---

## Phase 12 — Reports

- [ ] `GET /api/reports/department-overview`
- [ ] `GET /api/reports/athletes` (with CSV/PDF export)
- [ ] `GET /api/reports/academic-standing`
- [ ] `GET /api/reports/scholarships`
- [ ] `GET /api/reports/contracts`
- [ ] `GET /api/reports/match-results`
- [ ] `GET /api/reports/player-performance`
- [ ] `GET /api/reports/fixture-schedule`
- [ ] `GET /api/reports/recruitment`
- [ ] `GET /api/reports/document-compliance`
- [ ] PDF export (use `pdfkit` or `puppeteer`)
- [ ] CSV export

---

## Phase 13 — Frontend

### Setup
- [ ] Vite + React + TypeScript scaffold
- [ ] Tailwind CSS configured
- [ ] React Router v6 routes defined
- [ ] Axios instance with auth interceptors (auto-refresh on 401)
- [ ] Auth context (store user + role in memory)
- [ ] Protected route wrapper (redirect to login if not authenticated)
- [ ] Dashboard layout (sidebar + top bar)

### Auth screens
- [ ] Login page
- [ ] Change password page

### Dashboard
- [ ] SPORTS_ADMIN dashboard (stats, attention required, today's fixtures)
- [ ] COACH dashboard (own teams, upcoming fixtures)
- [ ] ATHLETE dashboard (own profile summary, next fixture)

### Athletes
- [ ] Athlete list page (table, filters, search)
- [ ] Athlete 360° profile page
- [ ] Add athlete form
- [ ] Edit athlete form

### Sports & Teams
- [ ] Sports list
- [ ] Team list
- [ ] Team detail page (squad, staff, fixtures)
- [ ] Squad management (add/remove players)

### Academic Performance
- [ ] Academic records list
- [ ] Enter/edit academic record form
- [ ] Bulk import page (CSV upload)

### Scholarships & Contracts
- [ ] Scholarship list (with status filters)
- [ ] Add/edit scholarship form
- [ ] Renew / revoke scholarship actions
- [ ] Contract list
- [ ] Add/edit contract form

### Events & Competitions
- [ ] Event list
- [ ] Event detail page (participants, fixtures, standings)
- [ ] Add event form
- [ ] Standings table

### Fixtures & Matches
- [ ] Fixture list (table view)
- [ ] Fixture calendar (monthly/weekly/list)
- [ ] Match detail page (lineup, live events, result)
- [ ] Lineup submission form
- [ ] Match event recording interface
- [ ] Match report form

### Recruitment
- [ ] Prospect list
- [ ] Add prospect form
- [ ] Trial list
- [ ] Trial detail (participants, assessments)
- [ ] Assessment form
- [ ] Enroll prospect action

### Documents
- [ ] Document list (per athlete + global)
- [ ] Upload document form
- [ ] Document checklist view per athlete

### Notifications
- [ ] Notification panel (bell dropdown)
- [ ] Notification list page

### Reports
- [ ] Department overview report page
- [ ] Individual report pages with export buttons

---

## Phase 14 — Testing & QA

- [ ] Unit tests for service layer (Jest)
- [ ] Integration tests for all API endpoints (Supertest)
- [ ] Role/permission tests (each endpoint tested with wrong role)
- [ ] Data scoping tests (coach can't see other team's data)
- [ ] Manual QA with Sports Tutor walkthrough

---

## Phase 15 — Deployment

- [ ] Production `docker-compose.prod.yml`
- [ ] Nginx config (reverse proxy + SSL)
- [ ] Environment variables secured
- [ ] Database backup script (daily cron)
- [ ] Domain configured (`umu-sports.umu.ac.ug`)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Smoke test on production
- [ ] Hand over to Sports Tutor with user guide
