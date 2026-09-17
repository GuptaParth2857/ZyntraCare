'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiPlus, FiArrowUpRight, FiArrowDownLeft, FiShield, FiLoader, FiClock, FiTrendingUp, FiTrendingDown, FiLogIn } from 'react-icons/fi';
import { createOrder, processPayment } from '@/lib/payment';

interface Txn {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  amount: number;
  referenceId?: string | null;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  wallet_topup: 'bg-emerald-500/20 text-emerald-300',
  refund: 'bg-emerald-500/20 text-emerald-300',
  reward: 'bg-purple-500/20 text-purple-300',
  subscription: 'bg-cyan-500/20 text-cyan-300',
  appointment: 'bg-blue-500/20 text-blue-300',
  pharmacy: 'bg-amber-500/20 text-amber-300',
  labs: 'bg-pink-500/20 text-pink-300',
};

const quickPay = [
  { label: 'Hospitals', href: '/hospitals', icon: '🏥' },
  { label: 'Labs', href: '/labs', icon: '🔬' },
  { label: 'Pharmacy', href: '/pharmacy', icon: '💊' },
  { label: 'Doctors', href: '/doctors', icon: '👨‍⚕️' },
];

const presets = [500, 1000, 2000, 5000];

export default function HealthWalletPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchWallet = useCallback(async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/health-wallet`);
      if (!res.ok) throw new Error('Failed to fetch wallet data');
      const data = await res.json();
      setBalance(Number(data.wallet?.balance ?? 0));
      setTransactions((data.transactions || []).map((t: any) => ({
        id: t.id,
        type: t.type === 'debit' ? 'debit' : 'credit',
        category: t.category || 'general',
        description: t.description || t.category || 'Transaction',
        amount: Number(t.amount) || 0,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
      })));
    } catch (err) {
      setError('Failed to load wallet data');
      console.error(err);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    if (status !== 'loading') fetchWallet();
  }, [status, fetchWallet]);

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  const handlePay = async () => {
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees <= 0) {
      setPayError('Enter a valid amount');
      return;
    }
    setProcessing(true);
    setPayError('');
    try {
      const order = await createOrder({ amount: rupees, currency: 'INR', receipt: `wallet_${Date.now()}` });
      const result = await processPayment({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'ZyntraCare Health Wallet',
        description: `Add ₹${rupees.toLocaleString('en-IN')} to your wallet`,
        prefill: { name: session?.user?.name || '', email: session?.user?.email || '', contact: '' },
        theme: { color: '#0ea5e9' },
      });

      if (!result.success) {
        setPayError(result.error || 'Payment failed. Please try again.');
        return;
      }

      const postRes = await fetch('/api/health-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: rupees,
          type: 'credit',
          category: 'wallet_topup',
          description: 'Wallet top-up',
          referenceId: result.paymentId || null,
        }),
      });

      if (!postRes.ok) {
        const err = await postRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to credit wallet');
      }

      setShowAddMoney(false);
      setAmount('');
      setSuccessMsg(`₹${rupees.toLocaleString('en-IN')} added to your wallet`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchWallet();
    } catch (err: any) {
      setPayError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-teal-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
            <FiCreditCard size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Wallet</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A balance you can use for healthcare payments across ZyntraCare services.
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-10 text-center">
            <FiCreditCard className="mx-auto text-emerald-400 mb-4" size={48} />
            <p className="text-gray-300 mb-2 font-bold">Sign in to access your health wallet</p>
            <p className="text-gray-500 text-sm mb-6">Your wallet balance and transactions are private and shown only to you.</p>
            <Link href="/auth/signin?callbackUrl=/health-wallet" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold">
              <FiLogIn /> Sign In
            </Link>
          </motion.div>
        ) : (
          <>
        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
            <FiTrendingUp className="text-emerald-400" />
            <p className="text-emerald-300 font-medium text-sm">{successMsg}</p>
          </div>
        )}

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 border border-white/20 shadow-2xl shadow-emerald-500/20">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-2 text-emerald-100/90">
                  <FiShield className="text-emerald-50" />
                  <span className="text-sm font-bold tracking-wide">ZYNTRA WALLET</span>
                </div>
                <span className="text-[10px] bg-white/15 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Health</span>
              </div>
              <p className="text-emerald-100/80 text-sm mb-1">Available Balance</p>
              <p className="text-5xl font-black mb-6">{formatINR(balance)}</p>
              <div className="flex items-center justify-between text-emerald-100/80 text-xs">
                <span>Member since wallet creation</span>
                <span className="font-mono">{transactions.length} transactions</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowAddMoney(true)}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiPlus /> Add Money
            </button>
            <button
              onClick={() => document.getElementById('transactions')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FiClock /> Transactions
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total Top-ups', value: formatINR(totalCredits), icon: <FiTrendingUp className="text-emerald-400" /> },
            { label: 'Total Spent', value: formatINR(totalDebits), icon: <FiTrendingDown className="text-rose-400" /> },
            { label: 'Transactions', value: String(transactions.length), icon: <FiClock className="text-cyan-400" /> },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs text-gray-400">{s.label}</span></div>
              <p className="font-black text-lg">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mt-8">
          {/* Quick Pay */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-4">Quick Services</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickPay.map(item => (
                <Link key={item.href} href={item.href} className="group flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-2xl transition">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-2xl">{item.icon}</div>
                  <span className="text-xs font-medium group-hover:text-emerald-300">{item.label}</span>
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Wallet payments are accepted at checkout across these services.
            </p>
          </motion.div>

          {/* Transactions */}
          <motion.div id="transactions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="lg:col-span-3 bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiClock className="text-emerald-400" /> Recent Transactions
            </h3>
            {loading ? (
              <div className="py-12 text-center">
                <FiLoader className="animate-spin text-emerald-400 mx-auto mb-3" size={28} />
                <p className="text-gray-400 text-sm">Loading wallet...</p>
              </div>
            ) : error ? (
              <p className="text-sm text-rose-400 py-8 text-center">{error}</p>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center">
                <FiCreditCard size={40} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">No transactions yet</p>
                <p className="text-gray-500 text-xs mt-1">Add money to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => {
                  const isCredit = t.type === 'credit';
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-emerald-500/15' : 'bg-rose-500/15'}`}>
                          {isCredit ? <FiArrowDownLeft className="text-emerald-400" /> : <FiArrowUpRight className="text-rose-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{t.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500">{fmtDate(t.createdAt)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[t.category] || 'bg-white/10 text-gray-300'}`}>
                              {t.category.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`font-bold flex-shrink-0 ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCredit ? '+' : '-'}{formatINR(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
          </>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => !processing && setShowAddMoney(false)}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-[2rem] p-6 w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiPlus className="text-emerald-400" /> Add Money
            </h3>
            <input
              type="number"
              min={1}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setPayError(''); }}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-3xl font-bold text-center focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2 mt-4">
              {presets.map(a => (
                <button key={a} onClick={() => { setAmount(String(a)); setPayError(''); }}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${amount === String(a) ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                  ₹{a}
                </button>
              ))}
            </div>
            {payError && <p className="text-sm text-rose-400 mt-3">{payError}</p>}
            <button
              onClick={handlePay}
              disabled={processing || !amount}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? <><FiLoader className="animate-spin" /> Processing...</> : <>Pay ₹{amount || 0}</>}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-3">
              Secure checkout via ZyntraCare Pay — demo mode in development, Razorpay in production.
            </p>
            <button onClick={() => !processing && setShowAddMoney(false)} className="w-full mt-2 text-gray-400 hover:text-white text-sm py-1">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}