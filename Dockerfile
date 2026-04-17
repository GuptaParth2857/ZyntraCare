# ZyntraCare Healthcare Platform - Production Dockerfile
# Optimized for Google Cloud Run and similar container platforms

# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies with audit and fund disabled for smaller output
RUN npm ci --legacy-peer-deps --audit=false --fund=false

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache openssl python3 make g++

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# =============================================================================
# Stage 3: Runner - Production Image
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl tini curl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only necessary files for production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Use standalone output for minimal image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as init system to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "server.js"]