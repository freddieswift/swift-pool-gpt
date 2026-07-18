FROM node:22-bookworm-slim AS web-build
WORKDIR /build/web

COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY web/ ./
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_APP_NAME=SwiftPool
RUN npm run build


FROM node:22-bookworm-slim AS api-deps
WORKDIR /build/api

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund


FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=api-deps /build/api/node_modules ./node_modules
COPY api/package.json api/package-lock.json ./
COPY api/src ./src
COPY api/migrations ./migrations
COPY api/sequelize.config.cjs ./
COPY --from=web-build /build/web/dist ./public

EXPOSE 3000

CMD ["node", "src/server.js"]
