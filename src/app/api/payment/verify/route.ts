import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification fields' },
        { status: 400 }
      );
    }

    // Demo mode: no secret configured -> trust demo orders/payments.
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json({
        verified: true,
        demo: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    }

    const expectedSignature = createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      verified: true,
      demo: false,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
