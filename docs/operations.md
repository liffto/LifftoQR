# Operations

Three things that used to depend on someone remembering: applying migrations,
noticing errors, and clearing out tables that only grew.

---

## Migrations

**Nothing applies migrations automatically.** A schema change that fails halfway
leaves production broken with nothing to roll back to, and Vercel cannot undo a
migration the way it can undo a deploy. So applying one is a decision you make,
not a side effect of pushing.

What is automatic is *noticing*. On startup the API compares the newest
migration in the code against the `alembic_version` row in the database
([`api/app/db/schema_check.py`](../api/app/db/schema_check.py)). If the database
is behind, it refuses to start and names the missing revisions:

```
Database schema is behind the code: it is at 008_user_templates but this build
needs 009_scan_events. Missing: 009_scan_events. Apply them with
`npm run migrate:prod` ... and redeploy.
```

Previously that same mistake surfaced as a 500 from somewhere inside a query,
possibly hours later, with nothing pointing at the cause.

The check is deliberately not fatal when it *cannot tell* — an unreachable
database or a checkout without migration files logs a warning and carries on.
Turning a transient blip into an outage would be worse than the problem.

### Applying to production

```bash
PROD_DATABASE_URL="postgresql://..." npm run migrate:prod
```

It shows where production is, prints the SQL it would run, and waits for a
`y` before touching anything. Redeploy the API afterwards so it boots against
the new schema.

Locally, `npm run migrate:local` — no confirmation, because it is a throwaway
database (see [local-database.md](./local-database.md)).

The production URL is deliberately **not** in `api/.env`; that file points at
the local database so nothing local can reach production by accident.

---

## Error tracking

Off until `SENTRY_DSN` is set. Nothing is installed, initialised or sent
without it, so local runs and CI stay silent and need no account.

**Backend** — set `SENTRY_DSN` in the API's Vercel environment.
[`api/app/core/observability.py`](../api/app/core/observability.py) initialises
it before the app is built, so an error raised during startup is still
reported. `send_default_pii` is off, and `Authorization`, `Cookie` and
`X-API-Key` headers plus any `DATABASE_URL` are stripped before sending.

**Frontend** — set `VITE_SENTRY_DSN` at build time.

With no DSN the SDK is **eliminated from the bundle entirely** — the value is a
build-time constant, so the guard around the dynamic import is dead code and
Rollup drops it. The eager bundle is byte-for-byte what it was.

With a DSN it becomes a **separate ~149KB gzipped chunk, fetched only when the
browser goes idle**, never before first paint. That is deliberate: this app has
already shipped one load-time regression that measured fine on a desktop and
produced fifteen seconds of unstyled page on a real phone. Nothing new gets to
run before the page does. Tracing and session replay are compiled out via the
`__SENTRY_TRACING__` / replay flags in `vite.config.js` — errors only.

Errors thrown before the SDK finishes loading are queued (up to 20) and sent
once it arrives, so the reporting gap does not swallow the early failures that
matter most.

---

## Scheduled maintenance

Four tables only ever grew: `notifications`, `user_sessions`,
`token_blocklists`, `email_verifications`. Nothing reads a row once it is
stale, so it was pure cost.

[`api/app/services/retention_service.py`](../api/app/services/retention_service.py)
deletes them: notifications after **90 days**, and expired sessions, blocklist
entries and verification tokens **7 days** past their expiry — a grace period so
"your session expired" can still be explained. It is idempotent, so a retried
run deletes nothing the second time.

### Running it

```bash
# See what would go, without deleting anything
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://qr-api.liffto.in/api/v1/maintenance/purge?dry_run=true"

# Actually delete
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://qr-api.liffto.in/api/v1/maintenance/purge"
```

Set `CRON_SECRET` in the API's Vercel environment. **Without it the endpoint
returns 503 rather than running** — an unauthenticated "delete rows" URL that
works because nobody set a variable is worse than housekeeping not happening.

### Scheduling it

Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically, so the
endpoint needs nothing extra. Add this to the `vercel.json` of **whichever
project deploys the API**:

```json
{
  "crons": [{ "path": "/api/v1/maintenance/purge", "schedule": "0 4 * * *" }]
}
```

This is not committed, because the API's Vercel project currently has no
`vercel.json` and adding one could change how it builds — that is a change worth
making deliberately, with the deploy watched. Run the `dry_run=true` call first;
the first purge against production will delete more than a routine one.
