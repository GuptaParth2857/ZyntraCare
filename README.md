# ZyntraCare - AI-Powered Healthcare Platform

A full-stack, production-ready, AI-powered healthcare platform that integrates multiple healthcare challenges into a unified, scalable ecosystem.

## Features

### Core Features
- **AI-Based Disease Risk Detection** - Predict lifestyle disease risks using health metrics
- **Real-time Hospital Bed Tracking** - Live bed availability with SSE updates
- **Emergency Response System** - One-tap emergency mode with auto-location detection
- **Smart Hospital Recommendation** - AI-powered hospital suggestions based on user needs
- **Ambulance Booking** - Quick ambulance booking with real-time tracking
- **Telehealth Access** - Remote consultations with specialists

### AI Features (Gemini Integration)
- Symptom Checker with possible conditions
- Risk Prediction for lifestyle diseases
- Clinical Data Summarization
- Smart Hospital Recommendations

### Technical Features
- **Real-time Updates** - Server-Sent Events (SSE)
- **IoT Simulation** - Simulated wearable health data (heart rate, BP, oxygen)
- **Blockchain** - Hash-based patient data security
- **State Management** - Zustand for global state

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **3D**: Three.js + React Three Fiber
- **Database**: Prisma + SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js
- **State**: Zustand
- **Maps**: Leaflet
- **AI**: Google Gemini API
- **Deployment**: Docker + Vercel/Cloud Run

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for production)

### Installation

```bash
# Clone the repository
cd ZyntraCare

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` with:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
```

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