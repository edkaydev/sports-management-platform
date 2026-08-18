# Deployment Guide — Ubuntu Server

## Stack
- Ubuntu 22.04 LTS
- Docker + Docker Compose
- Nginx (Docker container — reverse proxy + SSL)
- Let's Encrypt (free SSL certificate)
- GitHub (source code)

---

## 1. Server Requirements

Minimum spec for v1.0:

| Resource | Minimum |
|---|---|
| CPU | 1 vCPU |
| RAM | 2 GB |
| Disk | 20 GB SSD |
| OS | Ubuntu 22.04 LTS |
| Open ports | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

---

## 2. Initial Server Setup

SSH into your server as root:

```bash
ssh root@YOUR_SERVER_IP
```

Create a non-root user:

```bash
adduser edward
usermod -aG sudo edward
```

Switch to that user for everything from here:

```bash
su - edward
```

Update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 3. Install Docker

```bash
# Install dependencies
sudo apt install -y ca-certificates curl gnupg

# Add Docker's GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow current user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## 4. Set Up the Project

Clone the repository:

```bash
cd /home/edward
git clone https://github.com/edkaydev/sports-management-platform.git
cd sports-management-platform
```

---

## 5. Configure Environment Variables

### 5.1 Docker Compose root `.env`

Create a `.env` file at the project root for Docker Compose variable substitution (used by `docker-compose.prod.yml`):

```bash
nano .env
```

```env
MYSQL_ROOT_PASSWORD=CHANGE_THIS_TO_A_STRONG_ROOT_PASSWORD
MYSQL_DATABASE=umu_sports
MYSQL_USER=umu
MYSQL_PASSWORD=CHANGE_THIS_TO_A_STRONG_DB_PASSWORD
```

### 5.2 Backend `.env.prod`

Copy the example and fill in your values:

```bash
cp backend/.env.example.prod backend/.env.prod
nano backend/.env.prod
```

```env
NODE_ENV=production
PORT=3000

# Database — must match the MYSQL_* values in root .env
DATABASE_URL=mysql://umu:CHANGE_THIS@db:3306/umu_sports

# JWT — generate with: openssl rand -hex 64
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=sports@umu.ac.ug

# Frontend URL (for CORS)
FRONTEND_URL=https://umu-sports.umu.ac.ug
```

> **Important:** The root `.env` and `backend/.env.prod` are gitignored. Never commit them.

---

## 6. Get SSL Certificate

Point your domain DNS A record to the server's IP first, then install Certbot on the **host** (not in Docker):

```bash
sudo apt install -y certbot
```

Get the certificate (standalone mode — temporarily stops nothing since Nginx isn't installed on host):

```bash
sudo certbot certonly --standalone -d umu-sports.umu.ac.ug
```

Certificates will be at `/etc/letsencrypt/live/umu-sports.umu.ac.ug/`.

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 7. Build and Start the Application

```bash
cd /home/edward/sports-management-platform

# Build all production images (db, api, client, nginx)
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Wait for MySQL to be healthy, then run migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Seed the first TUTOR and SPORTS_REP users
docker compose -f docker-compose.prod.yml exec api npx prisma db seed

# Check everything is running
docker compose -f docker-compose.prod.yml ps
```

---

## 8. Verify Deployment

```bash
# Check API health
curl https://umu-sports.umu.ac.ug/api/health

# Check logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f db
```

Open `https://umu-sports.umu.ac.ug` in a browser — login page should load.

**Demo credentials:**
- Tutor: `tutor@umu.ac.ug` / `Tutor@2025`
- Sport Rep: `sportrep@umu.ac.ug` / `SportRep@2025`

---

## 9. Database Backups

The project includes a backup script at `scripts/backup-db.sh`.

### 9.1 Set up environment variables for the backup script

The script reads `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, and `MYSQL_DATABASE` from environment variables. Create a wrapper or export them:

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_USER=umu
export MYSQL_PASSWORD=YOUR_DB_PASSWORD
export MYSQL_DATABASE=umu_sports
```

### 9.2 Test the backup

```bash
# Dry run
./scripts/backup-db.sh --dry-run

# Actual backup
./scripts/backup-db.sh
```

Backups are saved to `/var/backups/umu-sports/` as gzipped SQL files, with 30-day retention.

### 9.3 Schedule daily backups via cron

```bash
crontab -e
```

Add:

```
0 2 * * * cd /home/edward/sports-management-platform && MYSQL_HOST=127.0.0.1 MYSQL_USER=umu MYSQL_PASSWORD=YOUR_DB_PASSWORD MYSQL_DATABASE=umu_sports ./scripts/backup-db.sh >> /var/backups/umu-sports/backup.log 2>&1
```

---

## 10. Updating the Application

When you push new code:

```bash
cd /home/edward/sports-management-platform

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run any new migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Check logs
docker compose -f docker-compose.prod.yml logs -f api
```

---

## 11. Useful Commands

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View API logs (live)
docker compose -f docker-compose.prod.yml logs -f api

# Restart only the API
docker compose -f docker-compose.prod.yml restart api

# Open MySQL shell
docker compose -f docker-compose.prod.yml exec db mysql -u umu -p umu_sports

# Stop everything
docker compose -f docker-compose.prod.yml down

# Stop and remove all data (DANGER — deletes database)
docker compose -f docker-compose.prod.yml down -v
```

---

## 12. Firewall Setup

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

This allows:
- Port 22 (SSH)
- Port 80 (HTTP — redirects to HTTPS)
- Port 443 (HTTPS)

All other ports are blocked, including 3306 (MySQL) and 3000 (API) — only accessible internally via Docker network.

---

## Architecture Overview

The production stack runs 4 Docker containers on an internal bridge network:

```
Internet
   │
   ▼
┌─────────────────────────────────────┐
│  Nginx (port 80, 443)              │
│  - SSL termination                  │
│  - Rate limiting                    │
│  - Security headers                 │
│  - Static file serving (uploads)    │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌─────────┐ ┌─────────┐
│  API    │ │ Client  │
│  :3000  │ │ (static)│
└────┬────┘ └─────────┘
     │
     ▼
┌─────────┐
│  MySQL  │
│  :3306  │
└─────────┘
```

- **Nginx** is the only entry point (ports 80/443)
- **API** and **Client** are NOT exposed externally
- **MySQL** is NOT exposed externally
- All communication happens over the Docker `internal` bridge network
