interface PaymentOptions {
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Record<string, string>;
  };
}

type RazorpayResponseHandler = (response: RazorpaySuccessResponse) => void;
type RazorpayErrorHandler = (response: RazorpayErrorResponse) => void;

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: RazorpayResponseHandler;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: Function): void;
}

interface RazorpayConstructor {
  new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export async function initRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export async function createOrder(options: {
  plan?: string;
  amount?: number;
  currency?: string;
  receipt: string;
}): Promise<{ orderId: string; amount: number; currency: string }> {
  const res = await fetch('/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: options.plan,
      amount: options.amount,
      currency: options.currency || 'INR',
      receipt: options.receipt,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  const data = await res.json();
  return { orderId: data.orderId, amount: data.amount, currency: data.currency };
}

export function processPayment(options: PaymentOptions): Promise<PaymentResult> {
  return new Promise((resolve) => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';

    // Demo mode: no key or SDK not loaded -> run a smooth built-in demo checkout
    // so live demos never break. No real money moves and it's clearly marked.
    if (!razorpayKey || typeof window === 'undefined' || !window.Razorpay) {
      runDemoCheckout(options, resolve);
      return;
    }

    const razorpayOptions: RazorpayOptions = {
      key: razorpayKey,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill,
      theme: options.theme,
      handler: (response: RazorpaySuccessResponse) => {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: 'Payment cancelled by user' });
        },
      },
    };

    const razorpay = new window.Razorpay(razorpayOptions);

    razorpay.on('payment.failed', (response: RazorpayErrorResponse) => {
      resolve({
        success: false,
        error: response.error.description || 'Payment failed',
      });
    });

    razorpay.open();
  });
}

function runDemoCheckout(
  options: PaymentOptions,
  resolve: (r: PaymentResult) => void,
) {
  if (typeof document === 'undefined') {
    // SSR safety net: auto-succeed so flows never hang.
    resolve({ success: true, paymentId: 'pay_demo_ssr', orderId: options.orderId, signature: 'demo' });
    return;
  }

  const overlay = document.createElement('div');
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '99999',
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', fontFamily: 'system-ui, sans-serif',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: '#0f172a', color: '#fff', borderRadius: '20px', padding: '2rem',
    maxWidth: '360px', width: '100%', textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  });

  card.innerHTML = `
    <div style="font-size:14px;color:#60a5fa;font-weight:700;margin-bottom:8px">🔒 DEMO CHECKOUT</div>
    <div style="font-size:20px;font-weight:800;margin-bottom:4px">${options.name}</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:16px">${options.description}</div>
    <div style="font-size:34px;font-weight:900;color:#34d399;margin-bottom:16px">₹${formatAmountINR(options.amount / 100)}</div>
    <div style="font-size:12px;color:#64748b;margin-bottom:20px">Demo mode — no real payment is made.<br/>In production this opens the Razorpay gateway.</div>
    <button data-role="pay" style="width:100%;padding:12px;border-radius:12px;border:0;background:#2563eb;color:#fff;font-size:15px;font-weight:700;cursor:pointer">Pay ${options.amount === 0 ? '' : `₹${formatAmountINR(options.amount / 100)}`} →</button>
    <button data-role="cancel" style="width:100%;padding:10px;border-radius:12px;border:0;background:transparent;color:#94a3b8;font-size:13px;margin-top:8px;cursor:pointer">Cancel</button>
  `;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const cleanup = () => {
    card.removeEventListener('click', onClick);
    document.body.removeChild(overlay);
  };

  function onClick(e: MouseEvent) {
    const btn = (e.target as HTMLElement).closest('[data-role]') as HTMLElement | null;
    if (!btn) return;
    if (btn.dataset.role === 'cancel') {
      cleanup();
      resolve({ success: false, error: 'Payment cancelled by user' });
      return;
    }
    // Simulate gateway processing
    (btn as HTMLButtonElement).disabled = true;
    btn.textContent = 'Processing...';
    setTimeout(() => {
      cleanup();
      resolve({
        success: true,
        paymentId: 'pay_demo_' + Date.now().toString(36),
        orderId: options.orderId,
        signature: 'demo_signature',
      });
    }, 1200);
  }

  card.addEventListener('click', onClick);
}

function formatAmountINR(amount: number): string {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  } catch {
    return String(amount);
  }
}

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      }),
    });
    const data = await res.json();
    return data.verified === true;
  } catch {
    return false;
  }
}

export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
