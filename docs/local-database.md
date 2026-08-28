# Running the app against a local database

The dashboard, the design studio and everything else behind sign-in cannot be
opened without a session, and the only sign-in the UI offers is Google — which
refuses to run in an embedded or automated browser. That combination meant the
whole authenticated half of the app could only be read, never operated.

This is how to bring it up locally, against a throwaway database, signing in
without Google.

## 1. Postgres

Postgres 16 is installed via Homebrew but is not run as a service. Start it by
hand, and stop it when you are done:

```bash
LC_ALL=C /usr/local/opt/postgresql@16/bin/pg_ctl -D /usr/local/var/postgresql@16 -l /tmp/pg.log start
```

`LC_ALL` matters. Without it the postmaster fails on macOS with "postmaster
became multithreaded during startup", which is not a helpful message.

```bash
/usr/local/opt/postgresql@16/bin/createdb liffto_local
```

To stop it again:

```bash
/usr/local/opt/postgresql@16/bin/pg_ctl -D /usr/local/var/postgresql@16 stop
```

## 2. Schema

`api/.env` holds the production Neon URL, so nothing here edits that file — the
database is chosen with an environment variable, which pydantic-settings takes
in preference to the `.env` value.

```bash
cd api
DATABASE_URL="postgresql+psycopg://$(whoami)@localhost:5432/liffto_local" venv/bin/alembic upgrade head
```

Seven migrations, ending at `007_notifications`, and every per-type table
(`wifi`, `vcards`, `events`, …) comes with them.

## 3. The API

Use the `api-local-db` entry in `.claude/launch.json`, which sets the same
`DATABASE_URL` plus a `FRONTEND_URL` covering both the dev server and the
preview build. The plain `api` entry is the one that talks to production; they
share port 8000, so only one can run at a time.

## 4. A user, without Google

The UI only offers Google, but the API has kept a full email and password path
that the UI never grew a screen for. `/auth/register` hands back the
verification token in its response rather than emailing it, which is what makes
this possible unattended.

```bash
API=http://localhost:8000/api/v1
EMAIL=dev.tester@example.com
PASS='LocalTest!2345'

TOKEN=$(curl -sS -X POST "$API/auth/register" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"first_name\":\"Dev\",\"last_name\":\"Tester\",\"account_slug\":\"liffto\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["verification_token"])')

curl -sS -X POST "$API/auth/verify-email" -H 'Content-Type: application/json' -d "{\"token\":\"$TOKEN\"}"
curl -sS -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
```

Use a real-looking domain. `@liffto.test` is rejected — `.test` is a reserved
name and the email validator will not accept it.

## 5. The front end

`.env.production.local` (gitignored, and read only by production-mode builds, so
`npm run dev` is unaffected) points the preview build at the local API:

```
VITE_BACKEND_API_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_CLIENT_ID=...
```

Then `npm run build` and start the `built` launch entry.

## 6. Signing in

The app keeps its session in `localStorage` under `liffto.session`. Log in
through the API and write the result there:

```js
const API = 'http://localhost:8000/api/v1'
const t = await (await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'dev.tester@example.com', password: 'LocalTest!2345' }),
})).json()
const u = await (await fetch(`${API}/auth/me`, {
  headers: { Authorization: `Bearer ${t.access_token}` },
})).json()

localStorage.setItem('liffto.session', JSON.stringify({
  user: {
    id: u.id, email: u.email,
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
    picture: u.picture ?? null,
    first_name: u.first_name, last_name: u.last_name,
    account_id: u.account_id, roles: u.roles, is_superuser: u.is_superuser,
    phone: u.phone ?? null,
    notify_scans: u.notify_scans, notify_weekly: u.notify_weekly,
    notify_product: u.notify_product,
  },
  accessToken: t.access_token,
  refreshToken: t.refresh_token,
}))
```

The `user` object has to be there, not just the tokens. `isAuthenticated` is
`Boolean(user)` and reads it straight out of storage, so a session holding only
tokens is bounced by ProtectedRoute before `/auth/me` has a chance to answer.
The shape is whatever `mapApiUser` in `src/api/auth.api.ts` produces.

## Records to seed

Worth having, because these are the cases that are easy to get wrong and
impossible to see otherwise:

- a **dynamic website** with a frame — frame compositing on download, and the
  destination row
- a **dynamic, inactive** code — the status filter has nothing else to match
- a **static website** — the destination row appears without a redirect
- a **static Wi-Fi** code — the destination row must not appear
- a **static Text** code whose `url` column holds its own short URL — the case
  that proves the url field cannot decide whether there is a destination
- an **event that has already finished** — the ended state on the scan page

Create them with `POST /api/v1/{websites,wifis,texts,events}`. Wi-Fi content
uses `auth`, not `security`.
