# 14 — System Architecture

## Overview

The system is a standard **three-tier web application**: a React frontend, a Node/Express REST API backend, and a PostgreSQL database. The architecture prioritises simplicity, maintainability, and clear separation of concerns.

---

## High-Level Architecture

```
┌───────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                    │
│                React + TypeScript (SPA)               │
└──────────────────────────┬────────────────────────────┘
                           │ HTTPS / REST API
┌──────────────────────────▼────────────────────────────┐
│                     API SERVER                        │
│             Node.js + Express (REST API)              │
│                                                       │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Auth Middleware (JWT verification + RBAC)       │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │  Route Handlers → Controllers → Services        │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────┬────────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
┌─────────▼──────┐ ┌───────▼───────┐ ┌──────▼──────┐
│  PostgreSQL    │ │  File Storage │ │  Email      │
│  Database      │ │  (S3 / local) │ │  Service    │
└────────────────┘ └───────────────┘ └─────────────┘
```

---

## Frontend

| Concern | Choice |
|---|---|
| Framework | React 18+ |
| Language | TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| State management | React Context + React Query (server state) |
| HTTP client | Axios |
| Form handling | React Hook Form + Zod validation |
| Styling | Tailwind CSS |
| Tables / data grids | TanStack Table |
| Charts | Recharts |
| Date handling | date-fns |

### Frontend Structure

```
src/
├── api/           # Axios instance + API call functions
├── components/    # Shared UI components (Button, Table, Modal, etc.)
├── features/      # Feature modules (athletes, teams, matches, etc.)
│   ├── athletes/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types.ts
│   ├── matches/
│   ├── scholarships/
│   └── ...
├── hooks/         # Shared custom hooks
├── layouts/       # Page layout wrappers (DashboardLayout, AuthLayout)
├── pages/         # Top-level route pages
├── store/         # Auth context, user context
├── types/         # Shared TypeScript types
└── utils/         # Helpers, formatters, validators
```

---

## Backend

| Concern | Choice |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Validation | Zod |
| Authentication | JWT (jsonwebtoken) |
| Password hashing | bcrypt |
| File uploads | Multer |
| Email | Nodemailer |
| Logging | Winston |
| Testing | Jest + Supertest |

### Backend Structure

Clean Architecture — business logic is isolated in the service layer. Controllers handle HTTP only. Prisma is the infrastructure layer.

```
src/
├── config/          # DB config, env config, constants
├── middleware/       # Auth, RBAC, error handler, request logger, rate limiter
├── modules/         # Feature modules — each follows the same structure:
│   ├── auth/
│   │   ├── auth.routes.ts      ← HTTP routing only
│   │   ├── auth.controller.ts  ← parse request, call service, send response
│   │   ├── auth.service.ts     ← all business logic lives here
│   │   └── auth.schema.ts      ← Zod validation schemas
│   ├── athletes/
│   ├── teams/
│   ├── matches/
│   ├── scholarships/
│   ├── academics/
│   ├── recruitment/
│   ├── documents/
│   ├── notifications/
│   └── reports/
├── prisma/          # Prisma schema + migrations (infrastructure layer)
├── types/           # Shared TypeScript types
├── utils/           # Helpers (pagination, response formatter, etc.)
└── app.ts           # Express app setup
```

**Layer responsibilities:**
- `routes` — map HTTP verbs + paths to controllers
- `controller` — validate input (Zod), call service, return HTTP response
- `service` — business logic, DB queries via Prisma, enforces data scoping
- `prisma` — database access only, no business logic

---

## Database

| Concern | Choice |
|---|---|
| Engine | MySQL 8+ |
| ORM / Query Builder | Prisma |
| Migrations | Prisma Migrate |
| Connection pooling | Prisma built-in |

See `15-database-specification.md` for the full schema.

---

## Authentication Flow

```
1. POST /api/auth/login { email, password }
      ↓
2. Server verifies password (bcrypt.compare)
      ↓
3. Server issues:
   - accessToken  (JWT, 15 min, in response body)
   - refreshToken (JWT, 7 days, in httpOnly cookie)
      ↓
4. Client stores accessToken in memory (not localStorage)
      ↓
5. Every API request: Authorization: Bearer <accessToken>
      ↓
6. Auth middleware verifies token + attaches user + role to req
      ↓
7. RBAC middleware checks role against required permission
      ↓
8. Controller executes (scope-checked in service layer)
```

