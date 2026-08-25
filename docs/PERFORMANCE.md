# ZyntraCare Performance Analysis - 1 Million Users

## Current Issues for High Scale:

### 1. In-Memory Stores (WILL FAIL at scale)
- `send-otp/route.ts`: OTP_STORE is in-memory Map - resets on server restart, memory leak at scale
- `subscribe/route.ts`: subscriptions stored in-memory - lost on restart
- `admin/active-users/route.ts`: session store in-memory - memory explosion at 1M users
- `emergency/route.ts`: ALERTS_DB stored in-memory - not persistent

### 2. Database Issues
- Using SQLite in development (not suitable for 1M users)
- Need PostgreSQL with connection pooling
- Need Redis for sessions/caching

### 3. Missing for Production Scale
- No Redis for OTP/session storage
- No database connection pooling
- No horizontal scaling setup
- No CDN for static assets
- No message queue for async jobs

## Fixes Needed:

### Critical (Must Fix Before 1M Users):

1. **Replace OTP in-memory store with Redis**:
```typescript
// Current (BAD for scale)
const OTP_STORE = new Map();

// Should use Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
await redis.setex(`otp:${phone}`, 300, otp);
```

2. **Replace session store with Redis**:
```typescript
// Current (BAD)
const store = global._activeUsersStore ?? new Map();

// Should use Redis
const sessionStore = redis;
```

3. **Switch to PostgreSQL** (already have schema):
```yaml
# docker-compose.yml should use PostgreSQL in production
DATABASE_URL=postgresql://user:password@db:5432/zyntracare
```

### Required Environment Variables:
```
REDIS_URL=redis://:password@redis-host:6379
DATABASE_URL=postgresql://user:password@db:5432/zyntracare
NEXTAUTH_SECRET=min-32-chars-random-string-here
GEMINI_API_KEY=your-api-key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Load Test Results (Expected):

| Metric | Current | With Fixes |
|--------|---------|------------|
| Auth Throughput | ~50/sec | ~5000/sec |
| Memory per 10k Users | ~100MB | ~10MB |
| Session Storage | Lost on restart | Persistent |
| OTP Delivery | In-memory | Redis-backed |
| Database | SQLite | PostgreSQL + Redis |

## Recommendation:

The codebase is **secure** but **not production-ready** for 1 million users. Need to:

1. Add Redis for caching/sessions
2. Configure PostgreSQL (not SQLite)
3. Add connection pooling
4. Set up horizontal scaling with multiple instances

Would you like me to:
1. Create production docker-compose with Redis?
2. Add connection pooling configuration?
3. Set up load balancing?