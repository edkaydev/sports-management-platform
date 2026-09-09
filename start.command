#!/bin/bash
# UMU Sports — Local one-click launcher (macOS).
# Starts the stack, applies migrations, seeds the tutor account, opens the browser.
set -e

cd "$(dirname "$0")"

echo "==> Checking Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not running. Install Docker Desktop first, then run this again."
  read -r -p "Press Enter to close..." _
  exit 1
fi

echo "==> Starting database..."
docker compose up -d db

echo "==> Waiting for database health..."
for i in $(seq 1 60); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$(docker compose ps -q db 2>/dev/null)" 2>/dev/null || echo "starting")
  if [ "$STATUS" = "healthy" ]; then
    break
  fi
  sleep 2
done
if [ "$STATUS" != "healthy" ]; then
  echo "Database failed to become healthy. Check 'docker compose logs db'."
  read -r -p "Press Enter to close..." _
  exit 1
fi

echo "==> Starting API and app..."
docker compose up -d api client

echo "==> Applying database migrations..."
docker compose exec -T api npx prisma migrate deploy

echo "==> Seeding the tutor account..."
docker compose exec -T api npx prisma db seed

echo ""
echo "==================================================="
echo "  UMU Sports is running at http://localhost:5173"
echo ""
echo "  Sign in:   username: tutor   password: Tutor@2025"
echo "  (You will be asked to set your own password.)"
echo "==================================================="
echo ""

sleep 2
open http://localhost:5173

read -r -p "Press Enter to close this window (the app keeps running)." _