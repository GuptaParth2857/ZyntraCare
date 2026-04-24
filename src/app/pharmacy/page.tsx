'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiUpload, FiCheck, FiArrowRight, FiShield, FiCamera, FiFileText, FiMapPin, FiNavigation, FiArrowLeft } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import DirectionsModal from '@/components/DirectionsModal';

const LiveHealthMap = dynamic(() => import('@/components/LiveHealthMap'), { ssr: false });

interface Medicine {
  id: string;
  name: string;
  company: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  requiresPrescription: boolean;
  image: string;
}

interface CartItem extends Medicine {
  quantity: number;
}

const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Crosin 500mg', company: 'Cipml', price: 15, originalPrice: 20, discount: 25, rating: 4.5, reviews: 2340, inStock: true, category: 'Pain Relief', requiresPrescription: false, image: '💊' },
  { id: '2', name: 'Azithromycin 250mg', company: 'Cipla', price: 85, originalPrice: 120, discount: 29, rating: 4.3, reviews: 890, inStock: true, category: 'Antibiotic', requiresPrescription: true, image: '💊' },
  { id: '3', name: 'Metformin 500mg', company: 'USV', price: 45, originalPrice: 60, discount: 25, rating: 4.7, reviews: 1560, inStock: true, category: 'Diabetes', requiresPrescription: true, image: '💊' },
  { id: '4', name: 'Augmentin 625mg', company: 'GSK', price: 210, originalPrice: 280, discount: 25, rating: 4.6, reviews: 720, inStock: true, category: 'Antibiotic', requiresPrescription: true, image: '💊' },
  { id: '5', name: 'Corex DX Syrup', company: 'Corexx', price: 95, originalPrice: 110, discount: 14, rating: 4.2, reviews: 450, inStock: true, category: 'Cough', requiresPrescription: false, image: '🧴' },
  { id: '6', name: 'Combiflam', company: 'GSK', price: 35, originalPrice: 45, discount: 22, rating: 4.4, reviews: 1890, inStock: true, category: 'Pain Relief', requiresPrescription: false, image: '💊' },
  { id: '7', name: 'Cetirizine 10mg', company: 'UCB', price: 25, originalPrice: 35, discount: 29, rating: 4.5, reviews: 3200, inStock: true, category: 'Allergy', requiresPrescription: false, image: '💊' },
  { id: '8', name: 'Cremafin', company: 'GSK', price: 55, originalPrice: 70, discount: 21, rating: 4.3, reviews: 980, inStock: true, category: 'Digestion', requiresPrescription: false, image: '💊' },
  { id: '9', name: 'Omee 20mg', company: 'Mankind', price: 65, originalPrice: 85, discount: 24, rating: 4.6, reviews: 1450, inStock: true, category: 'Acidity', requiresPrescription: false, image: '💊' },
  { id: '10', name: 'Montair FX', company: 'Mankind', price: 120, originalPrice: 150, discount: 20, rating: 4.4, reviews: 670, inStock: true, category: 'Allergy', requiresPrescription: true, image: '💊' },
  { id: '11', name: 'Glucometer Kit', company: 'Accu-Chek', price: 450, originalPrice: 599, discount: 25, rating: 4.7, reviews: 2340, inStock: true, category: 'Diabetic', requiresPrescription: false, image: '📱' },
  { id: '12', name: 'D-Rise 60K', company: 'Zydus', price: 95, originalPrice: 120, discount: 21, rating: 4.8, reviews: 4500, inStock: true, category: 'Vitamins', requiresPrescription: false, image: '💊' },
];

const CATEGORIES = ['All', 'Pain Relief', 'Antibiotic', 'Diabetes', 'Cough', 'Allergy', 'Digestion', 'Acidity', 'Vitamins', 'Diabetic'];

