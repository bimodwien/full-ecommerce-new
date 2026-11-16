# Build from the repo root (the build args are listed in docker-compose.yml):
#   docker build -f apps/web/Dockerfile -t tokopakbimo-web \
#     --build-arg NEXT_PUBLIC_BASE_API_URL=https://tokopakbimo.bimodwien.id/api ... .

FROM node:24.21.0-slim AS base
# Match the npm that wrote package-lock.json (see "packageManager").
RUN npm install -g npm@12.2.2
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1 NEXT_TELEMETRY_DISABLED=1

# 1) Cut the monorepo down to what "web" needs.
FROM base AS prepare
RUN npm install -g turbo@2.11.11
COPY . .
RUN turbo prune web --docker

# 2) Install dependencies, then build.
FROM base AS builder
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/package-lock.json ./package-lock.json
COPY --from=prepare /app/.npmrc ./.npmrc
# The root prepare scripts set up husky git hooks, which need .git and .husky.
RUN npm pkg delete scripts.prepare scripts.postprepare
# Cypress is only for component tests; skip its ~500MB binary download.
ENV CYPRESS_INSTALL_BINARY=0
RUN npm ci
COPY --from=prepare /app/out/full/ .
# NEXT_PUBLIC_* values are baked into the browser bundle at build time, not read at runtime.
ARG NEXT_PUBLIC_BASE_API_URL
ARG NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
ARG NEXT_PUBLIC_MIDTRANS_SNAP_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN test -n "$NEXT_PUBLIC_BASE_API_URL" \
  && test -n "$NEXT_PUBLIC_MIDTRANS_CLIENT_KEY" \
  && test -n "$NEXT_PUBLIC_MIDTRANS_SNAP_URL" \
  && test -n "$NEXT_PUBLIC_GOOGLE_CLIENT_ID"
RUN npm run build --workspace=web

# 3) Final image: only the standalone server and its static files.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
USER node
CMD ["node", "apps/web/server.js"]
