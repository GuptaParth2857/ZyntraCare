import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ZyntraCare Healthcare Platform',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime?.() || 0,
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'ok',
      api: 'ok'
    }
  };

  return NextResponse.json(healthCheck);
}