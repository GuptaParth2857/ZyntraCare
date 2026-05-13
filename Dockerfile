FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl tini
WORKDIR /app
COPY ZyntraCare/package.json ZyntraCare/package-lock.json* ./
RUN npm ci --legacy-peer-deps --audit=false --fund=false

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl python3 make g++
COPY --from=deps /app/node_modules ./node_modules
COPY ZyntraCare/ .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl tini curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]