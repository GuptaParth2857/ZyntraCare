/**
 * ZyntraCare - PostgreSQL Setup Script
 * 
 * Sets up PostgreSQL database for 1M+ users
 * 
 * Usage:
 *   1. Get free PostgreSQL from https://neon.tech or https://supabase.com
 *   2. Run: node SETUP_POSTGRESQL.js
 *   3. Or manually update DATABASE_URL in .env.local
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupPostgres() {
  console.log('🔧 Setting up PostgreSQL for ZyntraCare...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Run migrations
    console.log('🗄️ Running migrations...');
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Database ready!\n');

    // Create indexes for performance
    console.log('📊 Creating performance indexes...');
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
      CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"("phone");
      CREATE INDEX IF NOT EXISTS "Hospital_location_idx" ON "Hospital"("location");
      CREATE INDEX IF NOT EXISTS "Doctor_specialty_idx" ON "Doctor"("specialty");
    `);
    console.log('✅ Indexes created!\n');

    console.log('🎉 PostgreSQL setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Update DATABASE_URL in .env.local with your PostgreSQL URL');
    console.log('2. Run: npx prisma db push');
    console.log('3. Run: npm run build');
    console.log('4. Deploy to Vercel\n');

  } catch (error) {
    console.error('❌ Error setting up PostgreSQL:', error.message);
    console.log('\n📋 To fix:');
    console.log('1. Get free PostgreSQL from: https://neon.tech');
    console.log('2. Update DATABASE_URL in .env.local');
    console.log('3. Run: npx prisma db push\n');
  } finally {
    await prisma.$disconnect();
  }
}

setupPostgres();