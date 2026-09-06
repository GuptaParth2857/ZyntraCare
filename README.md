# ZyntraCare - AI-Powered Healthcare Platform

> A full-stack, AI-powered healthcare platform integrating disease detection, emergency response, hospital management, and telehealth into a unified ecosystem.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/Mobile)                  │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Dashboard │ │Emergency │ │Symptoms  │ │Hospital  │          │
│  │  Pages   │ │  System  │ │Checker   │ │  Map     │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       └─────────────┼───────────┼─────────────┘                │
│                     │  Zustand Store + SSE                      │
└─────────────────────┼───────────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                  API LAYER (Next.js API Routes)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  /api/ai │ │/api/emerg│ │/api/hosp │ │/api/ambul│          │
│  │  /chat   │ │  /cases  │ │  /nearby │ │  /track  │          │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘          │
│       │            │            │            │                  │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐ ┌──┴───────┐         │
│  │  Rate    │ │  Zod     │ │  Auth    │ │  Cache   │         │
│  │ Limiter  │ │ Validate │ │  (JWT)   │ │ (Redis)  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────┼───────────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                 EXTERNAL SERVICES                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Gemini   │ │ Twilio   │ │ Razorpay │ │ Leaflet  │          │
│  │ AI API   │ │ SMS/Voice│ │ Payments │ │  Maps    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────┼───────────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │ Prisma   │ │  SQLite  │ │  Redis   │                       │
│  │  ORM     │ │ (dev) /  │ │ (cache)  │                       │
│  │          │ │PostgreSQL│ │          │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│  80+ Models: User, Hospital, Doctor, Ambulance, Emergency,     │
│  HealthRecord, Prescription, Subscription, Insurance, etc.     │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### Core Features (Production-Ready)
- **AI Symptom Checker** - Gemini-powered analysis with 200+ medical conditions database
- **Emergency Response** - One-tap SOS with real-time haversine-based ETA calculation
- **Hospital Bed Tracking** - Live bed availability via SSE (Server-Sent Events)
- **Ambulance Booking** - Real-time tracking with driver console and GPS updates
- **Telehealth** - JitsiMeet-powered video consultations with specialists
- **Health Dashboard** - Real-time IoT vitals with smooth interpolation

### AI Features (Gemini + Fallback)
- Symptom analysis with probability scores and red flags
- Emergency triage classification (high/medium/low priority)
- Health risk prediction with disease probability
- AI health coach with personalized recommendations
- Smart hospital recommendations based on user location + symptoms

### Security & Quality
- **Rate Limiting** - Redis-backed with in-memory fallback (all API routes)
- **Input Validation** - Zod schemas for all user inputs
- **Authentication** - NextAuth.js with Credentials, Phone OTP, Google/GitHub OAuth
- **Security Headers** - HSTS, CSP, XSS protection via middleware
- **Tests** - 37 unit tests (Vitest) covering core logic

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 + React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 + Framer Motion |
| **3D** | Three.js + React Three Fiber |
| **Database** | Prisma 7 + SQLite (dev) / PostgreSQL (prod) |
| **Auth** | NextAuth.js 5 (Credentials, OTP, OAuth) |
| **State** | Zustand 5 |
| **Maps** | Leaflet + React-Leaflet |
| **AI** | Google Gemini 2.0 Flash + Ollama fallback |
| **Video** | JitsiMeet External API |
| **Payments** | Razorpay (test + live modes) |
| **SMS** | Twilio (OTP + Emergency alerts) |
| **Email** | Nodemailer (SMTP) |
| **Cache** | Redis (ioredis) with in-memory fallback |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **API Docs** | OpenAPI 3.0 (docs/openapi.yaml) |
| **Mobile** | Capacitor 8 (iOS + Android) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd ZyntraCare

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (optional - app works without them)

# Initialize database with real data
npx prisma db push
npm run db:seed:all

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No* | Google Gemini API key for AI features |
| `RAZORPAY_KEY_ID` | No* | Razorpay test key for payments |
| `TWILIO_ACCOUNT_SID` | No* | Twilio for OTP/SMS |
| `DATABASE_URL` | Yes | SQLite file path or PostgreSQL URL |

*App works without these using heuristic/mock fallbacks

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/              # API routes
│   │   ├── chat/        # AI Chat (Gemini)
│   │   ├── hospitals/   # Hospital APIs
│   │   ├── symptoms/   # Symptom checker
│   │   └── realtime/   # SSE for real-time updates
│   ├── dashboard/       # User dashboard
│   ├── hospitals/      # Hospital listing
│   ├── doctors/       # Specialists
│   ├── emergency/     # Emergency services
│   └── ...
├── components/            # React components
├── hooks/               # Custom React hooks
│   ├── useGeolocation.ts
│   └── useIoTSimulation.ts
├── store/               # Zustand stores
│   └── useAppStore.ts
├── lib/                 # Utilities
│   ├── blockchain.ts    # Blockchain simulation
│   ├── utils.ts
│   └── prisma.ts
├── data/                 # Mock data
└── prisma/               # Database schema
```

## Available Scripts

```bash
npm run dev        # Development server
npm run build     # Production build
npm run start     # Start production server
npm run lint     # Run ESLint
npm run db:seed  # Seed database
```

## LibreChat Integration

This project includes an embedded LibreChat interface accessible via the `/chat` route. The chat interface loads from a configurable URL, making it work both in development and production environments.

### Configuration

The LibreChat URL is configured via the `NEXT_PUBLIC_LIBRECHAT_BASE_URL` environment variable:

**For Local Development (with separate LibreChat instance):**
1. Clone the LibreChat repository:
```bash
git clone https://github.com/danny-avila/LibreChat.git
cd LibreChat
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (copy from `.env.example`):
```bash
cp .env.example .env
# Edit .env with your API keys and settings
```

