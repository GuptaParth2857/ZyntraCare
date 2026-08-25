'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiArrowRight, FiShield, FiDollarSign, FiUsers, FiTrendingUp, FiMapPin, FiPhone, FiMail, FiClock, FiImage } from 'react-icons/fi';
import { FaPrescriptionBottle, FaPills } from 'react-icons/fa';

const BENEFITS = [
  { icon: FiUsers, title: '5000+ Daily Customers', desc: 'Massive patient reach across cities' },
  { icon: FiDollarSign, title: 'Zero Commission', desc: 'Keep 100% of your earnings' },
  { icon: FiShield, title: 'Verified Badge', desc: 'Trust badge to attract more customers' },
  { icon: FiTrendingUp, title: 'AI Recommendations', desc: 'Smart medicine suggestions for patients' },
];

const WORKING_HOURS = [
  '9:00 AM - 9:00 PM', '8:00 AM - 10:00 PM', '10:00 AM - 8:00 PM',
  '24 Hours', '9:00 AM - 6:00 PM', 'Custom',
];

export default function PharmacyPartnerPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    license: '', workingHours: '9:00 AM - 9:00 PM',
    deliveryAvailable: true, open24Hours: false,
  });

  const updateForm = (key: string, value: string | boolean) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {}
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setSubmitted(true);
  };

  const isStepValid = () => {
    if (step === 1) return form.name && form.email && form.phone;
    if (step === 2) return form.address && form.city && form.state && form.pincode;
    if (step === 3) return form.license;
    return true;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-teal-500/30 overflow-x-hidden pt-24 pb-20 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14,165,233,0.1) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center py-20"
            >
              <div className="relative w-32 h-32 mx-auto mb-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border border-teal-500/50"
                    style={{ animation: `ripple 2s ease-out ${i * 0.4}s infinite` }} />
                ))}
                <div className="absolute inset-4 rounded-full bg-teal-500 flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={40} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4">Registration Submitted!</h2>
              <p className="text-gray-300 text-lg max-w-lg mx-auto mb-8">
                Our team will verify your pharmacy license within 24-48 hours. You will receive a confirmation email once approved.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <FiClock className="text-teal-400" />
                <span className="text-gray-300">Verification typically takes 24-48 hours</span>
              </div>
              <style>{`
                @keyframes ripple {
                  from { transform: scale(1); opacity: 0.5; }
                  to { transform: scale(2.5); opacity: 0; }
                }
              `}</style>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <FaPrescriptionBottle size={36} className="text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Partner with <span className="text-teal-400">ZyntraCare</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  List your pharmacy on India's fastest-growing healthcare platform and reach thousands of patients daily.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
                {BENEFITS.map((b, i) => (
                  <motion.div key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/30 transition text-center"
                  >
                    <b.icon className="text-teal-400 mx-auto mb-2" size={24} />
                    <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                    <p className="text-gray-500 text-xs">{b.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-10">
                  {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        step >= s ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-500'
                      }`}>{s}</div>
                      <span className={`hidden sm:inline text-sm ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                        {s === 1 ? 'Pharmacy Info' : s === 2 ? 'Address' : 'License'}
                      </span>
                      {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-teal-500' : 'bg-white/10'}`} />}
                    </div>
                  ))}
                </div>

                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-white/[0.03] border border-white/10 rounded-3xl p-8"
                >
                  {step === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FaPills className="text-teal-400" /> Pharmacy Information
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Pharmacy Name *</label>
                          <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. City Medicos" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Email *</label>
                          <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="pharmacy@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                          <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="+91 98765 43210" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Working Hours</label>
                          <select value={form.workingHours} onChange={e => updateForm('workingHours', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white">
                            {WORKING_HOURS.map(h => <option key={h} value={h} className="bg-gray-900">{h}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FiMapPin className="text-teal-400" /> Pharmacy Address
                      </h2>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
                        <input type="text" value={form.address} onChange={e => updateForm('address', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                          placeholder="Shop no., Building, Street" />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">City *</label>
                          <input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">State *</label>
                          <input type="text" value={form.state} onChange={e => updateForm('state', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. Maharashtra" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Pincode *</label>
                          <input type="text" value={form.pincode} onChange={e => updateForm('pincode', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600"
                            placeholder="400001" />
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pt-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.deliveryAvailable}
                            onChange={e => updateForm('deliveryAvailable', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500" />
                          <span className="text-sm text-gray-300">Delivery Available</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.open24Hours}
                            onChange={e => updateForm('open24Hours', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500" />
                          <span className="text-sm text-gray-300">Open 24 Hours</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FiShield className="text-teal-400" /> License Verification
                      </h2>
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                        <p className="text-amber-300 text-sm">
                          Your drug license will be verified before approval. Keep a copy ready.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Drug License Number *</label>
                        <input type="text" value={form.license} onChange={e => updateForm('license', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-teal-500/50 transition text-white placeholder-gray-600 font-mono"
                          placeholder="e.g. DL-2024-XXXXX" />
                      </div>
                      <div className="pt-4">
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <FiCheckCircle className="text-teal-400" />
                          By submitting, you agree to our Partner Terms & Conditions
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                    {step > 1 ? (
                      <button onClick={() => setStep(s => s - 1)}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition text-gray-300">
                        Back
                      </button>
                    ) : <div />}
                    {step < 3 ? (
                      <button onClick={() => setStep(s => s + 1)} disabled={!isStepValid()}
                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        Next <FiArrowRight />
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={loading || !isStepValid()}
                        className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading ? 'Submitting...' : 'Submit Registration'} <FiArrowRight />
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
