@echo off
echo ========================================
echo ZyntraCare - PostgreSQL Setup
echo ========================================
echo.
echo This script helps you connect to PostgreSQL (Neon/Supabase)
echo.

echo Step 1: Choose your provider
echo   1. Neon (neon.tech) - Free tier available
echo   2. Supabase (supabase.com) - Free tier available
echo.

echo Step 2: Get your connection string
echo   - Neon: Go to https://neon.tech, create project, copy connection string
echo   - Supabase: Go to https://supabase.com, create project, Settings > Database
echo.

echo Step 3: Update .env.production
echo   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
echo.

echo Current DATABASE_URL setting:
type .env.production | findstr "DATABASE_URL"
echo.

echo To switch from SQLite to PostgreSQL:
echo 1. Update DATABASE_URL in .env.production
echo 2. Run: npx prisma db push
echo 3. Run: npm run build
echo.

pause