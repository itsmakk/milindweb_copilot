#!/usr/bin/env bash
# ============================================================================
#  restore.sh — restore the most recent backup, or a specific file
#
#  Usage:
#    ./restore.sh                              # restore latest local file
#    ./restore.sh /var/backups/milindweb/file.sql.gz
#
#  Restores to the database named in PGDATABASE (default: milindweb).
#  Refuses to run if the DB looks non-empty unless FORCE=1.
# ============================================================================
set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=milindweb}"
: "${PGDATABASE:=milindweb}"
: "${BACKUP_DIR:=/var/backups/milindweb}"
: "${FORCE:=0}"

export PGPASSWORD="${PGPASSWORD:?PGPASSWORD is required}"

target="${1:-}"

if [[ -z "${target}" ]]; then
  target=$(ls -1t "${BACKUP_DIR}"/milindweb-*.sql.gz 2>/dev/null | head -n 1 || true)
  if [[ -z "${target}" ]]; then
    echo "No backup files found in ${BACKUP_DIR}" >&2
    exit 1
  fi
  echo "Using latest backup: ${target}"
fi

if [[ ! -f "${target}" ]]; then
  echo "File not found: ${target}" >&2
  exit 1
fi

# Safety check
if [[ "${FORCE}" != "1" ]]; then
  cnt=$(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema')" || echo 0)
  if [[ "${cnt}" -gt 0 ]]; then
    echo "Refusing to restore: database '${PGDATABASE}' has ${cnt} user tables." >&2
    echo "Run with FORCE=1 to override, or restore to a different DB." >&2
    exit 2
  fi
fi

echo "Restoring ${target} into ${PGDATABASE} on ${PGHOST}:${PGPORT} …"
gunzip -c "${target}" | psql \
  -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" \
  --set ON_ERROR_STOP=on --single-transaction

echo "Restore complete."