### Token Refresh

```
When accessToken expires (401 response):
  → Client calls POST /api/auth/refresh
  → Server reads refreshToken from httpOnly cookie
  → Issues new accessToken
  → Client retries original request
```

---

## File Storage

- Document uploads stored in AWS S3 (or local disk in development)
- Files accessed via pre-signed URLs (time-limited, no public access)
- File paths in DB are S3 keys, not public URLs
- Max file size: 10 MB
- Accepted types: PDF, JPEG, PNG, DOCX, XLSX

---

## API Design

- RESTful JSON API
- All responses use a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "message": "OK"
}
```

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Athlete not found"
}
```

- Pagination uses `page` + `pageSize` query params
- All dates in ISO 8601 format (UTC)
- IDs are UUIDs

---

## Environment Configuration

```
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mysql://user:password@localhost:3306/umu_sports

# JWT
JWT_SECRET=<long random string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
STORAGE_PROVIDER=local | s3
AWS_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=sports@umu.ac.ug
```

---

## Deployment (Recommended)

| Component | Option |
|---|---|
| Frontend | Vercel / Netlify / Nginx static |
| Backend API | Railway / Render / Ubuntu VPS + PM2 |
| Database | PlanetScale (managed MySQL) / Railway / VPS |
| File Storage | AWS S3 |
| Domain | umu-sports.umu.ac.ug |
| SSL | Let's Encrypt |

---

## Docker

The entire stack runs in Docker containers for local development and deployment consistency.

### Services

```yaml
# docker-compose.yml
services:

  db:
    image: mysql:8
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: umu_sports
      MYSQL_USER: umu
      MYSQL_PASSWORD: umu_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  api:
    build: ./backend
    restart: always
    depends_on:
      - db
    environment:
      DATABASE_URL: mysql://umu:umu_pass@db:3306/umu_sports
      JWT_SECRET: changeme
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - ./backend:/app
      - /app/node_modules

  client:
    build: ./frontend
    restart: always
    depends_on:
      - api
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  mysql_data:
```

### Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/app.js"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]
```

### Commands

```bash
# Start everything
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate dev

# Seed database
docker compose exec api npx prisma db seed

# View API logs
docker compose logs -f api

# Stop everything
docker compose down
```

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| API response time (p95) | < 500ms |
| Concurrent users | 50 simultaneous (v1.0) |
| Uptime | 99% (excluding scheduled maintenance) |
| Data backup | Daily automated backups |
| Session timeout | 15 min access token, 7 day refresh |
| Audit logging | All write operations logged |

---

## Technical Concepts Applied in This Project

This table maps each architectural concept to where it is used in the system.

| Concept | Where it appears in this project |
|---|---|
| **Authentication** | JWT access + refresh tokens. Login, token refresh, password reset. Defined in `16-permissions-and-security.md` and `17-api-specification.md` (`/api/auth/*`). |
| **RBAC** | 2 roles: TUTOR (full access) and SPORTS_REP (content editing). Every API route declares required roles. Defined in `02-users-and-roles.md` and `16-permissions-and-security.md`. |
| **Docker** | Full `docker-compose.yml` with three services: MySQL, Express API, React client. See Docker section above. |
| **CORS** | Express API allows only the frontend domain. Configured via `cors` middleware with explicit `origin` whitelist. Defined in `16-permissions-and-security.md`. |
| **Clean Architecture** | Backend is structured in layers: Routes → Controllers → Services → Prisma (DB). Business logic lives in the service layer only — controllers never touch the DB directly. This makes it easy to swap Prisma or MySQL without rewriting business rules. |
| **Load Balancing** | Not required in v1.0 (single-server deployment). In production scaling: an Nginx reverse proxy in front of multiple API containers handles load balancing. The Docker setup makes this straightforward to add. |
| **Distributed Systems** | Not applicable in v1.0. The system is a monolith — one API, one DB, one file store. Distributed architecture (microservices, message queues) would only be introduced if the system scales beyond a single university. |
| **System Design** | The full system design is captured across `01-product-overview.md` through `18-ui-ux-specification.md`. Database schema in `15`, API contract in `17`, architecture in `14`. |
