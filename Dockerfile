FROM node:22-alpine AS web-build
WORKDIR /build/web

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_APP_NAME=SwiftPool
RUN npm run build

FROM node:22-alpine AS api-deps
WORKDIR /build/api
ENV NODE_ENV=production

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
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
