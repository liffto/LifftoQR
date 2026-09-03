#!/usr/bin/env bash
#
# Apply pending migrations to production, on purpose and with the plan in front
# of you first.
#
# Migrations are not run by a deploy: a schema change that fails midway leaves
# production broken with nothing to roll back to, so applying one is a decision
# a person makes. The API refuses to start against a database that is behind
# (api/app/db/schema_check.py), so a forgotten migration shows up immediately as
# a failed boot rather than as a 500 in some query hours later.
#
# Usage:
#   PROD_DATABASE_URL="postgresql://..." npm run migrate:prod
#
# The URL is read from the environment and never from api/.env, which points at
# the local throwaway database on purpose.

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  cat >&2 <<'EOF'
PROD_DATABASE_URL is not set.

  PROD_DATABASE_URL="postgresql://..." npm run migrate:prod

The value is the production Neon URL — it is commented out in api/.env, and it
is also in the backend's Vercel environment. It is deliberately not the default
so that nothing local can reach production by accident.
EOF
  exit 1
fi

ALEMBIC="api/venv/bin/alembic"
[[ -x "$ALEMBIC" ]] || ALEMBIC="alembic"

run() { ( cd api && DATABASE_URL="$PROD_DATABASE_URL" "../$ALEMBIC" "$@" ); }
[[ "$ALEMBIC" == "alembic" ]] && run() { ( cd api && DATABASE_URL="$PROD_DATABASE_URL" alembic "$@" ); }

echo "── Where production is now ─────────────────────────────"
run current

echo
echo "── What would be applied ───────────────────────────────"
# The SQL itself, so a destructive step is visible before it runs rather than
# after. --sql runs nothing.
run upgrade head --sql | sed -n '1,200p'

echo
read -r -p "Apply these to production? [y/N] " reply
if [[ ! "$reply" =~ ^[Yy]$ ]]; then
  echo "Nothing applied."
  exit 0
fi

echo
echo "── Applying ────────────────────────────────────────────"
run upgrade head

echo
echo "── Where production is now ─────────────────────────────"
run current
echo
echo "Done. Redeploy the API so it boots against the new schema."
