# UMU Sports — University Sports & Student-Athlete Management System

A web-based management system for Uganda Martyrs University Sports Department.

Manages the full student-athlete lifecycle: sports performance, academic tracking, scholarships, contracts, recruitment, documents, fixtures, and match results.

---

## Stack

- **Frontend** — React + TypeScript + Vite + Tailwind CSS
- **Backend** — Node.js + Express + TypeScript + Prisma
- **Database** — MySQL 8
- **Infrastructure** — Docker + Docker Compose

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

### 4. Run database migrations

```bash
docker compose exec api npx prisma migrate dev
```

### 5. Open the app

- Frontend: http://localhost:5173
- API health check: http://localhost:3000/api/health

---

## Project Structure

```
sports-management-platform/
├── backend/              # Express API
│   ├── prisma/           # Schema + migrations
│   └── src/
│       ├── config/       # DB, logger
│       ├── middleware/   # Auth, RBAC, error handler
│       └── modules/      # Feature modules
├── frontend/             # React client
│   └── src/
│       ├── api/          # Axios + API calls
│       ├── components/   # Shared UI components
│       ├── features/     # Feature modules
│       └── pages/        # Route pages
├── docs/                 # Specification documents (18 files)
├── docker-compose.yml
├── TODO.md
├── COMMANDS.md
└── DEPLOYMENT.md
```

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