export default function PharmacyPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '', payment: 'cod' });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'detected' | 'error'>('loading');
  const [showMap, setShowMap] = useState(false);

  const filtered = MOCK_MEDICINES.filter(m => {
    const matchesSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || m.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item => item.id === medicine.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, {...medicine, quantity: 1}];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => item.id === id ? {...item, quantity: Math.max(0, item.quantity + delta)} : item).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const needsPrescription = cart.some(item => item.requiresPrescription);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('detected');
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
          setLocationStatus('error');
        }
      );
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPrescriptionImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const placeOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      setShowCheckout(false);
      setShowCart(false);
      setCart([]);
      setCheckoutStep(1);
    }, 4000);
  };

  return (
    <div className="min-h-screen text-white relative" style={{ background: 'linear-gradient(135deg, #020614 0%, #030a1e 50%, #020612 100%)' }}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white">
          <FiArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </Link>
      </div>

      {/* Location Status */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          {locationStatus === 'loading' ? (
            <>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs text-amber-400">Detecting...</span>
            </>
          ) : locationStatus === 'detected' ? (
            <>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-400">Location on</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <span className="text-xs text-slate-400">Default</span>
            </>
          )}
        </div>
        <button 
          onClick={() => setShowMap(!showMap)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <FiMapPin size={18} />
        </button>
      </div>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-3xl p-4 w-full max-w-2xl h-[500px] overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Nearby Pharmacies</h3>
                <button onClick={() => setShowMap(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="h-[420px] rounded-2xl overflow-hidden">
                <LiveHealthMap />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 pt-24 pb-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <span className="text-white text-2xl">💊</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Zyntra<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Pharmacy</span></h1>
              <p className="text-xs text-slate-400">Fast delivery • Genuine medicines</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            <FiShoppingCart className="text-white text-xl" />
            {cartItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-10 px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="relative z-10 px-4 pb-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((medicine, index) => (
            <motion.div
              key={medicine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4 hover:border-teal-500/30 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all"
            >
              <div className="text-4xl mb-3">{medicine.image}</div>
              {medicine.requiresPrescription && (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  Rx Required
                </span>
              )}
              <h3 className="font-bold text-white mt-2">{medicine.name}</h3>
              <p className="text-xs text-slate-400">{medicine.company}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-amber-500">★</span>
                <span className="text-sm font-medium text-white">{medicine.rating}</span>
                <span className="text-xs text-slate-500">({medicine.reviews})</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <span className="font-black text-lg text-white">₹{medicine.price}</span>
                  <span className="text-xs text-slate-500 line-through ml-1">₹{medicine.originalPrice}</span>
                </div>
                <span className="text-xs text-emerald-400 font-medium">{medicine.discount}% off</span>
              </div>
              <button
                onClick={() => addToCart(medicine)}
                disabled={!medicine.inStock}
                className="w-full mt-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg font-medium text-sm disabled:opacity-50 hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"
              >
                {medicine.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-bold text-lg">Cart ({cartItems})</h2>
                  <button onClick={() => setShowCart(false)} className="p-2">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl">🛒</span>
                      <p className="text-slate-500 mt-4">Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                        <span className="text-3xl">{item.image}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{item.name}</h4>
                          <p className="text-xs text-slate-500">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded-lg border">-</button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded-lg border">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 border-t border-slate-200 space-y-4">
                    {needsPrescription && (
                      <button
                        onClick={() => { setShowPrescription(true); setShowCart(false); }}
                        className="w-full p-3 bg-amber-100 text-amber-700 rounded-xl font-medium flex items-center justify-center gap-2"
                      >
                        <FiFileText /> Upload Prescription
                      </button>
                    )}
                    <div className="flex items-center justify-between text-lg">
                      <span className="font-medium">Total</span>
                      <span className="font-black">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={() => { setShowCart(false); setShowCheckout(true); }}
                      className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold"
                    >
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prescription Upload */}
      <AnimatePresence>
        {showPrescription && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCamera /> Upload Prescription
              </h3>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                {prescriptionImage ? (
                  <img src={prescriptionImage} alt="Prescription" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <>
                    <FiUpload className="text-4xl text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">Tap to upload prescription image</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Required for prescribed medicines</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowPrescription(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-medium">Cancel</button>
                <button
                  onClick={() => { setShowPrescription(false); setShowCart(true); }}
                  disabled={!prescriptionImage}
                  className="flex-1 py-3 bg-teal-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {orderPlaced ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-emerald-500 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold">Order Placed!</h3>
                  <p className="text-slate-500 mt-2">Order #ZD{Date.now()}</p>
                  <p className="text-sm text-slate-400 mt-1">Estimated delivery: 2-4 hours</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map(step => (
                      <div key={step} className="flex-1 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          checkoutStep >= step ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {step}
                        </div>
                        {step < 3 && <div className={`flex-1 h-1 rounded ${checkoutStep > step ? 'bg-teal-500' : 'bg-slate-100'}`} />}
                      </div>
                    ))}
                  </div>

                  {checkoutStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">Delivery Address</h3>
                      <input
                        placeholder="Full Name"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl"
                      />
                      <input
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={(e) => setForm({...form, phone: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl"
                      />
                      <textarea
                        placeholder="Delivery Address"
                        value={form.address}
                        onChange={(e) => setForm({...form, address: e.target.value})}
                        className="w-full p-3 border border-slate-200 rounded-xl h-24"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => setForm({...form, city: e.target.value})}
                          className="w-full p-3 border border-slate-200 rounded-xl"
                        />
                        <input
                          placeholder="Pincode"
                          value={form.pincode}
                          onChange={(e) => setForm({...form, pincode: e.target.value})}
                          className="w-full p-3 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        Continue <FiArrowRight />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">Payment Method</h3>
                      <div className="space-y-2">
                        {['Cash on Delivery', 'UPI', 'Card', 'Wallets'].map(method => (
                          <button
                            key={method}
                            onClick={() => setForm({...form, payment: method.toLowerCase().replace(' ', '_')})}
                            className={`w-full p-4 border rounded-xl text-left font-medium ${
                              form.payment === method.toLowerCase().replace(' ', '_')
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-slate-200'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCheckoutStep(3)}
                        className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        Continue <FiArrowRight />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg">Order Summary</h3>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                        {cart.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold"
                      >
                        Place Order • ₹{cartTotal}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}