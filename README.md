# UMU Sports — University Sports & Student-Athlete Management System

A local-first management system for the Uganda Martyrs University (UMU) Sports Department — designed to run on the Sports Tutor's own computer with username/password sign in.

Manages the full student-athlete lifecycle: sports performance, academic tracking, scholarships, contracts, recruitment, documents, fixtures, and match results — with CSV and PDF report downloads.

---

## Stack

- **Frontend** — React + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query
- **Backend** — Node.js + Express + TypeScript + Prisma + Zod (Jest + Supertest for tests)
- **Database** — MySQL 8 (via Docker)
- **Deployment** — Local machine, double-click to start (`start.command` on macOS, `start.bat` on Windows)

---

## Feature Modules (Backend)

| Module | Base path | Highlights |
|---|---|---|
| Auth | `/api/auth` | Login, refresh, logout, password change, RBAC |
| Sports | `/api/sports` | Sport catalogue (team/individual) |
| Seasons | `/api/seasons` | Academic/sporting season management |
| Teams | `/api/teams` | Teams, squads, staff assignments |
| Athletes | `/api/athletes` | CRUD, 360° profiles, affiliations |
| Academic | `/api/academic-records` | Records, course results, CSV import |
| Scholarships | `/api/scholarships` | Award, renew, revoke, at-risk dashboard |
| Contracts | `/api/contracts` | Playing/coaching contracts, termination |
| Recruitment | `/api/recruitment` | Prospects, trials, assessments, enrolment |
| Documents | `/api/documents` | Upload, verify, expiry tracking |
| Notifications | `/api/notifications` | In-app alerts, rule-based checks |
| Events | `/api/events` | Competitions, participant registration |
| Matches | `/api/matches` | Fixtures, lineups, match events, results, reports |
| Performance | `/api/performances`, `/api/training-sessions` | Match performance, training attendance |
| Reports | `/api/reports` | Department overview, athlete, academic, scholarship, contract reports (JSON/CSV/PDF) |
| Equipment | `/api/equipment` | Inventory management, assignment/return (TUTOR-only) |
| News | `/api/news` | News/announcements with draft/published workflow |
| Users | `/api/users` | User accounts, roles, reset password (TUTOR-only) |

---

## Getting Started (local, one user)

### Prerequisites

- Docker Desktop installed and running
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sports-management-platform.git
cd sports-management-platform
```

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed (defaults work for local use).

### 3. Start the app

Double-click **`start.command`** (macOS) or **`start.bat`** (Windows) — it starts the stack, runs migrations, seeds the tutor account, and opens the browser. Alternatively:

```bash
docker compose up -d
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

### 4. First sign in

The seed creates one **TUTOR** account and demo data (sports, teams, athletes, academic records, scholarships, contracts, events, fixtures, training, prospects).

- **Sign in:** username `tutor` / password `Tutor@2025`

On first sign in you are required to set your own password. Once signed in (as Sports Tutor), you can create more user accounts from **User Accounts** in the sidebar — new users must set their own passwords on first sign in, and you can reset any user's password at any time.

> Stopping the app keeps all data: double-click **`stop.command`** (macOS) or **`stop.bat`** (Windows).
>
> Kiosk / full-screen mode: double-click **`kiosk.command`** (macOS) or **`kiosk.bat`** (Windows).

For a step-by-step setup on a brand-new Windows PC, see **`WINDOWS-SETUP.md`**.

---

## Project Structure

```
sports-management-platform/
├── backend/              # Express API
│   ├── prisma/           # Schema + migrations + seed
│   └── src/
│       ├── config/       # DB, logger
│       ├── middleware/   # Auth, RBAC, validation, error handler
│       ├── modules/      # Feature modules (routes, controllers, services, schemas, tests)
│       └── server.ts
├── frontend/             # React client
│   └── src/
│       ├── components/   # Shared UI + layout components
│       ├── lib/          # API client (api.ts), auth context (auth.tsx)
│       └── pages/        # Route pages (admin)
├── docker-compose.yml
├── start.command         # macOS launcher
├── stop.command          # macOS stopper
├── kiosk.command         # macOS full-screen mode
├── start.bat             # Windows launcher
├── stop.bat              # Windows stopper
├── kiosk.bat             # Windows full-screen mode
└── WINDOWS-SETUP.md      # New-PC Windows setup guide
```

---

## Testing

```bash
# Backend unit + integration tests (Jest + Supertest)
cd backend
npm test

# Frontend type-check + production build
cd frontend
npm run build
```

The backend test suite runs against a real MySQL database and covers all 17 feature modules.

---

## Documentation

| File | Description |
|---|---|
| `TODO.md` | Full task list by phase |
| `WINDOWS-SETUP.md` | Step-by-step setup guide for a new Windows PC |

---

## Common Commands

```bash
# Start dev environment
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate dev

# View API logs
docker compose logs -f api

# Open DB browser
docker compose exec api npx prisma studio
```
