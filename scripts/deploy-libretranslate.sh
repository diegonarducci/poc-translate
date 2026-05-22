#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-poc-translate-497120}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-libretranslate}"
IMAGE="${IMAGE:-libretranslate/libretranslate:latest}"
MIN_INSTANCES="${MIN_INSTANCES:-1}"
CONCURRENCY="${CONCURRENCY:-4}"

EXTRA_ENV=()
if [[ -n "${LIBRETRANSLATE_API_KEY:-}" ]]; then
  EXTRA_ENV+=(--set-env-vars "LT_API_KEYS=${LIBRETRANSLATE_API_KEY}")
fi

gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --image "$IMAGE" \
  --allow-unauthenticated \
  --port 5000 \
  --cpu 2 \
  --memory 2Gi \
  --concurrency "$CONCURRENCY" \
  --min-instances "$MIN_INSTANCES" \
  --max-instances 3 \
  --set-env-vars "^@^LT_LOAD_ONLY=en,pt,es" \
  --set-env-vars "LT_THREADS=4" \
  "${EXTRA_ENV[@]+"${EXTRA_ENV[@]}"}"

echo "Deploy do LibreTranslate concluido: ${SERVICE_NAME}"
