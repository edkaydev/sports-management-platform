# UMU Sports — University Sports & Student-Athlete Management System

A web-based management system for Uganda Martyrs University Sports Department.

Manages the full student-athlete lifecycle: sports performance, academic tracking, scholarships, contracts, recruitment, documents, fixtures, and match results.

---

## Stack

- **Frontend** — React + TypeScript + Vite + Tailwind CSS + React Router + TanStack Query
- **Backend** — Node.js + Express + TypeScript + Prisma + Zod (Jest + Supertest for tests)
- **Database** — MySQL 8
- **Infrastructure** — Docker + Docker Compose

---

## Feature Modules (Backend)

| Module | Base path | Highlights |
|---|---|---|
| Auth & Users | `/api/auth` | Login, refresh, logout, password change, RBAC |
| Sports | `/api/sports` | Sport catalogue (team/individual) |
| Seasons | `/api/seasons` | Academic/sporting season management |
| Teams | `/api/teams` | Teams, squads, staff assignments |
| Athletes | `/api/athletes` | CRUD, 360° profiles, affiliations |
| Academic | `/api/academic` | Records, course results, CSV import |
| Scholarships | `/api/scholarships` | Award, renew, revoke, at-risk dashboard |
| Contracts | `/api/contracts` | Playing/coaching contracts, termination |
| Recruitment | `/api/recruitment` | Prospects, trials, assessments, enrolment |
| Documents | `/api/documents` | Upload, verify, expiry tracking |
| Notifications | `/api/notifications` | In-app alerts, rule-based checks |
| Events | `/api/events` | Competitions, participant registration |
| Matches | `/api/matches` | Fixtures, lineups, match events, results, reports |
| Performance | `/api/performances`, `/api/training-sessions` | Match performance, training attendance |
| Reports | `/api/reports` | Department overview, athlete, academic, scholarship reports (JSON/CSV/PDF) |
| Public site | `/api/public` | Open catalogue, sports, teams, fixtures, events — no login required |

---

## Getting Started

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

Edit `backend/.env` if needed (defaults work for local development).

### 3. Start everything

```bash
docker compose up -d
```

This starts:
- MySQL on port `3306`
- API on port `3000`
- Client on port `5173`

### 4. Run database migrations and seed demo data

```bash
docker compose exec api npx prisma migrate dev
docker compose exec api npx prisma db seed
```

The seed creates two staff accounts and demo data (sports, teams, athletes, academic records, scholarships, contracts, events, fixtures, training, prospects).

Two roles are used:
- **TUTOR** (Sports Tutor / Overall) — full access including user management and record deletion
- **SPORTS_REP** (Secretary of Sports, University Union) — all content editing, no user management and no record deletion

- **Tutor login:** `tutor@umu.ac.ug` / `Tutor@2025`
- **Sport Rep login:** `sportrep@umu.ac.ug` / `SportRep@2025`

### 5. Open the app

- Frontend: http://localhost:5173
- API health check: http://localhost:3000/api/health

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
│       ├── lib/          # API client, auth context
│       └── pages/        # Route pages
├── docs/                 # Specification documents (18 files)
├── docker-compose.yml
├── TODO.md
├── COMMANDS.md
└── DEPLOYMENT.md
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

The backend test suite runs against a real MySQL database and covers all 16 feature modules.

---

## Documentation

| File | Description |
|---|---|
| `docs/01-product-overview.md` | What the system does and why |
| `docs/14-system-architecture.md` | Technical architecture |
| `docs/15-database-specification.md` | Database schema |
| `docs/17-api-specification.md` | All API endpoints |
| `docs/18-ui-ux-specification.md` | UI/UX design guidelines |
| `TODO.md` | Full task list by phase |
| `COMMANDS.md` | All useful commands |
| `DEPLOYMENT.md` | Ubuntu server deployment guide |

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

See `COMMANDS.md` for the full reference.
