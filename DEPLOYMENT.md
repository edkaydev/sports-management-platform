# Deployment Guide — Ubuntu Server

## Stack
- Ubuntu 22.04 LTS
- Docker + Docker Compose
- Nginx (reverse proxy + SSL)
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

## 4. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 5. Install Certbot (Let's Encrypt SSL)

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 6. Set Up the Project

Clone the repository:

```bash
cd /home/edward
git clone https://github.com/YOUR_USERNAME/sports-management-platform.git
cd sports-management-platform
```

Create the production environment file:

```bash
cp backend/.env.example backend/.env.production
nano backend/.env.production
```

Fill in your values:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=mysql://umu:YOUR_DB_PASSWORD@db:3306/umu_sports

JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_STRING
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

STORAGE_PROVIDER=local
UPLOAD_DIR=/app/uploads

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=sports@umu.ac.ug

FRONTEND_URL=https://umu-sports.umu.ac.ug
```

---

## 7. Production Docker Compose

Create `docker-compose.prod.yml` at the project root:

```yaml
services:

  db:
    image: mysql:8
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: umu_sports
      MYSQL_USER: umu
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - internal

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - db
    env_file:
      - ./backend/.env.production
    volumes:
      - uploads:/app/uploads
    networks:
      - internal
      - web
    expose:
      - "3000"

  client:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    networks:
      - web
    expose:
      - "80"

networks:
  internal:
  web:

volumes:
  mysql_data:
  uploads:
```

Create a `.env` file at the root (for Docker Compose variable substitution):

```bash
nano .env
```

```env
MYSQL_ROOT_PASSWORD=CHANGE_THIS
MYSQL_PASSWORD=CHANGE_THIS
```

---

## 8. Frontend Production Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Create `frontend/nginx.frontend.conf`:

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 9. Configure Nginx as Reverse Proxy

Create the site config:

```bash
sudo nano /etc/nginx/sites-available/umu-sports
```

```nginx
server {
    listen 80;
    server_name umu-sports.umu.ac.ug;

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/umu-sports /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. Get SSL Certificate

Point your domain to the server's IP first (DNS A record), then:

```bash
sudo certbot --nginx -d umu-sports.umu.ac.ug
```

Certbot will automatically:
- Get the certificate
- Update your Nginx config to redirect HTTP → HTTPS
- Set up auto-renewal

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 11. Build and Start the Application

```bash
cd /home/edward/sports-management-platform

# Build images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Run database migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Seed the first SUPER_ADMIN user
docker compose -f docker-compose.prod.yml exec api npx prisma db seed

# Check everything is running
docker compose -f docker-compose.prod.yml ps
```

---

## 12. Verify Deployment

```bash
# Check API health
curl https://umu-sports.umu.ac.ug/api/health

# Check logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f db
```

Open `https://umu-sports.umu.ac.ug` in a browser — login page should load.

---

## 13. Database Backups

Create a backup script:

```bash
nano /home/edward/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR=/home/edward/backups
mkdir -p $BACKUP_DIR

docker compose -f /home/edward/sports-management-platform/docker-compose.prod.yml \
  exec -T db \
  mysqldump -u umu -p${MYSQL_PASSWORD} umu_sports \
  > $BACKUP_DIR/umu_sports_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete

echo "Backup complete: umu_sports_$DATE.sql"
```

Make it executable and schedule it:

```bash
chmod +x /home/edward/backup.sh

# Run daily at 2:00 AM
crontab -e
```

Add this line:

```
0 2 * * * /home/edward/backup.sh >> /home/edward/backup.log 2>&1
```

---

## 14. Updating the Application

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

## 15. Useful Commands

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

## 16. Firewall Setup

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
