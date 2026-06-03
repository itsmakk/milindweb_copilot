# Deployment Guide — mk9.in (Cloudflare + Render + InsForge)

The whole stack in 30 minutes, with **three clicks** in dashboards and three
commands in your terminal.

## Topology

```
                                 ┌────────────────────────┐
                                 │     Cloudflare         │
                                 │  (DNS + Pages + Worker)│
                                 └──────┬─────────────┬───┘
                                        │             │
        mk9.in/*  (static site)         │             │  mk9.in/api/*
        www.mk9.in/*                    │             │
        ─────────────────────────────►  │  Pages      │  Worker (mk9-api)
                                        │  (no build) │  proxies to Render
                                        │             │            │
                                        └─────────────┘            │
                                                                 ▼
                                                     ┌──────────────────────┐
                                                     │  Render (mk9-api)   │
                                                     │  NestJS, Docker     │
                                                     └──────────┬───────────┘
                                                                │  HTTPS
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │  InsForge (BaaS)    │
                                                     │  Postgres + Auth +  │
                                                     │  Storage            │
                                                     └──────────────────────┘
```

## One-time prerequisites (you need before clicking)

| What              | Where to get it                                    |
|-------------------|----------------------------------------------------|
| InsForge project  | https://insforge.dev → new project                 |
| `INSFORGE_BASE_URL`   | InsForge dashboard → API tab                       |
| `INSFORGE_API_KEY`    | InsForge dashboard → API tab → **service role** key |
| `INSFORGE_ANON_KEY`   | InsForge dashboard → API tab → anon key            |
| GitHub account + repo `mk9web/milindweb` (or fork this one) | github.com |

---

## Phase 1 — Local: bootstrap the data plane (≈3 min)

```bash
# 1. clone / cd
cd milindweb

# 2. env
cp .env.example .env
# open .env and paste your three InsForge values

# 3. install + apply schema + seed + buckets
npm install -g pnpm@9.15.0            # if you don't have it
pnpm install
pnpm bootstrap:insforge
```

You should see, in order:

```
db-migrate-insforge: N statements parsed
db-seed-insforge starting…
storage-bootstrap: creating 6 buckets
…
```

If `migrate:insforge` reports `NETWORK: ...` and prints the SQL, your plan
doesn't expose `/api/database/execute`. In that case paste the printed SQL
into **InsForge dashboard → SQL editor → New query → Run**, then re-run
`pnpm bootstrap:insforge`.

## Phase 2 — Push to GitHub (≈1 min)

```bash
git init
git add .
git commit -m "feat: cloud deploy — InsForge + Render + Cloudflare"
git branch -M main
git remote add origin git@github.com:<YOU>/milindweb.git
git push -u origin main
```

## Phase 3 — Render: deploy the API (≈5 min, mostly waiting)

1. Go to https://dashboard.render.com → **New** → **Blueprint**.
2. Pick the GitHub repo you just pushed.
3. Render reads `render.yaml` and pre-fills the `mk9-api` service.
4. Open the **Environment** tab of the new service and fill in:
   - `INSFORGE_BASE_URL`
   - `INSFORGE_API_KEY`
   - `INSFORGE_ANON_KEY`
   - `INSFORGE_ADMIN_EMAILS` (your email — gives you super_admin)
5. Click **Apply**. First deploy takes ~3 min (Docker build).

When it's green, note the URL. It will be `https://mk9-api.onrender.com`
(or whatever Render gives you — change `RENDER_API_URL` below if so).

## Phase 4 — Cloudflare: Worker (api/*) (≈3 min)

1. **Workers & Pages → Create Worker** → name `milindweb-api-proxy` → **Deploy**.
2. **Edit code** → paste the contents of `worker/src/index.ts` →
   **Save and Deploy**.
3. Open `wrangler.toml` and confirm `UPSTREAM` is set correctly for the
   `[env.production]` block (or override `UPSTREAM` in the Worker
   dashboard under Settings → Variables).
4. **Triggers → Routes → Add route**:
   - Route: `mk9.in/api/*`
   - Worker: `milindweb-api-proxy`
   - (do the same for `www.mk9.in/api/*` if you want the same behaviour)

## Phase 5 — Cloudflare: Pages (static site) (≈3 min)

1. **Workers & Pages → Create application → Pages → Connect to Git**.
2. Pick the same repo.
3. Project name: `mk9web` (or whatever you like).
4. Build settings: leave **Build command** and **Build output directory** blank
   (the repo is plain HTML, no build step).
5. **Custom domains → Set up a custom domain**:
   - Add `mk9.in` → Cloudflare will tell you to update nameservers if you
     haven't already. Once `mk9.in` is "active", add `www.mk9.in` too.
6. Visit https://mk9.in in a browser. You should see the static site.

## Phase 6 — Verify (≈30 s)

```bash
curl -I  https://mk9.in                                # expect HTTP/2 200
curl -s  https://mk9.in/api/v1/health/ready | jq       # expect {status:"ok", driver:"insforge"}
curl -s  https://mk9.in/api/v1/health/live  | jq       # expect {status:"ok", uptime:...}
```

If the `ready` call returns `degraded`, check Render logs — usually the
`INSFORGE_*` env vars didn't get injected.

## Phase 7 — Sign up the first admin (≈1 min)

1. Visit https://mk9.in/auth/signup.html
2. Sign up with the email you put in `INSFORGE_ADMIN_EMAILS`
3. Check your inbox and click the confirmation link
4. Sign in at https://mk9.in/auth/login.html
5. The mirror row in `auth_users` is created lazily on first `/users/me` call

You're live. 🎉

---

## Troubleshooting

| Symptom                                  | Fix                                                                 |
|------------------------------------------|---------------------------------------------------------------------|
| `curl /api/v1/health/ready` → 502        | Worker's `UPSTREAM` env var is wrong. Check the Worker dashboard or `wrangler.toml`. |
| `ready` returns `degraded`               | Render's `INSFORGE_*` env vars missing. Open the Render service → Environment. |
| `/auth/signup.html` shows a CORS error   | The API's `CORS_ORIGINS` must include `https://mk9.in`. Re-deploy Render. |
| Worker deploy fails                      | `pnpm worker:dev` locally to see the error, or check the Cloudflare build log. |
| Pages shows the old site                 | Hard refresh (Ctrl+Shift+R). Cloudflare caches aggressively for 30s on first deploy. |
| 404 on `/api/v1/health/ready`            | The Worker route isn't attached. Re-check Triggers → Routes.         |

## Rollback

- **Render**: Service → Manual Deploy → pick a previous commit.
- **Cloudflare Pages**: Deployments → click a previous successful deploy → **Rollback to this deploy**.
- **Cloudflare Worker**: Deployments → click a previous version → **Activate**.

## Ongoing

- `pnpm bootstrap:insforge` is safe to re-run at any time.
- Push to `main` triggers a Render auto-deploy AND a Cloudflare Pages
  auto-deploy via GitHub.
