FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# ─── Development ────────────────────────────────────────────
FROM base AS development
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install
COPY . .
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "dev"]

# ─── Build ──────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @projectflow/api build

# ─── Production ─────────────────────────────────────────────
FROM node:20-alpine AS production
RUN npm install -g pnpm@9
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages ./packages

RUN pnpm install --prod --frozen-lockfile

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

EXPOSE 4000
CMD ["node", "dist/index.js"]
