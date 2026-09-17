'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiStar, FiX, FiLock, FiLoader, FiAlertCircle, FiGift, FiCheckCircle, FiTag, FiZap } from 'react-icons/fi';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface HealthProduct {
  id: string;
  title: string;
  description: string;
  coinsRequired: number;
  category: string;
  icon: string;
  brand: string;
  originalPrice: string;
  stock: number;
  bestSeller?: boolean;
}

interface HealthRedemption {
  id: string;
  title: string;
  icon: string;
  coinsSpent: number;
  code: string;
  date: string;
}

interface CartLine {
  item: HealthProduct;
  quantity: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🛍️' },
  { id: 'labs', label: 'Lab Vouchers', icon: '🧪' },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
  { id: 'telehealth', label: 'Telehealth', icon: '👨‍⚕️' },
  { id: 'fitness', label: 'Fitness', icon: '🏋️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'wearables', label: 'Wearables', icon: '⌚' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
];

export default function HealthCoinsMarketplacePage() {
  const { data: session, status } = useSession();
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const isAuthenticated = demoMode || status === 'authenticated';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';

  const [userCoins, setUserCoins] = useState(0);
  const [userLevel, setUserLevel] = useState<{ level: number; rank: string }>({ level: 1, rank: 'Bronze' });
  const [catalog, setCatalog] = useState<HealthProduct[]>([]);
  const [redemptions, setRedemptions] = useState<HealthRedemption[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/health-coins-marketplace${demoMode ? '?userId=demo-user' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load marketplace');
      setUserCoins(data.wallet?.balance || 0);
      setCatalog(data.items || []);
      setRedemptions(data.redemptions || []);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load the marketplace');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, demoMode]);

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const addToCart = (item: HealthProduct) => {
    if (item.stock <= 0) return;
    const inCart = cart.find(c => c.item.id === item.id)?.quantity || 0;
    if (inCart >= item.stock) { showToast(`${item.title} is out of stock`); return; }
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      return existing
        ? prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { item, quantity: 1 }];
    });
    showToast(`${item.title} added to cart`);
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id !== itemId) return c;
      const q = Math.max(0, c.quantity + delta);
      return q === 0 ? { ...c, quantity: 0 } : { ...c, quantity: q };
    }).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.coinsRequired * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const remaining = userCoins - cartTotal;
  const canCheckout = cart.length > 0 && cartTotal > 0 && remaining >= 995 && !busy;

  const checkout = async () => {
    if (!canCheckout) return;
    setBusy(true);
    try {
      const res = await fetch('/api/health-coins-marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          userId,
          cart: cart.map(c => ({ itemId: c.item.id, quantity: c.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      setUserCoins(data.balance ?? userCoins);
      setCart([]);
      setCartOpen(false);
      const codes = (data.redemptions || []).map((r: any) => r.code).join(', ');
      showToast(codes ? `Redeemed! Your ${(data.redemptions || []).length > 1 ? 'codes' : 'code'}: ${codes}` : 'Redeemed successfully!');
      await load();
    } catch (e: any) {
      setError(e.message || 'Could not complete your purchase');
    } finally {
      setBusy(false);
    }
  };

  const filtered = activeCategory === 'all' ? catalog : catalog.filter(i => i.category === activeCategory);

  const categoryMeta: Record<string, { avg: number; low: number; best: number }> = {};
  catalog.forEach(i => {
    const m = categoryMeta[i.category] || { avg: 0, low: Infinity, best: Infinity };
    m.avg += i.coinsRequired;
    m.low = Math.min(m.low, i.coinsRequired);
    m.best = Math.min(m.best, i.coinsRequired);
  });
  const catTips = Object.entries(categoryMeta).map(([cat, m]) => ({
    category: cat,
    cheapest: m.low === Infinity ? Math.round(m.avg / Math.max(1, catalog.filter(i => i.category === cat).length)) : m.low,
  }));

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-amber-400" size={32} />
          <p className="text-white/40 text-sm">Loading marketplace…</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 text-white">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-slate-900/80 border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl">
          <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
            <FiLock className="text-amber-400" size={24} />
          </div>
          <h2 className="text-2xl font-black mb-2">Your health coins are private</h2>
          <p className="text-white/50 text-sm mb-8">The marketplace is tied to your account and wallet balance. Sign in to browse and redeem.</p>
          <Link href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-black text-sm hover:from-amber-500 hover:to-orange-500 transition">
            Sign In
          </Link>
          <p className="text-white/20 text-xs mt-4">Preview: <span className="font-mono text-white/40">/health-coins-marketplace?demo=1</span></p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-inter pb-28 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 pt-24">

        {demoMode && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
            <FiZap size={16} className="flex-shrink-0" /> Demo mode — viewing marketplace with demo dataset.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
            <FiAlertCircle className="text-red-400 flex-shrink-0" />
            <p className="text-red-400/90 text-sm font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Dismiss</button>
          </div>
        )}

        {loading && catalog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-amber-400" size={28} />
            <p className="text-white/40 text-sm">Loading the Health Coins Marketplace…</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
                <FiGift size={32} className="text-amber-400" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                Health Coins <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Marketplace</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Spend your hard-earned health coins on lab tests, medicines, consultations, and wellness products.
              </p>
            </motion.div>

            {/* Balance + Level */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid md:grid-cols-3 gap-4 mb-10">
              <div className="md:col-span-2 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20 border border-amber-500/30 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px]" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Your Balance</p>
                    <p className="text-4xl font-black text-white flex items-center gap-2">
                      <FiStar className="text-amber-400" /> {userCoins.toLocaleString()}
                      <span className="text-lg text-amber-400/70">coins</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                      Level {userLevel.level} · {userLevel.rank}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Cart</p>
                    <button onClick={() => setCartOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-2xl font-bold transition">
                      <FiShoppingBag className="text-amber-400" /> {cartCount}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-8">
                <p className="text-gray-400 text-sm uppercase tracking-wider mb-1 font-bold">Budget tips</p>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  {catTips.length === 0 ? (
                    <li>Complete missions to start earning coins.</li>
                  ) : catTips.slice(0, 3).map(t => (
                    <li key={t.category}>Cheapest {t.category}: <span className="text-amber-400 font-bold">{t.cheapest.toLocaleString()} coins</span></li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 ? (
                <div className="md:col-span-3 text-center py-16 bg-slate-900/60 border border-white/10 rounded-[2rem]">
                  <p className="text-white/40 font-bold text-lg mb-1">No products here yet</p>
                  <p className="text-gray-500 text-sm">We're restocking this category — stay tuned.</p>
                </div>
              ) : filtered.map((item, idx) => {
                const out = item.stock <= 0;
                const inCart = cart.find(c => c.item.id === item.id)?.quantity || 0;
                const soldOut = out || inCart >= item.stock;
                const canAfford = userCoins >= item.coinsRequired;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 flex items-center gap-1"><FiTag size={10} /> {item.brand}</p>
                        <h3 className="font-bold text-white group-hover:text-amber-400 transition">{item.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3 min-h-[42px]">{item.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-amber-400 font-black flex items-center gap-1"><FiStar size={14} /> {item.coinsRequired} coins</p>
                      <p className="text-xs text-gray-500 line-through">{item.originalPrice}</p>
                    </div>
                    <p className={`text-[10px] font-bold mb-3 ${out ? 'text-red-400' : item.stock <= 44 ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {out ? 'Out of stock' : `${item.stock} left in stock`}
                    </p>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={soldOut}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                        soldOut
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                          : canAfford
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                            : 'bg-white/5 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {soldOut ? (out ? 'Out of stock' : 'In cart') : canAfford ? `Add ${inCart > 0 ? `(${inCart}) ` : ''}to cart` : `Need ${(item.coinsRequired - userCoins).toLocaleString()} more`}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Redemptions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-12 bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" /> Your Redemptions
              </h3>
              {redemptions.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl">
                  <FiGift className="text-gray-500/40 mx-auto mb-2" size={28} />
                  <p className="text-gray-500 text-sm">You haven't redeemed anything yet. Your codes will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.map(r => (
                    <div key={r.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl flex-wrap">
                      <span className="text-2xl">{r.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{r.title}</p>
                        <p className="text-xs text-gray-500">{r.date} · {r.coinsSpent} coins</p>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 font-mono text-xs font-bold">{r.code}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Cart drawer */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-white/10 p-6 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <FiShoppingBag className="text-amber-400" /> Your Cart
                </h2>
                <button onClick={() => setCartOpen(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition"><FiX size={18} /></button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🛒</div>
                  <p className="text-gray-500">Your cart is empty</p>
                  <button onClick={() => setCartOpen(false)} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-bold text-sm">
                    Browse
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-8">
                    {cart.map(entry => (
                      <div key={entry.item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <span className="text-2xl">{entry.item.icon}</span>
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{entry.item.title}</p>
                          <p className="text-xs text-amber-400">{entry.item.coinsRequired} coins each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(entry.item.id, -1)} className="w-7 h-7 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20">−</button>
                          <span className="font-bold text-sm">{entry.quantity}</span>
                          <button onClick={() => updateQty(entry.item.id, 1)} disabled={entry.quantity >= entry.item.stock} className="w-7 h-7 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 disabled:opacity-40">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-xl font-black text-amber-400 flex items-center gap-1"><FiStar size={14} /> {cartTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-6">
                    Balance after: <span className={`font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{remaining.toLocaleString()} coins</span>
                  </p>

                  <button
                    onClick={checkout}
                    disabled={!canCheckout}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black flex items-center justify-center gap-2 hover:from-amber-500 hover:to-orange-500 transition"
                  >
                    {busy ? <FiLoader className="animate-spin" /> : <><FiStar /> Redeem {busy ? '' : `(${cartTotal.toLocaleString()})`}</>}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[70] bg-amber-500/20 border border-amber-500/30 rounded-xl px-5 py-3 flex items-center gap-2 backdrop-blur-xl"
          >
            <FiCheckCircle className="text-amber-400" size={16} />
            <span className="text-amber-400 font-bold text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
