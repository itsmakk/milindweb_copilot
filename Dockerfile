# syntax=docker/dockerfile:1.7
# ----------------------------------------------------------------------------
#  MilindWeb — single-stage Dockerfile for the NestJS API.
#  Optimised for Render free tier (Singapore, 512 MB, 0.1 vCPU).
#  pnpm is used at build time only; runtime is plain node.
# ----------------------------------------------------------------------------

FROM node:20-alpine AS builder
WORKDIR /app

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy manifests for cache-friendly install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY api/package.json    ./api/
COPY db/package.json     ./db/
COPY shared/package.json ./shared/

# Install all deps (incl. dev) so we can build
RUN pnpm install --frozen-lockfile || pnpm install

# Source
COPY tsconfig.base.json ./
COPY shared/  ./shared/
COPY api/     ./api/
COPY db/      ./db/

# Build shared first (api imports from compiled shared)
RUN pnpm --filter @milindweb/shared build

# Build the API
RUN pnpm --filter @milindweb/api build

# Drop dev deps for a smaller runtime image
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# ----------------------------------------------------------------------------
#  Runtime — small, non-root, distroless-friendly alpine
# ----------------------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy built artifacts + production node_modules + migrations
COPY --from=builder --chown=app:app /app/api/dist            ./api/dist
COPY --from=builder --chown=app:app /app/shared/dist         ./shared/dist
COPY --from=builder --chown=app:app /app/shared/package.json ./shared/package.json
COPY --from=builder --chown=app:app /app/api/node_modules    ./api/node_modules
COPY --from=builder --chown=app:app /app/db/node_modules     ./db/node_modules
COPY --from=builder --chown=app:app /app/db/migrations       ./db/migrations
COPY --from=builder --chown=app:app /app/api/package.json    ./api/package.json
COPY --from=builder --chown=app:app /app/db/package.json     ./db/package.json

USER app
EXPOSE 3000

# Render health check: GET /api/v1/health/ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/v1/health/ready || exit 1

CMD ["node", "api/dist/main.js"]
