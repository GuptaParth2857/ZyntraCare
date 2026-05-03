#!/bin/bash

# ZyntraCare - Vercel Deployment Script
# Run this script to deploy to Vercel

echo "🚀 Deploying ZyntraCare to Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Build the app
echo "🔨 Building app..."
npm run build

# Deploy to Vercel (if CLI is installed)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️ Vercel CLI not found. Push to GitHub to trigger deployment."
fi

echo "✅ Deployment complete!"

# Environment variables to set in Vercel Dashboard:
echo ""
echo "📋 Required Environment Variables in Vercel:"
echo "============================================="
echo "1. NEXTAUTH_SECRET - Min 32 characters"
echo "2. ADMIN_SECRET - Your admin promotion secret"
echo "3. DATABASE_URL - PostgreSQL connection string"
echo "4. NEXT_PUBLIC_APP_URL - Your Vercel app URL"
echo "5. NEXTAUTH_URL - Your Vercel app URL"
echo ""
echo "Optional:"
echo "- GOOGLE_CLIENT_ID"
echo "- GOOGLE_CLIENT_SECRET"
echo "- GEMINI_API_KEY"
echo "============================================="