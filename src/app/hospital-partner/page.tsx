'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiArrowRight, FiShield, FiUsers, FiTrendingUp, FiMapPin, FiPhone, FiMail, FiClock, FiX, FiPlus } from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
  'Gynecology', 'Dermatology', 'Psychiatry', 'ENT', 'Ophthalmology',
  'Nephrology', 'Gastroenterology', 'Pulmonology', 'Urology', 'General Medicine',
  'Emergency Medicine', 'Radiology', 'Pathology', 'Surgery', 'Intensive Care',
];

const BENEFITS = [
  { icon: FiUsers, title: '50,000+ Patients/Month', desc: 'Massive patient inflow through our platform' },
  { icon: FiTrendingUp, title: 'AI Patient Matching', desc: 'Smart referrals based on specialties & location' },
  { icon: FiShield, title: 'Verified Badge', desc: 'Trust badge & priority listing on search' },
  { icon: FiClock, title: 'Real-time Dashboard', desc: 'Bed management, ambulance tracking & analytics' },
];

export default function HospitalPartnerPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
    website: '', workingHours: '24/7', emergency: true, doctors: 0,
  });

  const updateForm = (key: string, value: string | boolean | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const toggleSpecialty = (s: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          specialties: selectedSpecialties,
          beds: { total: 0, available: 0, icu: 0, icuAvailable: 0 },
        }),
      });
    } catch {}
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setSubmitted(true);
  };

  const isStepValid = () => {
    if (step === 1) return form.name && form.email && form.phone;
    if (step === 2) return form.address && form.city && form.state && form.pincode;
    if (step === 3) return selectedSpecialties.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-teal-500/30 overflow-x-hidden pt-24 pb-20 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(56,189,248,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.1) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
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
                  <div key={i} className="absolute inset-0 rounded-full border border-sky-500/50"
                    style={{ animation: `ripple 2s ease-out ${i * 0.4}s infinite` }} />
                ))}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                  <FiCheckCircle className="text-white" size={40} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="text-4xl font-bold mb-4">Partnership Request Submitted!</h2>
              <p className="text-gray-300 text-lg max-w-lg mx-auto mb-8">
                Our team will review your hospital profile within 24-48 hours. You will receive login credentials for the hospital dashboard once approved.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl border border-white/10">
                <FiClock className="text-sky-400" />
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
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-sky-500/30"
                >
                  <MdLocalHospital size={36} className="text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Partner with <span className="text-sky-400">ZyntraCare</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  List your hospital on India's fastest-growing healthcare platform. Get real-time emergency requests, patient referrals, and management tools.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
                {BENEFITS.map((b, i) => (
                  <motion.div key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-sky-500/30 transition text-center"
                  >
                    <b.icon className="text-sky-400 mx-auto mb-2" size={24} />
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
                        step >= s ? 'bg-sky-500 text-white' : 'bg-white/10 text-gray-500'
                      }`}>{s}</div>
                      <span className={`hidden sm:inline text-sm ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                        {s === 1 ? 'Hospital Info' : s === 2 ? 'Address' : 'Specialties'}
                      </span>
                      {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-sky-500' : 'bg-white/10'}`} />}
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
                        <MdLocalHospital className="text-sky-400" /> Hospital Information
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Hospital Name *</label>
                          <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. City Medical Center" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Email *</label>
                          <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="hospital@example.com" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                          <input type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="+91 98765 43210" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Website</label>
                          <input type="url" value={form.website} onChange={e => updateForm('website', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="https://example.com" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Working Hours</label>
                          <select value={form.workingHours} onChange={e => updateForm('workingHours', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white">
                            {['24/7', '6:00 AM - 12:00 AM', '8:00 AM - 10:00 PM', '9:00 AM - 9:00 PM', '9:00 AM - 6:00 PM'].map(h => (
                              <option key={h} value={h} className="bg-gray-900">{h}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Number of Doctors</label>
                          <input type="number" value={form.doctors} onChange={e => updateForm('doctors', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.emergency}
                            onChange={e => updateForm('emergency', e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/5 text-sky-500 focus:ring-sky-500" />
                          <span className="text-sm text-gray-300">24/7 Emergency Services</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FiMapPin className="text-sky-400" /> Hospital Address
                      </h2>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Street Address *</label>
                        <input type="text" value={form.address} onChange={e => updateForm('address', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                          placeholder="Building, Street, Area" />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">City *</label>
                          <input type="text" value={form.city} onChange={e => updateForm('city', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. Mumbai" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">State *</label>
                          <input type="text" value={form.state} onChange={e => updateForm('state', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="e.g. Maharashtra" />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Pincode *</label>
                          <input type="text" value={form.pincode} onChange={e => updateForm('pincode', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-sky-500/50 transition text-white placeholder-gray-600"
                            placeholder="400001" />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <FiShield className="text-sky-400" /> Specialties & Services
                      </h2>
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 mb-4">
                        <p className="text-sky-300 text-sm">
                          Select all specialties your hospital offers. This helps us match patients accurately.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SPECIALTIES.map(s => (
                          <button key={s} onClick={() => toggleSpecialty(s)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                              selectedSpecialties.includes(s)
                                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                            }`}>{s}</button>
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm mt-2">{selectedSpecialties.length} specialty{selectedSpecialties.length !== 1 ? 'ies' : 'y'} selected</p>
                      <div className="pt-4">
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          <FiCheckCircle className="text-sky-400" />
                          By submitting, you agree to our Hospital Partner Terms & Conditions
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
                        className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-sky-500/30 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        Next <FiArrowRight />
                      </button>
                    ) : (
                      <button onClick={handleSubmit} disabled={loading || !isStepValid()}
                        className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-sky-500/30 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                        {loading ? 'Submitting...' : 'Submit Partnership'} <FiArrowRight />
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
