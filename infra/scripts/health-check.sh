#!/bin/bash
# Simple health check — alerts if API is down

API_URL="${API_URL:-http://localhost:4000}"
RESPONSE=$(curl -sf "${API_URL}/api/v1/health" || echo "FAILED")

if echo "${RESPONSE}" | grep -q '"status":"healthy"'; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check FAILED"
  echo "Response: ${RESPONSE}"
  exit 1
fi
