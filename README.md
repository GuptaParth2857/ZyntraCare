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