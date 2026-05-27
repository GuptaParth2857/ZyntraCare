import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  try {
    const plans = await prisma.insurancePlan.findMany({ where: { isActive: true } });
    
    let policies: any[] = [];
    if (token) {
      policies = await prisma.insurancePolicy.findMany({
        where: { userId: token.id as string },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return NextResponse.json({ success: true, plans, policies });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insurance data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    
    if (body.action === 'create-plan') {
      const plan = await prisma.insurancePlan.create({
        data: { name: body.name, provider: body.provider, type: body.type, coverage: body.coverage, premium: body.premium, period: body.period || 'monthly', description: body.description, eligibility: body.eligibility ? JSON.stringify(body.eligibility) : null },
      });
      return NextResponse.json({ success: true, plan });
    }
    
    if (body.action === 'purchase') {
      const plan = await prisma.insurancePlan.findUnique({ where: { id: body.planId } });
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const policy = await prisma.insurancePolicy.create({
        data: { userId: token.id as string, planId: body.planId, endDate, premiumPaid: plan.premium },
      });
      return NextResponse.json({ success: true, policy });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
