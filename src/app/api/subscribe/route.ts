import { NextResponse } from 'next/server';

const subscriptions = new Map<string, { plan: string; status: string; startDate: Date; endDate: Date; autoRenew: boolean }>();

export async function GET() {
  return NextResponse.json({ 
    message: 'Subscription API - Use POST to manage subscription',
    plans: ['Free', 'Premium Monthly', 'Premium Yearly'],
    actions: ['subscribe', 'upgrade', 'downgrade', 'cancel', 'reactivate']
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, plan, userId } = body;
    
    const userKey = userId || 'demo_user';
    const currentSub = subscriptions.get(userKey);
    
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
        
        subscriptions.set(userKey, {
          plan,
          status: 'active',
          startDate,
          endDate,
          autoRenew: plan !== 'Free',
        });
        
        return NextResponse.json({
          success: true,
          action: action === 'upgrade' ? 'upgraded' : 'subscribed',
          plan,
          status: 'active',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          message: action === 'upgrade' ? `Successfully upgraded to ${plan}` : `Successfully subscribed to ${plan}`
        });
      }
      
      case 'downgrade': {
        if (!currentSub) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100);
        
        subscriptions.set(userKey, {
          plan: 'Free',
          status: 'active',
          startDate,
          endDate,
          autoRenew: false,
        });
        
        return NextResponse.json({
          success: true,
          action: 'downgraded',
          plan: 'Free',
          status: 'active',
          message: 'Successfully downgraded to Free plan'
        });
      }
      
      case 'cancel': {
        if (!currentSub) {
          return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
        }
        
        subscriptions.set(userKey, {
          ...currentSub,
          status: 'cancelled',
          autoRenew: false,
        });
        
        return NextResponse.json({
          success: true,
          action: 'cancelled',
          status: 'cancelled',
          currentPlan: currentSub.plan,
          message: 'Subscription cancelled. You will have access until the end of your billing period.',
          endDate: currentSub.endDate.toISOString()
        });
      }
      
      case 'reactivate': {
        if (!currentSub || currentSub.status !== 'cancelled') {
          return NextResponse.json({ error: 'No cancelled subscription to reactivate' }, { status: 400 });
        }
        
        subscriptions.set(userKey, {
          ...currentSub,
          status: 'active',
          autoRenew: true,
        });
        
        return NextResponse.json({
          success: true,
          action: 'reactivated',
          status: 'active',
          message: 'Subscription reactivated successfully'
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