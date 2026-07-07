#!/usr/bin/env bash
set -euo pipefail

# Moves production domains from tbtx-web to bizbuilders-ai (ArVA build).
# Requires: vercel CLI logged in (vercel login) OR VERCEL_TOKEN env var.

TEAM_SLUG="${VERCEL_TEAM:-transformby10x}"
OLD_PROJECT="tbtx-web"
NEW_PROJECT="bizbuilders-ai"

# bizbuilders.ai only — attach TBTX/BBM to tbtx-bold-ecosystem-build if you need separate brand pages.
DOMAINS=(
  "bizbuilders.ai"
  "www.bizbuilders.ai"
)

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install Vercel CLI: npm i -g vercel"
  exit 1
fi

SCOPE=(--scope "$TEAM_SLUG")

echo "Team: $TEAM_SLUG"
echo "Remove domains from: $OLD_PROJECT"
echo "Add domains to: $NEW_PROJECT"
echo ""
echo "Domains: ${DOMAINS[*]}"
echo ""
read -r -p "Continue? Type yes: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

for domain in "${DOMAINS[@]}"; do
  echo "Removing $domain from $OLD_PROJECT..."
  vercel domains rm "$domain" --yes "${SCOPE[@]}" --project "$OLD_PROJECT" || true
done

for domain in "${DOMAINS[@]}"; do
  echo "Adding $domain to $NEW_PROJECT..."
  vercel domains add "$domain" "${SCOPE[@]}" --project "$NEW_PROJECT"
done

echo ""
echo "Done. Verify:"
echo "  https://bizbuilders.ai"
echo "  https://bizbuilders.ai/diagnostic"
echo "  https://bizbuilders.ai/api/arva/health"
echo ""
echo "Expected homepage headline: DIGITAL FOG IS WHEN WORK STARTS AND DOESN'T MOVE"
echo ""
echo "TBTX / BBM domains (transformby10x.ai, bizbotmarketing.ai):"
echo "  Keep on tbtx-bold-ecosystem-build until host-routed pages are merged here."
