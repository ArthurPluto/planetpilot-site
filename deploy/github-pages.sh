#!/usr/bin/env bash
# One-command deploy to GitHub Pages (option a in DEPLOY.md).
# Run ONLY after Arthur has approved creating the public repo:
#     bash deploy/github-pages.sh
# Needs: gh (logged in as the repo owner), git, a clean commit on main.
set -euo pipefail

OWNER="${OWNER:-ArthurPluto}"
REPO="${REPO:-planetpilot-site}"
DOMAIN="planetpilot.world"

cd "$(dirname "$0")/.."
git rev-parse --is-inside-work-tree >/dev/null
[ "$(git branch --show-current)" = "main" ] || { echo "switch to main first"; exit 1; }
[ -z "$(git status --porcelain)" ] || { echo "commit your changes first"; exit 1; }
[ "$(cat docs/CNAME)" = "$DOMAIN" ] || { echo "docs/CNAME must hold $DOMAIN"; exit 1; }

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  echo "repo exists: pushing"
  git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$OWNER/$REPO.git"
  git push -u origin main
else
  gh repo create "$OWNER/$REPO" --public --source . --remote origin --push \
    --description "Official website of Planet Pilot (planetpilot.world)" --homepage "https://$DOMAIN"
fi

# Turn on Pages from main /docs (the published folder); harmless if it is already on.
gh api -X POST "repos/$OWNER/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null 2>&1 || true
gh api -X PUT "repos/$OWNER/$REPO/pages" -f "cname=$DOMAIN" -f "source[branch]=main" -f "source[path]=/docs" >/dev/null

echo
echo "Pushed. Pages: https://github.com/$OWNER/$REPO/settings/pages"
echo "When the DNS records in DEPLOY.md resolve and GitHub has issued the certificate, run:"
echo "  gh api -X PUT repos/$OWNER/$REPO/pages -F https_enforced=true"
