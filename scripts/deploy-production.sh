#!/usr/bin/env bash
set -euo pipefail

# Deploy bizbuilders-ai to Vercel production and prep domain cutover.
# Usage: bash scripts/deploy-production.sh

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

TEAM_SLUG="${VERCEL_TEAM:-transformby10x}"
SCOPE=(--scope "$TEAM_SLUG")

ENV_KEYS=(
  ARVA_SESSION_SECRET
  ELEVENLABS_API_KEY
  ELEVENLABS_VOICE_ID
  ELEVENLABS_MODEL_ID
  ELEVENLABS_STABILITY
  ELEVENLABS_SIMILARITY_BOOST
  ELEVENLABS_STYLE
  ARVA_TTS_PROVIDER
  ARVA_STT_PROVIDER
)

echo "=== BizBuilders AI — Vercel production deploy ==="
echo "Project: $PROJECT_DIR"
echo "Team:    $TEAM_SLUG"
echo ""

# 1. Vercel CLI
if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI not found. Installing globally..."
  npm install -g vercel
fi
echo "Vercel CLI: $(vercel --version)"
echo ""

# 2. Auth check
echo "=== Auth ==="
if ! vercel whoami "${SCOPE[@]}" 2>&1; then
  echo "Not logged in. Run: vercel login"
  exit 1
fi
echo ""

# 3. Push env vars from .env.local
ENV_PUSHED=false
if [ -f .env.local ]; then
  echo "=== Pushing env vars from .env.local ==="
  # shellcheck disable=SC1091
  set -a
  source .env.local
  set +a

  for key in "${ENV_KEYS[@]}"; do
    value="${!key:-}"
    if [ -z "$value" ]; then
      echo "  SKIP $key (not set in .env.local)"
      continue
    fi
    for target in production preview development; do
      if vercel env ls "$target" "${SCOPE[@]}" 2>/dev/null | grep -q "^[[:space:]]*${key}[[:space:]]"; then
        echo "  UPDATE $key ($target)"
        vercel env rm "$key" "$target" --yes "${SCOPE[@]}" 2>/dev/null || true
      else
        echo "  ADD    $key ($target)"
      fi
      printf "%s\n" "$value" | vercel env add "$key" "$target" "${SCOPE[@]}" 2>/dev/null || {
        echo "  WARN: could not set $key for $target (may already exist)"
      }
    done
  done
  ENV_PUSHED=true
  echo "Env vars push attempted for: ${ENV_KEYS[*]}"
else
  echo "=== No .env.local found — skipping env push ==="
fi
echo ""

# 4. Production deploy
echo "=== Deploying to production ==="
DEPLOY_OUTPUT="$(vercel --prod --yes "${SCOPE[@]}" 2>&1)"
echo "$DEPLOY_OUTPUT"
DEPLOY_URL="$(echo "$DEPLOY_OUTPUT" | grep -Eo 'https://[a-zA-Z0-9._-]+\.vercel\.app' | tail -1 || true)"
echo ""
echo "Deployment URL: ${DEPLOY_URL:-unknown — check output above}"
echo ""

# 5. Domain listings
echo "=== Domains: tbtx-web ==="
vercel domains ls --project tbtx-web "${SCOPE[@]}" 2>&1 || echo "(could not list tbtx-web domains)"
echo ""
echo "=== Domains: bizbuilders-ai ==="
vercel domains ls --project bizbuilders-ai "${SCOPE[@]}" 2>&1 || echo "(could not list bizbuilders-ai domains)"
echo ""

echo "=== Summary ==="
echo "  Env vars pushed: $ENV_PUSHED"
echo "  Deploy URL:      ${DEPLOY_URL:-see output above}"
echo "  Diagnostic:      ${DEPLOY_URL:-YOUR_URL}/diagnostic"
echo "  Health check:    ${DEPLOY_URL:-YOUR_URL}/api/arva/health"
