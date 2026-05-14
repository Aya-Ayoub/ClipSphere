# PERSON B
# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production Image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

# ffmpeg required for video duration enforcement
RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN mkdir -p uploads tmp

RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 && \
    chown -R backend:nodejs /app

USER backend

EXPOSE 5000

CMD ["node", "server.js"]