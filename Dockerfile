FROM node:22-alpine AS build
WORKDIR /app
ENV SITES_BUILD_TIMEOUT=8m
RUN apk add --no-cache bash coreutils
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN find scripts -type f -name '*.sh' -exec sed -i 's/\r$//' {} +
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 10000
ENV PORT=10000
CMD ["node", "node_modules/vinext/dist/cli.js", "start", "--hostname", "0.0.0.0"]
