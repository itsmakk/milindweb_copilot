# Cloudflare Worker — `mk9.in/api/*` reverse proxy

This Worker forwards every request whose path starts with `/api/` to the
Render-hosted NestJS API. Everything else falls through to **Cloudflare
Pages** (the static site).

## Routes (configured in Cloudflare dashboard)

| Host           | Pattern       | Worker              |
|----------------|---------------|---------------------|
| `mk9.in`       | `/api/*`      | `milindweb-api-proxy` |
| `www.mk9.in`   | `/api/*`      | `milindweb-api-proxy` |

`UPSTREAM` defaults to `https://milindweb-api.onrender.com`. Change it
in `wrangler.toml` under `[env.production.vars]`.

## Local development

```bash
# Run the API locally first
pnpm --filter @milindweb/api dev

# In another terminal, run the worker
pnpm dlx wrangler dev
```

`wrangler dev` will print a local URL like `http://localhost:8787` that
proxies `/api/*` to `http://localhost:3000`.

## Deploy

```bash
# First time: log in
pnpm dlx wrangler login

# Deploy to production
pnpm dlx wrangler deploy --env production
```

## Files

- `src/index.ts` — the proxy logic
- `wrangler.toml` — config (UPSTREAM per env, no routes here; bind routes in the dashboard)
