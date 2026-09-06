import { NextRequest, NextResponse } from 'next/server';
import { PLAN_BY_NAME } from '@/lib/plans';
import { demoOrders } from '@/lib/razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1/orders';

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, amount, currency, receipt } = body;

    const configuredPlan = typeof plan === 'string' ? PLAN_BY_NAME[plan] : undefined;
    if (body.plan && !configuredPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const orderAmount = configuredPlan ? configuredPlan.price : amount;
    const orderCurrency = (currency || 'INR').toUpperCase();

    if (typeof orderAmount !== 'number' || orderAmount <= 0 || !receipt) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, receipt' },
        { status: 400 }
      );
    }

    // Demo mode: when Razorpay keys aren't configured, return a synthetic order
    // so the live checkout flow never breaks. Flagged clearly as demo.
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      const demoId = 'order_demo_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      demoOrders.add(demoId);
      return NextResponse.json({
        orderId: demoId,
        amount: Math.round(orderAmount * 100),
        currency: orderCurrency,
        receipt,
        status: 'created',
        demo: true,
      });
    }

    const orderPayload = {
      amount: Math.round(orderAmount * 100),
      currency: orderCurrency,
      receipt,
      payment_capture: 1,
    };

    const res = await fetch(RAZORPAY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.description || 'Failed to create Razorpay order' },
        { status: res.status }
      );
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
      demo: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}