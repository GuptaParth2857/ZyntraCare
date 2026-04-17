# ZyntraCare - Setup Guide

## Prerequisites

- Node.js 18 or higher
- npm 9+ or yarn
- Git

## Installation Steps

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/ZyntraCare.git
cd ZyntraCare
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
npx prisma db push
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Running with Docker

```bash
docker build -t zyntracare .
docker run -p 3000:3000 -e DATABASE_URL="file:./dev.db" zyntracare
```

## Testing the APIs

```bash
# Health check
curl http://localhost:3000/api/health

# Real-time events (SSE)
curl http://localhost:3000/api/realtime
```

## Troubleshooting

### Build fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Database issues
```bash
# Reset database
rm -f prisma/dev.db
npx prisma db push
```

### Port already in use
```bash
# Kill existing process
fuser -k 3000/tcp
# Or use different port
PORT=3001 npm run dev
```