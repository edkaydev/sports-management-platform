#!/bin/bash
# ─── UMU Sports — Database Backup Script ──────────────────────────────────────
# Run daily via cron: 0 2 * * * /opt/umu-sports/scripts/backup-db.sh
#
# Usage:
#   ./scripts/backup-db.sh              # Normal backup
#   ./scripts/backup-db.sh --dry-run    # Print command without executing

set -euo pipefail

# Configuration
BACKUP_DIR="/var/backups/umu-sports"
MYSQL_HOST="${MYSQL_HOST:-db}"
MYSQL_USER="${MYSQL_USER:-umu}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-}"
MYSQL_DATABASE="${MYSQL_DATABASE:-umu_sports}"
RETENTION_DAYS=30

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# Create backup directory
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${MYSQL_DATABASE}_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] Starting backup: ${FILENAME}"

if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] Would execute:"
  echo "  mysqldump -h ${MYSQL_HOST} -u ${MYSQL_USER} -p**** ${MYSQL_DATABASE} | gzip > ${FILEPATH}"
  exit 0
fi

# Run backup
mysqldump \
  -h "$MYSQL_HOST" \
  -u "$MYSQL_USER" \
  -p"$MYSQL_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$MYSQL_DATABASE" | gzip > "$FILEPATH"

# Verify backup was created and has content
if [ -s "$FILEPATH" ]; then
  SIZE=$(du -h "$FILEPATH" | cut -f1)
  echo "[$(date)] Backup complete: ${FILENAME} (${SIZE})"
else
  echo "[$(date)] ERROR: Backup file is empty!" >&2
  rm -f "$FILEPATH"
  exit 1
fi

# Prune old backups
DELETED=$(find "$BACKUP_DIR" -name "${MYSQL_DATABASE}_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] Pruned ${DELETED} backup(s) older than ${RETENTION_DAYS} days"
fi

echo "[$(date)] Backup done."
