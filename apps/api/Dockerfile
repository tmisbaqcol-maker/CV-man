# Build context must be the monorepo root (cv-manager/), not apps/api:
#   docker build -f apps/api/Dockerfile -t cv-manager-api .
#
# This is required because apps/api depends on packages hoisted to the
# workspace root node_modules (npm workspaces) — building from apps/api
# alone would produce a broken image (see the platform-express resolution
# bug we hit locally: @nestjs/core couldn't find @nestjs/platform-express
# when they lived in different node_modules trees).

# ---------- deps: full install (prod + dev), used only to build ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=apps/api --include-workspace-root

# ---------- build: compile TypeScript -> dist ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY apps/api apps/api
RUN npm run build --workspace=apps/api

# ---------- prod-deps: production-only install, for the runtime image ----------
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --omit=dev --workspace=apps/api --include-workspace-root

# ---------- runtime: minimal final image ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
