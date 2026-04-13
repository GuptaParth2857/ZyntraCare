'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { FiCheck, FiStar, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    features: [
      'Basic hospital search',
      'Limited doctor listings',
      'Community support',
    ],
    popular: false,
    color: 'from-gray-500 to-gray-600',
    border: 'border-white/10',
  },
  {
    name: 'Premium Monthly',
    price: '499',
    period: 'month',
    features: [
      'Unlimited doctor consultations',
      'Priority appointment booking',
      'Access to premium health records',
      '24/7 priority support',
      'Exclusive health tips',
    ],
    popular: true,
    color: 'from-blue-500 to-purple-600',
    border: 'border-blue-500/50',
  },
  {
    name: 'Premium Yearly',
    price: '4999',
    period: 'year',
    features: [
      'All monthly features',
      '2 months free',
      'Annual health checkup voucher',
      'Free medicine delivery',
    ],
    popular: false,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/50',
  },
];

export default function SubscriptionPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planName: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      });
      if (res.ok) {
        await update();
        alert('Subscription successful!');
      } else {
        const err = await res.json();
        alert(err.error || 'Subscription failed');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = session?.user?.subscription?.plan;

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
                  <span className="text-5xl font-black">₹{plan.price}</span>
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
                    onClick={() => handleSubscribe(plan.name)}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold transition uppercase tracking-wide shadow-lg ${
                      plan.name === 'Free'
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                        : `bg-gradient-to-r ${plan.color} text-white hover:shadow-${plan.color.split('-')[1]}-500/25`
                    }`}
                  >
                    {plan.name === 'Free' ? 'Downgrade' : 'Subscribe Now'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center text-gray-500 text-sm max-w-2xl mx-auto bg-slate-900/40 p-6 rounded-2xl backdrop-blur-md border border-white/5">
          <FiShield className="inline mr-2 mb-1" /> All plans are non-refundable. Premium features become available instantly after a successful transaction. Your data is protected by enterprise-grade encryption.
        </div>
      </div>
    </div>
  );
}