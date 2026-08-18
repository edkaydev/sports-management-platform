# Commands Reference

---

## Docker — Development

```bash
# Start all services (MySQL + API + Client)
docker compose up -d

# Start and watch logs
docker compose up

# Stop all services
docker compose down

# Stop and delete all data (resets database)
docker compose down -v

# Rebuild images after code changes
docker compose build

# Rebuild and restart
docker compose up -d --build

# Restart a single service
docker compose restart api
docker compose restart client
docker compose restart db

# View logs
docker compose logs -f
docker compose logs -f api
docker compose logs -f db

# Check running containers
docker compose ps

# Open a shell inside a container
docker compose exec api sh
docker compose exec db sh
```

---

## Docker — Production

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Stop production stack
docker compose -f docker-compose.prod.yml down

# View production logs
docker compose -f docker-compose.prod.yml logs -f api

# Restart production API
docker compose -f docker-compose.prod.yml restart api

# Check status
docker compose -f docker-compose.prod.yml ps
```

---

## Database — Prisma

```bash
# Run migrations (development)
docker compose exec api npx prisma migrate dev

# Run migrations (production — no prompt)
docker compose exec api npx prisma migrate deploy

# Create a new migration
docker compose exec api npx prisma migrate dev --name add_some_table

# Reset database (DANGER — wipes all data)
docker compose exec api npx prisma migrate reset

# Seed the database
docker compose exec api npx prisma db seed

# Open Prisma Studio (visual DB browser)
docker compose exec api npx prisma studio

# Pull schema from existing DB
docker compose exec api npx prisma db pull

# Generate Prisma client after schema changes
docker compose exec api npx prisma generate
```

---

## Database — MySQL Shell

```bash
# Open MySQL shell (development)
docker compose exec db mysql -u umu -p umu_sports

# Open MySQL shell (production)
docker compose -f docker-compose.prod.yml exec db mysql -u umu -p umu_sports

# Inside MySQL shell:
SHOW TABLES;
DESCRIBE student_athletes;
SELECT * FROM users;
EXIT;
```

---

## Database — Backups

```bash
# Automated backup (production — runs daily via cron)
./scripts/backup-db.sh

# Dry-run (print command without executing)
./scripts/backup-db.sh --dry-run

# Manual backup (development)
docker compose exec db mysqldump -u umu -pumu_pass umu_sports > backup.sql

# Manual backup (production)
docker compose -f docker-compose.prod.yml exec -T db \
  mysqldump -u umu -p${MYSQL_PASSWORD} umu_sports > backup_$(date +%Y-%m-%d).sql

# Restore from backup
docker compose exec -T db mysql -u umu -pumu_pass umu_sports < backup.sql
```

---

## Backend

```bash
# Install dependencies
cd backend && npm install

# Run in development (with hot reload)
npm run dev

# Build TypeScript
npm run build

# Run built output
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

---

## Frontend

```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

---

## Git

```bash
# Create and switch to a feature branch
git checkout -b feat/auth-rbac

# Stage specific files
git add src/modules/auth/

# Commit
git commit -m "feat: add JWT auth and RBAC middleware"

# Push branch and set upstream
git push -u origin feat/auth-rbac

# Pull latest main
git checkout main && git pull origin main

# Merge feature branch into main
git checkout main
git merge feat/auth-rbac

# Delete feature branch after merge
git branch -d feat/auth-rbac
git push origin --delete feat/auth-rbac

# View all branches
git branch -a

# View commit log
git log --oneline --graph
```

---

## Nginx (Ubuntu server)

```bash
# Test config
sudo nginx -t

# Reload config (no downtime)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## SSL — Certbot

```bash
# Get certificate
sudo certbot --nginx -d umu-sports.umu.ac.ug

# Renew certificates
sudo certbot renew

# Test renewal (dry run)
sudo certbot renew --dry-run

# List certificates
sudo certbot certificates
```

---

## Server — General

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check open ports
sudo ss -tlnp

# View system logs
sudo journalctl -f

# Reboot server
sudo reboot
```

---

## Quick Reference — Common Tasks

| Task | Command |
|---|---|
| Start dev environment | `docker compose up -d` |
| Run a migration | `docker compose exec api npx prisma migrate dev` |
| Seed database | `docker compose exec api npx prisma db seed` |
| Open DB browser | `docker compose exec api npx prisma studio` |
| View API logs | `docker compose logs -f api` |
| Rebuild after changes | `docker compose up -d --build` |
| Deploy to production | `git pull && docker compose -f docker-compose.prod.yml up -d --build` |
| Run DB migration (prod) | `docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy` |
| Manual DB backup | `docker compose exec -T db mysqldump -u umu -pumu_pass umu_sports > backup.sql` |
| Open MySQL shell | `docker compose exec db mysql -u umu -p umu_sports` |
