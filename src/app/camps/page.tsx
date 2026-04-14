'use client';

import { useState, useMemo, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiFilter, FiActivity, FiX, FiUser, FiPhone, FiMail, FiCheckCircle, FiPlus, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface Camp {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  services: string[];
  hospital: string;
  registration: string;
  spotsAvailable?: number;
  organizedBy?: string;
  locationCoords?: { lat: number; lng: number };
}

// Indian states for filters
const INDIAN_STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Kerala', 'Bihar', 'Jharkhand'];

// ── REUSABLE GLASS FLOATING INPUT ──
function FloatingInput({ label, value, onChange, type = 'text', id = label.replace(/\s+/g, '-').toLowerCase() }: any) {
  return (
    <div className="relative group w-full">
      <input
        id={id} type={type} placeholder=" " value={value} onChange={e => onChange(e.target.value)} required
        className="block w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm appearance-none focus:outline-none focus:ring-0 focus:border-emerald-500/50 focus:bg-white/[0.04] peer transition-all duration-300"
      />
      <label htmlFor={id}
        className="absolute text-white/40 text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#020617] px-2 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:bg-[#020617] peer-focus:text-emerald-400 font-medium">
        {label}
      </label>
    </div>
  );
}

// ── REGISTER MODAL ──
function RegisterModal({ camp, onClose }: { camp: Camp; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', city: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 400)); 
    setLoading(false); setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)' }}>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full z-20">
            <FiX size={20} />
          </button>

          {submitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6 relative z-10">
              <div className="relative w-28 h-28 mx-auto mb-6">
                {[0, 1].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border border-emerald-500/40"
                    style={{ animation: `success-ripple 2.5s ease-out infinite`, animationDelay: `${i * 0.8}s` }} />
                ))}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center">
                  <FiCheckCircle size={40} className="text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white mb-2 dropdown-shadow">Registered!</h3>
              <p className="text-white/50 mb-2 leading-relaxed">You're successfully registered for</p>
              <p className="text-emerald-400 font-black text-lg mb-6">{camp.name}</p>
              <button onClick={onClose} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 rounded-2xl font-bold transition-all">Close</button>
            </motion.div>
          ) : (
            <div className="relative z-10">
              <div className="mb-8 text-center pt-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Camp Registration</span>
                <h3 className="text-2xl font-black text-white">{camp.name}</h3>
                <p className="text-white/40 text-xs mt-2 font-medium">{formatDate(camp.date)} • {camp.time} • {camp.city}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FloatingInput label="Full Name *" value={form.name} onChange={(v: string) => setForm(f => ({ ...f, name: v }))} />
                <FloatingInput label="Mobile Number *" type="tel" value={form.phone} onChange={(v: string) => setForm(f => ({ ...f, phone: v.replace(/\D/g,'').slice(0,10) }))} />
                <FloatingInput label="Email Address" type="email" value={form.email} onChange={(v: string) => setForm(f => ({ ...f, email: v }))} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput label="Age" type="number" value={form.age} onChange={(v: string) => setForm(f => ({ ...f, age: v }))} />
                  <FloatingInput label="City" value={form.city} onChange={(v: string) => setForm(f => ({ ...f, city: v }))} />
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mt-2">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Services Covered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {camp.services.map(s => <span key={s} className="text-[10px] bg-white/10 text-white px-2 py-1 rounded-md">{s}</span>)}
                  </div>
                </div>

                <button type="submit" disabled={loading || !form.name || !form.phone}
                  className="w-full py-4 rounded-2xl font-black text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center gap-2 mt-4"
                  style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 8px 30px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Confirm Form <FiCheckCircle size={16}/></>}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── LIST CAMP MODAL ──
function ListCampModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    orgName: '', campName: '', date: '', time: '', city: '', state: '',
    location: '', services: '', contactEmail: '', contactPhone: '', registration: 'Free'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false); setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#020617]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl my-8 relative"
          style={{ backgroundImage: 'linear-gradient(180deg, rgba(20,184,166,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
          
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full z-20"><FiX size={20} /></button>

          {submitted ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)]">
                <FiCheckCircle size={44} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">Camp Listed!</h3>
              <p className="text-white/50 text-sm max-w-sm mx-auto mb-8">Thank you. Our medical team will verify and publish your health camp listing within 24 hours.</p>
              <button onClick={onClose} className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all">Back to Camps</button>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center">
                  <FiPlus className="text-teal-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">List Your Camp</h3>
                  <p className="text-white/40 text-xs mt-1">Reach out to thousands of patients across India</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput label="Organization / Trust Name *" value={form.orgName} onChange={(v: string) => setForm(f => ({ ...f, orgName: v }))} />
                  <FloatingInput label="Camp Name *" value={form.campName} onChange={(v: string) => setForm(f => ({ ...f, campName: v }))} />
                  <FloatingInput label="Date *" type="date" value={form.date} onChange={(v: string) => setForm(f => ({ ...f, date: v }))} />
                  <FloatingInput label="Time (e.g. 9am - 4pm) *" value={form.time} onChange={(v: string) => setForm(f => ({ ...f, time: v }))} />
                  <FloatingInput label="City *" value={form.city} onChange={(v: string) => setForm(f => ({ ...f, city: v }))} />
                  
                  <div className="relative group w-full">
                    <select required value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))}
                      className="block w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm appearance-none focus:outline-none focus:border-teal-500/50">
                      <option value="" className="bg-slate-900">Select State *</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                  </div>
                </div>

                <FloatingInput label="Full Address / Venue *" value={form.location} onChange={(v: string) => setForm(f => ({ ...f, location: v }))} />
                <FloatingInput label="Offered Services (Comma separated) *" value={form.services} onChange={(v: string) => setForm(f => ({ ...f, services: v }))} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput label="Contact Email *" type="email" value={form.contactEmail} onChange={(v: string) => setForm(f => ({ ...f, contactEmail: v }))} />
                  <FloatingInput label="Contact Phone *" type="tel" value={form.contactPhone} onChange={(v: string) => setForm(f => ({ ...f, contactPhone: v.replace(/\D/g,'').slice(0,10) }))} />
                </div>

                <div className="pt-2">
                  <label className="text-white/40 text-xs font-bold uppercase tracking-widest pl-1 mb-3 block">Entry Fee</label>
                  <div className="flex flex-wrap gap-2">
                    {['Free', '₹50', '₹100', '₹500'].map(fee => (
                      <button key={fee} type="button" onClick={() => setForm(f => ({ ...f, registration: fee }))}
                        className={`px-6 py-2.5 rounded-xl border text-sm font-bold transition-all ${form.registration === fee ? 'bg-gradient-to-r from-teal-500 to-sky-500 border-transparent text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}>
                        {fee}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full mt-6 py-4 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)', boxShadow: '0 8px 30px rgba(20,184,166,0.3)' }}>
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Submit Listing Request <FiArrowRight size={16}/></>}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── MAIN PAGE ──
export default function CampsPage() {
  const { t } = useLanguage();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [apiStates, setApiStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [registeringCamp, setRegisteringCamp] = useState<Camp | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    fetch('/api/camps')
      .then(r => r.json())
      .then(data => {
        setCamps(data.camps || []);
        setApiStates(data.states || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCamps = useMemo(() => {
    return camps.filter(camp => {
      if (selectedState && camp.state !== selectedState) return false;
      if (selectedService && !camp.services.some(s => s.toLowerCase().includes(selectedService.toLowerCase()))) return false;
      return true;
    });
  }, [selectedState, selectedService]);

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-x-hidden font-inter pb-24 text-white">
      
      {/* ── CINEMATIC BG ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 70%)' }} />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNmY2VjU0SDU0VjMwbS0wIDBiLTZiLTZiNi02aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-[0.25]" />
      </div>

      <AnimatePresence>
        {registeringCamp && <RegisterModal camp={registeringCamp} onClose={() => setRegisteringCamp(null)} />}
        {showListModal && <ListCampModal onClose={() => setShowListModal(false)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 relative z-10 pt-28 pb-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-xl backdrop-blur-md">
            <FiActivity size={24} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-[1.1] dropdown-shadow">
            Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 tracking-tight">Health Camps</span>
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover free medical checkups organized by top institutions across India. <br />
            Are you an organizer? <button onClick={() => setShowListModal(true)} className="text-teal-400 font-bold hover:text-teal-300 transition-colors underline decoration-teal-500/30 underline-offset-4">List your camp instantly.</button>
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/[0.02] border border-white/10 p-4 rounded-[2rem] backdrop-blur-2xl shadow-2xl flex flex-wrap gap-4 items-center mb-12">
          <div className="flex items-center gap-2 text-white/50 px-4">
            <FiFilter className="text-emerald-400" size={18} />
            <span className="font-black uppercase tracking-widest text-xs">Filters</span>
          </div>
          <div className="flex-1 flex flex-wrap gap-4">
            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
              className="flex-1 min-w-[200px] px-5 py-4 bg-[#0f172a] border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all text-sm font-semibold text-white appearance-none">
              <option value="">All States</option>
              {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
              className="flex-1 min-w-[200px] px-5 py-4 bg-[#0f172a] border border-white/5 rounded-2xl focus:border-emerald-500/50 outline-none transition-all text-sm font-semibold text-white appearance-none">
              <option value="">All Services</option>
              <option value="cardiac">Cardiac Checkup</option>
              <option value="diabetes">Diabetes & Sugar</option>
              <option value="women">Women Health</option>
              <option value="child">Pediatrics</option>
              <option value="eye">Eye & Vision</option>
            </select>
          </div>
        </div>

        {/* Camp Grid */}
        <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-6 px-2">{filteredCamps.length} Active Camps</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCamps.map((camp, idx) => (
              <CampCard key={camp.id} camp={camp} delay={idx * 0.05} onRegister={() => setRegisteringCamp(camp)} />
            ))}
          </AnimatePresence>
        </div>

        {filteredCamps.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2.5rem]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"><FiActivity size={32} className="text-white/20" /></div>
            <p className="text-white/50 text-lg font-medium">No camps match your filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── CAMP CARD ──
function CampCard({ camp, delay, onRegister }: { camp: Camp, delay: number, onRegister: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay, type: 'spring', damping: 25 }}
      whileHover={{ y: -6 }}
      className="bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl hover:bg-white/[0.04] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] group transition-all duration-300 flex flex-col h-full">
      
      {/* Card Header */}
      <div className="p-6 relative overflow-hidden border-b border-white/5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(20,184,166,0) 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 rounded-full blur-[40px] group-hover:bg-emerald-500/30 transition-all opacity-50" />
        
        <div className="flex justify-between items-start relative z-10 mb-4">
          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
            camp.registration === 'Free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
          }`}>{camp.registration}</span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><FiActivity size={14} className="text-white/40" /></div>
        </div>
        
        <h3 className="font-black text-2xl text-white leading-tight mb-2 relative z-10">{camp.name}</h3>
        <p className="text-white/50 text-sm font-medium relative z-10">{camp.hospital}</p>
      </div>

      {/* Card Body */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#0f172a] border border-white/5 p-3 rounded-xl flex items-center gap-3">
            <FiCalendar className="text-emerald-400" size={16} />
            <div><p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Date</p><p className="text-xs text-white font-bold">{formatDate(camp.date)}</p></div>
          </div>
          <div className="bg-[#0f172a] border border-white/5 p-3 rounded-xl flex items-center gap-3">
            <FiClock className="text-emerald-400" size={16} />
            <div><p className="text-[10px] text-white/40 uppercase font-black tracking-wider">Time</p><p className="text-xs text-white font-bold">{camp.time}</p></div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 mb-6 flex-grow">
          <FiMapPin className="text-emerald-400 mt-0.5 shrink-0" size={16} />
          <div>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-wider w-full">Location</p>
            <p className="text-xs text-white leading-relaxed">{camp.location}, {camp.city}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 pl-1">Services Provided</p>
          <div className="flex flex-wrap gap-1.5">
            {camp.services.slice(0,4).map(service => (
              <span key={service} className="text-[10px] font-semibold bg-white/5 text-white/70 px-2.5 py-1.5 rounded-md border border-white/5">{service}</span>
            ))}
            {camp.services.length > 4 && <span className="text-[10px] font-semibold bg-transparent text-white/40 px-2.5 py-1.5">+ {camp.services.length - 4} more</span>}
          </div>
        </div>

        <button onClick={onRegister} className="mt-auto w-full py-4 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
          style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(16,185,129,0.1))', border: '1px solid rgba(20,184,166,0.3)' }}>
          Register Now <FiArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}