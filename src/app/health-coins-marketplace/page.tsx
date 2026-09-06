'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiStar, FiCheckCircle, FiX, FiTag, FiGift, FiZap, FiInfo } from 'react-icons/fi';
import Link from 'next/link';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  coinsRequired: number;
  category: string;
  image: string;
  brand: string;
  stock: number;
  originalPrice: string;
  bestSeller?: boolean;
}

interface CartItem {
  item: MarketplaceItem;
  quantity: number;
}

export default function HealthCoinsMarketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [userCoins, setUserCoins] = useState(1250);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setItems([
      { id: '1', title: '₹200 Lab Test Voucher', description: 'Redeem for any lab test at partner labs', coinsRequired: 500, category: 'labs', image: '🧪', brand: 'ZyntraLabs', stock: 100, originalPrice: '₹200' },
      { id: '2', title: '₹500 Pharmacy Discount', description: 'Flat ₹500 off on pharmacy orders above ₹1500', coinsRequired: 1200, category: 'pharmacy', image: '💊', brand: 'ZyntraPharmacy', stock: 50, originalPrice: '₹500', bestSeller: true },
      { id: '3', title: 'Free Doctor Consultation', description: 'Free teleconsultation with any specialist', coinsRequired: 1800, category: 'telehealth', image: '👨‍⚕️', brand: 'ZyntraTelehealth', stock: 30, originalPrice: '₹500' },
      { id: '4', title: 'Health Checkup Package', description: 'Full body checkup including 40+ parameters', coinsRequired: 2500, category: 'labs', image: '🩺', brand: 'ZyntraLabs', stock: 20, originalPrice: '₹999', bestSeller: true },
      { id: '5', title: 'Gym Membership 1 Month', description: 'Access to 500+ partner gyms across India', coinsRequired: 3000, category: 'fitness', image: '🏋️', brand: 'FitIndia', stock: 15, originalPrice: '₹1,500' },
      { id: '6', title: 'Smart Water Bottle', description: 'Stainless steel water bottle with hydration tracking', coinsRequired: 4500, category: 'wearables', image: '💧', brand: 'HydroTrack', stock: 10, originalPrice: '₹2,999' },
      { id: '7', title: 'Yoga Class Pack (10 classes)', description: '10 online yoga sessions with certified instructors', coinsRequired: 2000, category: 'fitness', image: '🧘', brand: 'ZenYoga', stock: 40, originalPrice: '₹1,200' },
      { id: '8', title: 'Nutrition Plan - 30 Days', description: 'Personalized diet plan from registered nutritionist', coinsRequired: 1500, category: 'nutrition', image: '🥗', brand: 'NutriCare', stock: 60, originalPrice: '₹999' },
      { id: '9', title: 'Fitness Smartwatch', description: 'Advanced fitness tracker with heart rate monitor', coinsRequired: 10000, category: 'wearables', image: '⌚', brand: 'FitInd', stock: 5, originalPrice: '₹4,999' },
      { id: '10', title: 'Health Insurance Discount', description: '₹500 off on first year premium of any health plan', coinsRequired: 800, category: 'insurance', image: '🛡️', brand: 'ZyntraInsurance', stock: 100, originalPrice: '₹500' },
    ]);
  }, []);

  const categories = [
    { id: 'all', label: 'All', icon: '🛍️' },
    { id: 'labs', label: 'Labs', icon: '🧪' },
    { id: 'pharmacy', label: 'Pharmacy', icon: '💊' },
    { id: 'telehealth', label: 'Telehealth', icon: '👨‍⚕️' },
    { id: 'fitness', label: 'Fitness', icon: '🏋️' },
    { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { id: 'wearables', label: 'Wearables', icon: '⌚' },
    { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  ];

  const filteredItems = items.filter(item =>
    activeCategory === 'all' || item.category === activeCategory
  );

  const addToCart = (item: MarketplaceItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
    setToast(`${item.title} added to cart`);
    setTimeout(() => setToast(''), 3000);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(c => c.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === itemId) {
        const qty = Math.max(0, c.quantity + delta);
        return qty === 0 ? { ...c, quantity: 0 } : { ...c, quantity: qty };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.coinsRequired * c.quantity, 0);

  const checkout = () => {
    if (cart.length === 0 || userCoins < cartTotal) return;
    setUserCoins(prev => prev - cartTotal);
    setCart([]);
    setShowCart(false);
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 4000);
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  const getCoinLevel = (coins: number) => {
    if (coins >= 5000) return { label: 'Gold', color: 'text-amber-400', icon: '🥇' };
    if (coins >= 1000) return { label: 'Silver', color: 'text-gray-400', icon: '🥈' };
    return { label: 'Bronze', color: 'text-amber-700', icon: '🥉' };
  };

  const coinLevel = getCoinLevel(userCoins);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <FiShoppingBag size={32} className="text-amber-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Health Coins <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Marketplace</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Spend your health coins on real products, services, and discounts.
          </p>
        </motion.div>

        {/* Coin Balance Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-amber-400 font-bold text-sm uppercase tracking-wider mb-1">Your Balance</p>
              <p className="text-4xl font-black text-white flex items-center gap-2">
                <FiStar className="text-amber-400" />
                {userCoins.toLocaleString()}
                <span className="text-lg font-bold text-amber-400/70">coins</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Earn coins by completing health challenges, daily tasks, and wellness activities
              </p>
            </div>
            <div className="text-center">
              <span className={`text-3xl ${coinLevel.color}`}>{coinLevel.icon}</span>
              <p className={`font-bold text-sm ${coinLevel.color}`}>{coinLevel.label} Member</p>
              <Link href="/health-challenges" className="text-xs text-amber-400 hover:text-amber-300 mt-1 block">
                Earn more coins →
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-40 bg-amber-500 text-slate-950 rounded-full py-4 px-6 font-bold shadow-xl shadow-amber-500/30 hover:bg-amber-400 transition flex items-center gap-2"
        >
          <FiShoppingBag size={20} />
          Cart ({totalItems})
        </button>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 hover:border-amber-500/30 transition group relative"
            >
              {item.bestSeller && (
                <span className="absolute top-4 right-4 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold">
                  ⭐ BEST SELLER
                </span>
              )}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center text-3xl">
                  {item.image}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white group-hover:text-amber-400 transition">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.brand}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-4 min-h-[40px]">{item.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-400 font-black text-lg">{item.coinsRequired} coins</p>
                  <p className="text-xs text-gray-500 line-through">{item.originalPrice}</p>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={userCoins < item.coinsRequired}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                    userCoins >= item.coinsRequired
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white'
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {userCoins >= item.coinsRequired ? 'Add to Cart' : `Need ${item.coinsRequired - userCoins} more`}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 bg-slate-900/80 border border-white/10 rounded-[2rem] p-6"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiInfo className="text-amber-400" /> How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl mb-2">💪</div>
              <h4 className="font-bold text-white text-sm mb-1">1. Earn Coins</h4>
              <p className="text-xs text-gray-400">Complete wellness missions, daily tasks, health challenges, and consistent check-ins to earn health coins.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl mb-2">🛒</div>
              <h4 className="font-bold text-white text-sm mb-1">2. Shop Products</h4>
              <p className="text-xs text-gray-400">Redeem your coins for lab test vouchers, pharmacy discounts, gym memberships, and more.</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl mb-2">🚀</div>
              <h4 className="font-bold text-white text-sm mb-1">3. Get Rewards</h4>
              <p className="text-xs text-gray-400">Receive your rewards via email or app notification. Use them at partner locations across India.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <FiShoppingBag className="text-amber-400" /> Your Cart
                </h2>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🛒</div>
                  <p className="text-gray-400">Your cart is empty</p>
                  <button onClick={() => setShowCart(false)} className="mt-4 px-6 py-3 bg-amber-500 text-slate-950 rounded-xl font-bold hover:bg-amber-400 transition">
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map(entry => (
                      <div key={entry.item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-2xl">
                          {entry.item.image}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{entry.item.title}</p>
                          <p className="text-xs text-amber-400">{entry.item.coinsRequired} coins each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(entry.item.id, -1)} className="w-7 h-7 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition">−</button>
                          <span className="font-bold text-sm">{entry.quantity}</span>
                          <button onClick={() => updateQuantity(entry.item.id, 1)} className="w-7 h-7 bg-white/10 rounded-lg text-gray-300 hover:bg-white/20 transition">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">Total</span>
                    <span className="text-xl font-black text-amber-400 flex items-center gap-1">
                      <FiStar size={16} /> {cartTotal} coins
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm mb-2">Balance remaining: <span className="font-bold text-emerald-400">{userCoins - cartTotal} coins</span></p>
                    {userCoins < cartTotal && (
                      <p className="text-xs text-red-400">Not enough coins! Earn more to complete this purchase.</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setShowCart(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">
                      Continue
                    </button>
                    <button
                      onClick={checkout}
                      disabled={userCoins < cartTotal}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl font-bold hover:from-amber-500 hover:to-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Redeem
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Confirmed Toast */}
      <AnimatePresence>
        {orderConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 flex items-center gap-3 backdrop-blur-xl"
          >
            <FiCheckCircle className="text-emerald-400" size={20} />
            <div>
              <p className="text-emerald-400 font-bold text-sm">Order Confirmed!</p>
              <p className="text-xs text-gray-400">Your rewards are being processed</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Cart Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-6 z-50 bg-amber-500/20 border border-amber-500/30 rounded-xl px-6 py-3 flex items-center gap-2 backdrop-blur-xl"
          >
            <FiTag className="text-amber-400" size={16} />
            <span className="text-amber-400 font-bold text-sm">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
