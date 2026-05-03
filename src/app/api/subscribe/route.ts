import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

async function requireAuth(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return token;
}

export async function GET(req: NextRequest) {
  const token = await requireAuth(req);
  if (token instanceof NextResponse) return token;

  return NextResponse.json({ 
    message: 'Subscription API',
    plans: ['Free', 'Premium Monthly', 'Premium Yearly'],
    actions: ['subscribe', 'upgrade', 'downgrade', 'cancel', 'reactivate']
  });
}

export async function POST(req: NextRequest) {
  const token = await requireAuth(req);
  if (token instanceof NextResponse) return token;

  try {
    const body = await req.json();
    const { action, plan } = body;
    const userId = token.id as string;

    switch (action) {
      case 'subscribe':
      case 'upgrade': {
        const allowedPlans = ['Free', 'Premium Monthly', 'Premium Yearly'];
        if (!allowedPlans.includes(plan)) {
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }
        
        const startDate = new Date();
        const endDate = new Date();
        
        if (plan === 'Free') {
          endDate.setFullYear(endDate.getFullYear() + 100);
        } else if (plan === 'Premium Monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan === 'Premium Yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        }
        
        const subscription = await prisma.subscription.upsert({
          where: { userId },
          update: { plan, status: 'active', startDate, endDate },
          create: { userId, plan, status: 'active', startDate, endDate }
        });
        
        return NextResponse.json({
          success: true,
          action: action === 'upgrade' ? 'upgraded' : 'subscribed',
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate.toISOString(),
          endDate: subscription.endDate?.toISOString(),
          message: action === 'upgrade' ? `Upgraded to ${plan}` : `Subscribed to ${plan}`
        });
      }
      
      case 'downgrade': {
        const currentSub = await prisma.subscription.findUnique({ where: { userId } });
        if (!currentSub) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }
        
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100);
        
        const subscription = await prisma.subscription.update({
          where: { userId },
          data: { plan: 'Free', status: 'active', endDate }
        });
        
        return NextResponse.json({
          success: true,
          action: 'downgraded',
          plan: 'Free',
          status: 'active',
          message: 'Downgraded to Free plan'
        });
      }
      
      case 'cancel': {
        const currentSub = await prisma.subscription.findUnique({ where: { userId } });
        if (!currentSub) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }
        
        const subscription = await prisma.subscription.update({
          where: { userId },
          data: { status: 'cancelled' }
        });
        
        return NextResponse.json({
          success: true,
          action: 'cancelled',
          status: 'cancelled',
          currentPlan: currentSub.plan,
          message: 'Subscription cancelled'
        });
      }
      
      case 'reactivate': {
        const currentSub = await prisma.subscription.findUnique({ where: { userId } });
        if (!currentSub || currentSub.status !== 'cancelled') {
          return NextResponse.json({ error: 'No cancelled subscription to reactivate' }, { status: 400 });
        }
        
        const subscription = await prisma.subscription.update({
          where: { userId },
          data: { status: 'active' }
        });
        
        return NextResponse.json({
          success: true,
          action: 'reactivated',
          status: 'active',
          message: 'Subscription reactivated'
        });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}