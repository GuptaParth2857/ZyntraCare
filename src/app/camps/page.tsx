'use client';

import { useState, useMemo } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiFilter, FiActivity, FiX, FiUser, FiPhone, FiMail, FiCheckCircle, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { camps, states } from '@/data/mockData';
import { Camp } from '@/types';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

// Register Modal
function RegisterModal({ camp, onClose }: { camp: Camp; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', city: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // Simulated API call
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <FiX size={22} />
        </button>

        {submitted ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Registered!</h3>
            <p className="text-gray-400 mb-2">You're successfully registered for</p>
            <p className="text-emerald-400 font-bold mb-4">{camp.name}</p>
            <p className="text-gray-500 text-sm">A confirmation will be sent to <span className="text-white">{form.email}</span></p>
            <button onClick={onClose} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition">
              Done
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-1">Register for Camp</h3>
              <p className="text-emerald-400 font-semibold text-sm">{camp.name}</p>
              <p className="text-gray-500 text-xs mt-1">{formatDate(camp.date)} • {camp.time} • {camp.city}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-1"><FiUser size={12}/> Full Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition" />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-1"><FiPhone size={12}/> Phone *</label>
                <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210" type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition" />
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-1"><FiMail size={12}/> Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com" type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Age</label>
                  <input value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="Age" type="number" min="1" max="120"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">City</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Your city"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition" />
                </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-xs font-bold text-emerald-400 mb-1">Services Covered:</p>
                <div className="flex flex-wrap gap-1">
                  {camp.services.map(s => (
                    <span key={s} className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading || !form.name || !form.phone}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (<><FiCheckCircle size={16} /> Confirm Registration</>)}
              </button>
              <p className="text-gray-600 text-xs text-center">Registration is {camp.registration === 'Free' ? 'completely free' : `₹${camp.registration.replace('₹','')}`}</p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// List Your Camp Modal
function ListCampModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    orgName: '', campName: '', date: '', time: '', city: '', state: '',
    location: '', services: '', hospital: '', contactEmail: '', contactPhone: '',
    registration: 'Free', description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-teal-500/20 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition"><FiX size={22} /></button>

        {submitted ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle size={40} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">Camp Submitted!</h3>
            <p className="text-gray-400 mb-2">Thank you for listing your health camp.</p>
            <p className="text-teal-400 text-sm">Our team will review and publish it within 24 hours.</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition">Done</button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                  <FiPlus className="text-teal-400" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">List Your Health Camp</h3>
                  <p className="text-gray-400 text-sm">Reach thousands of patients across India</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Organization Name *</label>
                  <input required value={form.orgName} onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))}
                    placeholder="Hospital / NGO / Trust name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Camp Name *</label>
                  <input required value={form.campName} onChange={e => setForm(f => ({ ...f, campName: e.target.value }))}
                    placeholder="e.g. Free Eye Camp 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Date *</label>
                  <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Time *</label>
                  <input required value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    placeholder="e.g. 9:00 AM - 4:00 PM"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">City *</label>
                  <input required value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="City"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">State *</label>
                  <select required value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500/50 transition">
                    <option value="">Select State</option>
                    {states.filter(s => s !== 'All India').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Venue / Location *</label>
                <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Full address / landmark"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Services Offered (comma separated) *</label>
                <input required value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))}
                  placeholder="e.g. Blood Test, ECG, Eye Checkup, Dental"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Contact Email *</label>
                  <input required type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                    placeholder="contact@hospital.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-1 block">Contact Phone *</label>
                  <input required value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Registration Fee</label>
                <div className="flex gap-3">
                  {['Free', '₹100', '₹200', '₹300', '₹500'].map(fee => (
                    <button key={fee} type="button" onClick={() => setForm(f => ({ ...f, registration: fee }))}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${form.registration === fee ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {fee}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm font-medium mb-1 block">Additional Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  placeholder="Any other details about the camp..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (<><FiPlus size={16} /> Submit Camp for Listing</>)}
              </button>
              <p className="text-gray-600 text-xs text-center">Our team reviews within 24 hours. Listing is 100% free.</p>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CampsPage() {
  const { t } = useLanguage();
  const [selectedState, setSelectedState] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [registeringCamp, setRegisteringCamp] = useState<Camp | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  const filteredCamps = useMemo(() => {
    return camps.filter(camp => {
      if (selectedState && camp.state !== selectedState) return false;
      if (selectedService && !camp.services.some(s => s.toLowerCase().includes(selectedService.toLowerCase()))) return false;
      return true;
    });
  }, [selectedState, selectedService]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0.12, 0.26, 0.12], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity }} className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-emerald-600/18 rounded-full blur-[170px]" />
      </div>

      <AnimatePresence>
        {registeringCamp && <RegisterModal camp={registeringCamp} onClose={() => setRegisteringCamp(null)} />}
        {showListModal && <ListCampModal onClose={() => setShowListModal(false)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <FiActivity size={32} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Health Camps</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Free medical checkups and health camps organized across India.
          </p>
          {/* "List Your Camp" CTA */}
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowListModal(true)}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-8 py-3.5 rounded-2xl font-bold transition shadow-[0_0_25px_rgba(20,184,166,0.35)]">
            <FiPlus size={18} /> List Your Health Camp
          </motion.button>
          <p className="text-gray-500 text-sm mt-2">Free listing • Published within 24 hours</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2 text-gray-300">
            <FiFilter className="text-emerald-400" />
            <span className="font-bold uppercase tracking-wider text-sm">{t('filters')}</span>
          </div>
          <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-white">
            <option value="" className="bg-slate-900">{t('allStates')}</option>
            {states.filter(s => s !== 'All India').map(state => <option key={state} value={state} className="bg-slate-900">{state}</option>)}
          </select>
          <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-white">
            <option value="" className="bg-slate-900">{t('allSpecialties')}</option>
            <option value="cardiac" className="bg-slate-900">Cardiac</option>
            <option value="diabetes" className="bg-slate-900">Diabetes</option>
            <option value="women" className="bg-slate-900">Women Health</option>
            <option value="child" className="bg-slate-900">Child Health</option>
            <option value="senior" className="bg-slate-900">Senior Citizen</option>
          </select>
        </motion.div>
      </div>

      {/* Camps Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <p className="text-gray-400 mb-8 font-medium">Found <span className="text-emerald-400 font-bold">{filteredCamps.length}</span> upcoming events.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCamps.map((camp, idx) => (
              <CampCard key={camp.id} camp={camp} delay={idx * 0.1} onRegister={() => setRegisteringCamp(camp)} />
            ))}
          </AnimatePresence>
        </div>
        {filteredCamps.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
            <FiActivity size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">{t('noResults')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function CampCard({ camp, delay, onRegister }: { camp: Camp, delay: number, onRegister: () => void }) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay }} whileHover={{ y: -5 }}
      className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl hover:border-emerald-500/50 group transition">
      <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 p-6 border-b border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition" />
        <div className="flex justify-between items-start relative z-10">
          <h3 className="font-bold text-xl text-white mr-2">{camp.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            camp.registration === 'Free'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
          }`}>{camp.registration}</span>
        </div>
        <p className="text-gray-300 text-sm mt-2 font-medium relative z-10">{camp.hospital}</p>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiCalendar className="text-emerald-400" /><span className="font-medium">{formatDate(camp.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <FiClock className="text-emerald-400" /><span className="font-medium">{camp.time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <FiMapPin className="text-emerald-400 shrink-0" /><span className="truncate">{camp.location}, {camp.city}</span>
        </div>
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Covered Services</p>
          <div className="flex flex-wrap gap-2">
            {camp.services.map(service => (
              <span key={service} className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full group-hover:bg-white/10 transition">{service}</span>
            ))}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onRegister}
          className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2">
          {t('registerNow')} →
        </motion.button>
      </div>
    </motion.div>
  );
}