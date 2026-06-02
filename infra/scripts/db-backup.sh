#!/bin/bash
# Backup PostgreSQL to Cloudflare R2

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/projectflow_${TIMESTAMP}.sql.gz"
R2_KEY="backups/postgres_${TIMESTAMP}.sql.gz"

echo "📦 Starting DB backup: ${TIMESTAMP}"

# Dump and compress
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_FILE}"

# Upload to R2
aws s3 cp "${BACKUP_FILE}" "s3://${R2_BUCKET}/${R2_KEY}" \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

# Cleanup
rm "${BACKUP_FILE}"

# Delete backups older than 30 days
aws s3 ls "s3://${R2_BUCKET}/backups/" \
  --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com" \
  | awk '{print $4}' \
  | while read -r key; do
    date_str=$(echo "${key}" | grep -oP '\d{8}')
    if [[ -n "${date_str}" ]]; then
      file_date=$(date -d "${date_str}" +%s 2>/dev/null || date -j -f "%Y%m%d" "${date_str}" +%s)
      cutoff=$(date -d "30 days ago" +%s 2>/dev/null || date -v-30d +%s)
      if [[ "${file_date}" -lt "${cutoff}" ]]; then
        aws s3 rm "s3://${R2_BUCKET}/backups/${key}" \
          --endpoint-url "https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        echo "  🗑️  Deleted old backup: ${key}"
      fi
    fi
  done

echo "✅ Backup complete: ${R2_KEY}"
