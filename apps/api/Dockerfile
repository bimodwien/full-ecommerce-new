# Build from the repo root: docker build -f apps/api/Dockerfile -t tokopakbimo-api .

FROM node:24.21.0-slim AS base
# Prisma's migrate engine needs OpenSSL, which the slim image leaves out.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
# Match the npm that wrote package-lock.json (see "packageManager").
RUN npm install -g npm@12.2.2
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1

# 1) Cut the monorepo down to what "api" needs.
FROM base AS prepare
RUN npm install -g turbo@2.11.11
COPY . .
RUN turbo prune api --docker

# 2) Install dependencies, then build.
FROM base AS builder
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/package-lock.json ./package-lock.json
COPY --from=prepare /app/.npmrc ./.npmrc
# The root prepare scripts set up husky git hooks, which need .git and .husky.
RUN npm pkg delete scripts.prepare scripts.postprepare
RUN npm ci
COPY --from=prepare /app/out/full/ .
# prisma.config.ts reads DATABASE_URL; generate never connects, so any value works.
RUN cd apps/api && DATABASE_URL=postgresql://build@localhost/build npx prisma generate
RUN npm run build --workspace=api

# 3) Final image. Dev dependencies stay in, because the seed runs through ts-node.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api ./apps/api
USER node
WORKDIR /app/apps/api
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
