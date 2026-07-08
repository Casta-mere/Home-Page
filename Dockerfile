FROM node:22-alpine AS deps
WORKDIR /app
COPY home-page/package.json home-page/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY home-page/ ./
# NEXT_PUBLIC_* vars are inlined at build time, so they must be build args.
ARG NEXT_PUBLIC_BASE_DOMAIN=castamerego.com
ENV NEXT_PUBLIC_BASE_DOMAIN=$NEXT_PUBLIC_BASE_DOMAIN
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=4869 HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 4869
LABEL org.opencontainers.image.authors="castamere"
CMD ["node", "server.js"]
