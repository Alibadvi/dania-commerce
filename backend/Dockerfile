FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/tsconfig.json backend/vite.config.mts ./
COPY backend/src ./src
COPY backend/seed-data ./seed-data
COPY public/images ./import-assets
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/seed-data ./seed-data
COPY --from=build /app/import-assets ./import-assets
RUN mkdir -p /app/static/assets
EXPOSE 3000
CMD ["node", "dist/index.js"]
