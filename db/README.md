# `@milindweb/db`

Migrations, seeds, and schema docs.

## Layout

```
db/
├── migrations/         # node-pg-migrate .js files
│   └── auth/           # one folder per schema
│       └── 1717000000000_init.js
├── seeds/              # reference data (idempotent SQL)
│   └── auth_role_catalog.sql
├── schemas/            # per-domain ER + docs (markdown)
└── package.json        # pg-migrate scripts
```

## Run migrations

```bash
# install deps (workspace root)
pnpm install

# up
pnpm migrate:up

# status
pnpm migrate:status

# down one step
pnpm migrate:down
```

The runner reads `DATABASE_URL` from env. In dev, copy `.env.example` to `.env` at the repo root and let `docker compose` populate it for the `api` container.

## Per-schema policy

- One folder per schema under `migrations/`.
- Migrations are **forward-only in production** (do not run `down` against prod).
- File naming: `<timestamp>-<short-name>.js`. Timestamps are bigint milliseconds; never reorder.
- Use raw SQL in JS exports (`pgm.sql('…')`) for clarity. Use `pgm.createTable` / `pgm.addColumn` when you want pgm to compute the rollback.

See `docs/adr/0005-migration-tool-node-pg-migrate.md` and `docs/database-schema.md`.
