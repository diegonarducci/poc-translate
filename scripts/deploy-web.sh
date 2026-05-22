#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-poc-translate-497120}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-poc-traducao-web}"
OPENAI_SECRET_NAME="${OPENAI_SECRET_NAME:-OPENAI_API_KEY}"

if [[ -z "${GOOGLE_CLOUD_PROJECT:-}" ]]; then
  echo "GOOGLE_CLOUD_PROJECT nao definido. Exporte a variavel antes do deploy." >&2
  exit 1
fi

if [[ -z "${LIBRETRANSLATE_URL:-}" ]]; then
  echo "LIBRETRANSLATE_URL nao definido. Exporte a variavel antes do deploy." >&2
  exit 1
fi

REQUIRED_PUBLIC_ENV=(
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
)

for ENV_NAME in "${REQUIRED_PUBLIC_ENV[@]}"; do
  if [[ -z "${!ENV_NAME:-}" ]]; then
    echo "${ENV_NAME} nao definido. Exporte a variavel antes do deploy." >&2
    exit 1
  fi
done

BUILD_ENV_VARS=(
  "NEXT_PUBLIC_FIREBASE_API_KEY=${NEXT_PUBLIC_FIREBASE_API_KEY}"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=${NEXT_PUBLIC_FIREBASE_PROJECT_ID}"
  "NEXT_PUBLIC_FIREBASE_APP_ID=${NEXT_PUBLIC_FIREBASE_APP_ID}"
)

ENV_PRODUCTION_FILE=".env.production"
cleanup() {
  rm -f "$ENV_PRODUCTION_FILE"
}
trap cleanup EXIT

{
  printf 'NEXT_PUBLIC_FIREBASE_API_KEY=%s\n' "$NEXT_PUBLIC_FIREBASE_API_KEY"
  printf 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%s\n' "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  printf 'NEXT_PUBLIC_FIREBASE_PROJECT_ID=%s\n' "$NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  printf 'NEXT_PUBLIC_FIREBASE_APP_ID=%s\n' "$NEXT_PUBLIC_FIREBASE_APP_ID"
} > "$ENV_PRODUCTION_FILE"

SECRET_ARGS=()
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  SECRET_ARGS+=(--set-env-vars "OPENAI_API_KEY=${OPENAI_API_KEY}")
else
  SECRET_ARGS+=(--set-secrets "OPENAI_API_KEY=${OPENAI_SECRET_NAME}:latest")
fi

gcloud run deploy "$SERVICE_NAME" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --source . \
  --allow-unauthenticated \
  --set-build-env-vars "$(IFS=,; echo "${BUILD_ENV_VARS[*]}")" \
  --set-env-vars "OPENAI_TRANSLATION_MODEL=${OPENAI_TRANSLATION_MODEL:-gpt-5.2}" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT}" \
  --set-env-vars "GOOGLE_CLOUD_QUOTA_PROJECT=${GOOGLE_CLOUD_QUOTA_PROJECT:-$GOOGLE_CLOUD_PROJECT}" \
  --set-env-vars "GOOGLE_TRANSLATE_LOCATION=${GOOGLE_TRANSLATE_LOCATION:-global}" \
  --set-env-vars "LIBRETRANSLATE_URL=${LIBRETRANSLATE_URL}" \
  --set-env-vars "LIBRETRANSLATE_API_KEY=${LIBRETRANSLATE_API_KEY:-}" \
  --set-env-vars "LIBRETRANSLATE_CONCURRENCY=${LIBRETRANSLATE_CONCURRENCY:-4}" \
  --set-env-vars "LIBRETRANSLATE_TIMEOUT_MS=${LIBRETRANSLATE_TIMEOUT_MS:-120000}" \
  "${SECRET_ARGS[@]}"

echo "Deploy do frontend/backend concluido em Cloud Run: ${SERVICE_NAME}"
