FROM node:20-alpine AS web-build
WORKDIR /build/web

COPY web/package.json web/package-lock.json ./

# Vite and the React plugin are devDependencies but are required to compile
# the frontend. Explicitly include them even when Railway sets production mode.
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false
RUN npm ci --include=dev
RUN ./node_modules/.bin/vite build

COPY web/ ./
ENV VITE_API_BASE_URL=/api/v1
ENV VITE_APP_NAME=SwiftPool
RUN npm run build

FROM node:20-alpine AS api-deps
WORKDIR /build/api
COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
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
