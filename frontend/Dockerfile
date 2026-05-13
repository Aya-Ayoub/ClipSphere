# ── Frontend Dockerfile (Multi-stage) ────────────────────────────────────────
# Stage 1: Install dependencies
# Stage 2: Build the Next.js application
# Stage 3: Minimal production runner
#
# Multi-stage approach keeps the final image small by excluding
# dev dependencies and build tooling from the production image.

# ── Stage 1: Dependencies ─────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only package files first — Docker caches this layer
# and skips npm install if packages haven't changed
COPY package*.json ./
RUN npm ci

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build-time environment variables
# These are baked into the static JS bundle at build time.
# They MUST start with NEXT_PUBLIC_ to be accessible in the browser.
ARG NEXT_PUBLIC_API_URL=http://localhost/api/v1
ARG NEXT_PUBLIC_SOCKET_URL=http://localhost

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the production Next.js application
RUN npm run build

# ── Stage 3: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nextjs -u 1001

# Copy only what's needed to run the app
# next/standalone output mode bundles the minimal server code
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next/standalone creates a minimal server.js
CMD ["node", "server.js"]