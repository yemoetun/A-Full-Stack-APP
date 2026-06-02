FROM node:20-alpine AS base
RUN npm install -g pnpm@9

# ─── Development ────────────────────────────────────────────
FROM base AS development
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install
COPY . .
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "dev"]

# ─── Build ──────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
RUN pnpm --filter @projectflow/web build

# ─── Production ─────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "apps/web/server.js"]
