'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiStar, FiShield, FiLoader, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: 0,
    priceDisplay: '0',
    period: 'forever',
    features: [
      'Basic hospital search',
      'Limited doctor listings',
      'Community support',
      'Basic symptom checking',
    ],
    popular: false,
    color: 'from-gray-500 to-gray-600',
    border: 'border-white/10',
  },
  {
    name: 'Premium Monthly',
    price: 499,
    priceDisplay: '499',
    period: 'month',
    features: [
      'Unlimited doctor consultations',
      'Priority appointment booking',
      'Access to premium health records',
      '24/7 priority support',
      'AI-powered health insights',
      'Medicine reminders',
      'Family member profiles',
    ],
    popular: true,
    color: 'from-blue-500 to-purple-600',
    border: 'border-blue-500/50',
  },
  {
    name: 'Premium Yearly',
    price: 4999,
    priceDisplay: '4,999',
    period: 'year',
    features: [
      'All monthly features',
      '2 months free',
      'Annual health checkup voucher',
      'Free medicine delivery',
      'Exclusive health tips',
      'Early access to new features',
    ],
    popular: false,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/50',
  },
];

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (status !== 'authenticated') {
      router.push('/auth/signin?callbackUrl=/subscription');
      return;
    }

    if (plan.price === 0) {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'downgrade' }),
        });
        if (res.ok) {
          setCurrentPlan('Free');
          setSuccess('Switched to Free plan successfully!');
        } else {
          const err = await res.json();
          setError(err.error || 'Failed to switch plan');
        }
      } catch {
        setError('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!razorpayLoaded) {
      setError('Payment system is loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          receipt: `sub_${plan.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to create payment order');
      }

      const order = await orderRes.json();

      const user = session?.user as any;

      const RazorpayClass = window.Razorpay as any;
      if (!RazorpayClass) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }
      const razorpay = new RazorpayClass({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'ZyntraCare',
        description: `${plan.name} Subscription`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            const subRes = await fetch('/api/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'subscribe',
                plan: plan.name,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }),
            });

            if (subRes.ok) {
              setCurrentPlan(plan.name);
              setSuccess(`Subscribed to ${plan.name} successfully!`);
            } else {
              throw new Error('Subscription activation failed');
            }
          } catch {
            setError('Payment received but subscription activation failed. Contact support.');
          }
          setLoading(false);
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: '',
        },
        theme: {
          color: '#0ea5e9',
          backdrop_color: 'rgba(0,0,0,0.6)',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      razorpay.on('payment.failed', (response: any) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });

      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.14, 0.28, 0.14], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 left-1/4 w-[720px] h-[720px] bg-indigo-600/18 rounded-full blur-[175px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.24, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 right-0 w-[520px] h-[520px] bg-pink-600/15 rounded-full blur-[135px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-6 border border-blue-500/30">
            <FiShield size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Premium Plan</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock premium features, priority bookings, and 24/7 support for better healthcare access.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {success && (
            <div className="md:col-span-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="md:col-span-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center">
              {error}
            </div>
          )}
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl transition border ${plan.border}`}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
              )}
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 text-center py-2 text-sm font-bold uppercase tracking-wider border-b border-white/5">
                  <FiStar className="inline mr-1 mb-1" /> Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {plan.name}
                </h3>
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black">₹{plan.priceDisplay}</span>
                  <span className="text-gray-400 font-medium">/{plan.period}</span>
                </div>
                
                <ul className="space-y-4 mb-8 min-h-[220px]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 bg-white/10 p-1 rounded-full border border-white/5">
                        <FiCheck className="text-blue-400 text-sm" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {currentPlan === plan.name ? (
                  <button
                    disabled
                    className="w-full bg-slate-800 text-gray-500 border border-white/10 py-4 rounded-xl font-bold cursor-not-allowed uppercase tracking-wide"
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold transition uppercase tracking-wide shadow-lg flex items-center justify-center gap-2 ${
                      plan.name === 'Free'
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                        : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                    }`}
                  >
                    {loading ? (
                      <><FiLoader className="animate-spin" size={18} /> Processing...</>
                    ) : plan.name === 'Free' ? (
                      'Downgrade'
                    ) : (
                      <>
                        Pay ₹{plan.priceDisplay}
                        <FiExternalLink size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm max-w-2xl mx-auto bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md border border-white/5">
          <FiShield className="inline mr-2 mb-1" /> Payments are processed securely via Razorpay. All plans are non-refundable. Premium features become available instantly after a successful transaction.
        </div>
      </div>
    </div>
  );
}
