# 🚑 ZyntraCare - Healthcare Platform

A production-ready healthcare platform built with Next.js 16, featuring hospitals, doctors, emergency services, and AI-powered features.

## 🚀 Vercel Deployment Guide

### Quick Deploy (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - ZyntraCare Healthcare Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/healthcare-platform.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build` (already configured)
   - Output Directory: `.next` (already configured)

3. **Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=any-random-secret-min-32-chars
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_SECRET
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Database (for production)
# DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build

### Manual Deploy

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build
npm run build

# Deploy .next folder to Vercel
# Use Vercel CLI: vercel --prod
```

## ✅ Features

- 🏥 Hospital & Doctor Search
- 📅 Appointment Booking
- 🚨 Emergency Services (112, 102, 108)
- 🔐 Auth (Google OAuth, Phone OTP, Email/Password)
- 💳 Subscription System
- 📱 PWA Support
- 🌍 Multi-language (English, Hindi, Bengali, Tamil)
- 🔔 Notifications
- 📧 Email Integration
- 🗄️ Database (SQLite local, PostgreSQL production)

## 📁 Project Structure

```
healthcare-platform/
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities (prisma, email, supabase)
│   ├── context/      # React Context (Language, Auth)
│   ├── hooks/        # Custom hooks
│   └── data/         # Mock data
├── prisma/           # Database schema
├── public/           # Static assets
└── .next/            # Build output
```

## 🔧 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion, Three.js
- **Database**: Prisma (SQLite → PostgreSQL)
- **Auth**: NextAuth.js
- **Maps**: Leaflet
- **AI**: Google Gemini

## 📝 Note

- For production, configure PostgreSQL (Neon/Supabase)
- Update email credentials in environment variables
- Replace Google OAuth secret with your own

## Build Status

✅ 37 routes generated
✅ TypeScript: Passed
✅ Build: Successful

---

Built with ❤️ using Next.js + Tailwind CSS