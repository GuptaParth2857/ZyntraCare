# ZyntraCare - Unified Healthcare Platform

## Project Overview
Build a production-ready, AI-powered healthcare platform addressing 5 critical healthcare challenges (HCP01-HCP05) using Next.js 16, React 19, Three.js, and advanced optimization for 100k+ users.

## Tech Stack (Latest Versions)
- **Framework**: Next.js 16.2.4 (App Router, Turbopack)
- **Frontend**: React 19.2.5 + TypeScript 5.7.3
- **Styling**: Tailwind CSS 3.4.17 + Framer Motion 12.38.0
- **3D**: Three.js 0.184.0 + React Three Fiber
- **State**: Zustand 5.0.12 + TanStack Query
- **Database**: Prisma 6.5.0 + PostgreSQL
- **Auth**: NextAuth.js
- **AI**: Google Gemini 2.0 API
- **Real-time**: Server-Sent Events (SSE)
- **Maps**: Leaflet + OpenStreetMap

## 5 Healthcare Challenges to Solve

### HCP01: Early Detection of Lifestyle Disease Risk
- AI-based health risk prediction using lifestyle data
- BMI, blood pressure, blood sugar, cholesterol analysis
- Family history, exercise, diet assessment
- Risk score calculation with recommendations
- Visual dashboard with charts

### HCP02: Rural Diagnostic Accessibility & Telehealth
- Remote health monitoring simulation
- Video consultation booking
- Rural hospital/clinic locator
- IoT health data simulation (heart rate, BP, SpO2)
- Mobile-first responsive design

### HCP03: Hospital Bed & Emergency Resource Optimization
- Real-time bed availability tracking (SSE)
- Emergency services (1-tap SOS)
- Hospital comparison with filters
- Ambulance booking with tracking
- Wait time predictions

### HCP04: Pharmaceutical Supply Chain Transparency
- Medicine verification (QR/batch code)
- Blockchain-based supply chain logging
- Pharmacy locator
- Price comparison
- Fake medicine reporting

### HCP05: Clinical Research Data Grounding
- AI-powered symptom analysis
- Clinical document parsing
- Evidence-based recommendations
- Medical literature search
- Case study database

## Performance Requirements (100k Users)
- Code splitting per route
- Lazy loading 3D components
- Image optimization with AVIF/WebP
- API caching with stale-while-revalidate
- Database connection pooling
- CDN for static assets
- Edge caching for API routes

## UI/UX Requirements
- Futuristic 3D landing page (Three.js)
- Dark mode by default
- Glassmorphism effects
- Framer Motion animations
- Responsive (mobile-first)
- PWA support
- Accessibility (WCAG 2.1 AA)

## Folder Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/              # API routes
│   │   ├── health-risk/  # HCP01: Risk prediction
│   │   ├── telehealth/   # HCP02: Remote monitoring
│   │   ├── beds/        # HCP03: Bed tracking
│   │   ├── medicine/    # HCP04: Supply chain
│   │   ├── clinical/    # HCP05: AI analysis
│   │   └── realtime/    # SSE endpoint
│   ├── dashboard/       # User dashboard
│   ├── hospitals/       # Hospital finder
│   ├── emergency/       # SOS & emergency
│   ├── risk-assessment/ # HCP01
│   ├── telehealth/     # HCP02
│   ├── medicines/      # HCP04
│   └── clinical-ai/    # HCP05
├── components/
│   ├── 3d/            # Three.js components
│   ├── dashboard/     # Dashboard widgets
│   └── ui/             # Reusable UI
├── hooks/
│   ├── useRealtime.ts  # SSE hook
│   └── useIoT.ts      # IoT simulation
├── store/              # Zustand stores
├── lib/               # Utilities
└── data/              # Mock data
```

## API Endpoints Needed

### HCP01: Risk Prediction
- `POST /api/health-risk` - Calculate disease risk
- `GET /api/health-risk/history` - User risk history

### HCP02: Telehealth  
- `GET /api/telehealth/consultations` - Available consultations
- `POST /api/telehealth/book` - Book consultation
- `GET /api/telehealth/rural-hospitals` - Rural facilities

### HCP03: Bed Tracking
- `GET /api/beds/availability` - Real-time beds (cached)
- `GET /api/ambulance/track` - Ambulance tracking
- `POST /api/emergency/sos` - SOS alert

### HCP04: Medicine Verification
- `POST /api/medicine/verify` - Verify medicine
- `GET /api/pharmacies/nearby` - Pharmacy finder
- `POST /api/supply-chain/log` - Log supply chain

### HCP05: Clinical AI
- `POST /api/clinical/analyze` - AI analysis
- `GET /api/clinical/evidence` - Evidence search

### Real-time
- `GET /api/realtime` - SSE for live updates

## Key Components to Build
1. Landing page with 3D DNA/helix animation
2. Risk assessment form with AI analysis
3. Real-time hospital map with markers
4. Emergency SOS button (1-tap)
5. Medicine scanner
6. Clinical AI chat interface
7. Dashboard with health metrics
8. IoT health monitor

## Setup Steps
1. Install dependencies
2. Configure Prisma schema
3. Create API routes
4. Build components
5. Add 3D animations
6. Optimize for performance
7. Test with load

## Run Commands
```bash
npm install
npx prisma db push
npm run dev
```

## Deliverables
- [ ] All 5 healthcare challenges implemented
- [ ] Real-time bed tracking
- [ ] AI-powered risk prediction
- [ ] Medicine verification
- [ ] Clinical AI assistant
- [ ] 3D animations
- [ ] Mobile responsive
- [ ] PWA support
- [ ] Production optimized