4. Start LibreChat:
```bash
npm run dev
# LibreChat will be available at http://localhost:3001
```

5. Set the environment variable in ZyntraCare:
```env
# In your .env.local file
NEXT_PUBLIC_LIBRECHAT_BASE_URL=http://localhost:3001
```

**For Production Deployment (Single Vercel Monorepo Attempt):**
If you wish to deploy both ZyntraCare and LibreChat together in a single Vercel project (advanced, requires external datastores), follow these steps:

1. **Ensure required datastores are available** (MongoDB, Meilisearch, etc.) because LibreChat's API depends on them.
   - You can use MongoDB Atlas, Meilisearch Cloud, or self-hosted instances.
   - Set the necessary environment variables in your Vercel project (see LibreChat's `.env.example` for a full list).

2. **Configure environment variables in Vercel (for ZyntraCare project):**
   - `NEXT_PUBLIC_LIBRECHAT_BASE_URL`: Set to `/librechat` (so the iframe loads LibreChat from the same domain under `/librechat`).
   - All required LibreChat backend environment variables (e.g., `MONGO_URI`, `MEILI_HOST`, `MEILI_MASTER_KEY`, `UID`, `GID`, `PORT`, etc.).
   - Refer to LibreChat's documentation for the complete list: https://docs.librechat.ai/configuration/librechat_yaml

3. **Vercel Build Configuration:**
   - The provided `vercel.json` attempts to build both projects and route traffic accordingly.
   - A custom build script (`npm run vercel-build`) is defined in `package.json` to build LibreChat's client during the Vercel build.

4. **Deploy:**
   - Push your changes to Vercel.
   - Vercel will run the build script, build both Next.js (ZyntraCare) and LibreChat client, and set up the Node.js server for LibreChat's API.
   - Access the chat at `/chat` in your deployed ZyntraCare app.

### ⚠️ Important Notes on Monorepo Approach
- LibreChat is not optimized for Vercel's serverless functions; the API route (`/api/librechat/*`) will be served as a Vercel Node.js function, which has limitations (e.g., execution time, cold starts, lack of persistent filesystem for uploads unless using external storage).
- File uploads in LibreChat will need to be configured to use an external service (e.g., S3) because Vercel's filesystem is ephemeral.
- For production reliability, deploying LibreChat separately (as a Docker container, on Railway, etc.) is still recommended.
- The iframe in `/src/app/chat/page.tsx` uses `NEXT_PUBLIC_LIBRECHAT_BASE_URL` to construct the src URL. It defaults to `/librechat` when the variable is unset (useful for the monorepo deploy) or can be set to a full URL (e.g., `http://localhost:3001`) for local development with a separate LibreChat instance.

Once configured, you can access the chat interface in ZyntraCare by navigating to `/chat` in your application.

## Key Pages

| Route | Description |
|------|-------------|
| `/` | Landing page with 3D animations |
| `/dashboard` | User dashboard with health metrics |
| `/hospitals` | Hospital map with real-time beds |
| `/doctors` | Specialist search & booking |
| `/emergency` | Emergency services |
| `/symptoms` | AI Symptom Checker |
| `/health-risk` | AI Risk Prediction |
| `/clinical-ai` | Clinical data analysis |
| `/pharmacies` | Pharmacy finder |
| `/labs` | Diagnostic lab finder |
| `/subscription` | Premium plans |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | AI Chat (Gemini) |
| `/api/symptoms` | POST | Symptom analysis |
| `/api/health-risk` | POST | Risk prediction |
| `/api/hospitals/nearby` | GET | Nearby hospitals |
| `/api/beds` | GET | Real-time bed data |
| `/api/realtime` | GET | SSE real-time updates |
| `/api/chat` | POST | AI Chatbot |

## Deployment

### Docker

```bash
# Build image
docker build -t zyntracare .

# Run container
docker run -p 3000:3000 zyntracare
```

### Vercel (Frontend)

```bash
npm i -g vercel
vercel deploy
```

### Google Cloud Run (Backend)

```bash
gcloud run deploy zyntracare \
  --source . \
  --region asia-south1 \
  --platform managed
```

## Production Checklist

- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Set up CDN for static assets
- [ ] Configure domain and SSL
- [ ] Set up monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Set up backups

## License

MIT

## Support

For issues and questions, please open a GitHub issue.