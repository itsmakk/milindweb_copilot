#!/usr/bin/env bash
# ============================================================================
#  backup.sh — Postgres logical backup for MilindWeb
#  Runs on the Coolify host (or anywhere with psql + gzip + s3cmd / rclone).
#
#  - dumps the `milindweb` database
#  - compresses with gzip
#  - retains local copies for 14 days
#  - (optional) uploads to S3 via rclone if RCLONE_REMOTE is set
#  - exits non-zero on failure (Coolify cron will mark the run as failed)
#
#  Cron example (Coolify "Scheduled Task" resource):
#    0 3 * * *  /opt/milindweb/scripts/backup.sh >> /var/log/milindweb-backup.log 2>&1
# ============================================================================
set -euo pipefail

# ---- config (override via env or /etc/milindweb/backup.env) -----------------
: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=milindweb}"
: "${PGDATABASE:=milindweb}"
: "${BACKUP_DIR:=/var/backups/milindweb}"
: "${BACKUP_RETENTION_DAYS:=14}"
: "${RCLONE_REMOTE:=}"        # e.g. "s3:milindweb-backups"
: "${RCLONE_PATH:=postgres}"

if [[ -f /etc/milindweb/backup.env ]]; then
  # shellcheck disable=SC1091
  set -a; source /etc/milindweb/backup.env; set +a
fi

export PGPASSWORD="${PGPASSWORD:?PGPASSWORD is required (use a .pgpass or env file with 0600 perms)}"

mkdir -p "${BACKUP_DIR}"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
filename="milindweb-${stamp}.sql.gz"
filepath="${BACKUP_DIR}/${filename}"

# ---- dump -----------------------------------------------------------------
echo "[$(date -Iseconds)] Starting pg_dump to ${filepath} …"
pg_dump \
  --host="${PGHOST}" --port="${PGPORT}" --username="${PGUSER}" --dbname="${PGDATABASE}" \
  --no-owner --no-privileges --no-acl \
  --format=plain --quote-all-identifiers \
  --serializable-deferrable \
  | gzip -9 > "${filepath}"

bytes=$(stat -c '%s' "${filepath}")
echo "[$(date -Iseconds)] Dump complete: ${filename} (${bytes} bytes)"

# ---- upload ---------------------------------------------------------------
if [[ -n "${RCLONE_REMOTE}" ]]; then
  echo "[$(date -Iseconds)] Uploading to rclone remote ${RCLONE_REMOTE}/${RCLONE_PATH} …"
  rclone copy "${filepath}" "${RCLONE_REMOTE}/${RCLONE_PATH}" --progress=false
  echo "[$(date -Iseconds)] Upload complete"
fi

# ---- retention ------------------------------------------------------------
echo "[$(date -Iseconds)] Pruning local backups older than ${BACKUP_RETENTION_DAYS} days …"
find "${BACKUP_DIR}" -maxdepth 1 -name 'milindweb-*.sql.gz' -mtime "+${BACKUP_RETENTION_DAYS}" -delete -print

if [[ -n "${RCLONE_REMOTE}" ]]; then
  rclone delete "${RCLONE_REMOTE}/${RCLONE_PATH}" --min-age "${BACKUP_RETENTION_DAYS}d" --include 'milindweb-*.sql.gz' || true
fi

# ---- verify by listing ----------------------------------------------------
echo "[$(date -Iseconds)] Backups present:"
ls -lh "${BACKUP_DIR}"/milindweb-*.sql.gz 2>/dev/null || echo "  (none)"

echo "[$(date -Iseconds)] Done."
