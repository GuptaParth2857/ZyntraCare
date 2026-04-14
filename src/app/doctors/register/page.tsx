'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiAward, FiClock, FiCheckCircle, FiArrowRight, FiStar, FiFileText } from 'react-icons/fi';
import { FaStethoscope, FaHeartbeat } from 'react-icons/fa';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
  'Gynecology', 'Dermatology', 'Psychiatry', 'ENT', 'Ophthalmology',
  'Nephrology', 'Gastroenterology', 'Pulmonology', 'Urology', 'General Medicine',
  'Emergency Medicine', 'Anesthesiology', 'Radiology', 'Pathology', 'Surgery',
];

const BENEFITS = [
  { icon: FiStar, title: 'Verified Badge', desc: 'Premium blue verified checkmark' },
  { icon: FaHeartbeat, title: '10,000+ Patients', desc: 'Massive patient network access' },
  { icon: FiClock, title: 'Flexible Schedule', desc: 'Set your own consultation slots' },
  { icon: FiAward, title: 'AI Matchmaking', desc: 'Gemini AI refers exact cases' },
];

export default function DoctorRegistrationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', state: '',
    specialty: '', qualification: '', experience: '', regNumber: '', hospital: '',
    consultationFee: '', consultationType: [] as string[], languages: [] as string[], bio: '',
  });

  const updateForm = (key: string, value: string | string[]) => setForm(f => ({ ...f, [key]: value }));

  const toggleArray = (key: 'consultationType' | 'languages', val: string) => {
    setForm(f => ({
      ...f,
      [key]: (f[key] as string[]).includes(val)
        ? (f[key] as string[]).filter(v => v !== val)
        : [...(f[key] as string[]), val]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-teal-500/30 overflow-x-hidden pt-24 pb-20 relative">
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 80% 0%, rgba(20,184,166,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14,165,233,0.1) 0%, transparent 60%)',
          }}
        />
        {/* Animated Orbs */}
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Abstract Grid Map */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNmY2VjU0SDU0VjMwbS0wIDBiLTZiLTZiNi02aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50 mask-image-gradient" />
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
              {/* JioHotstar Style Ripple Success */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute inset-0 rounded-full border border-teal-500/50"
                    style={{ animation: `success-ripple 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`, animationDelay: `${i * 0.6}s` }}
                  />
                ))}
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                  className="absolute inset-4 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-sky-500 shadow-[0_0_50px_rgba(20,184,166,0.6)]">
                  <FiCheckCircle size={48} className="text-white" />
                </motion.div>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 dropdown-shadow">
                Application Received!
              </h1>
              <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
                Thank you, <span className="text-white font-bold">{form.name}</span>. Our medical team is verifying your credentials. You will receive an approval email within <span className="text-teal-400 font-bold">48 hours</span>.
              </p>

              {/* Glass Summary Box */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl text-left max-w-lg mx-auto shadow-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-sky-500" />
                <h3 className="text-white/40 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><FiFileText /> Registration Profile</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-white/50 text-sm">Specialty</span>
                    <span className="text-white font-bold">{form.specialty}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-2">
                    <span className="text-white/50 text-sm">Experience</span>
                    <span className="text-teal-400 font-black">{form.experience} Years</span>
                  </div>
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-white/50 text-sm">Hospital</span>
                    <span className="text-white font-bold">{form.hospital || 'Private Clinic'}</span>
                  </div>
                </div>
              </div>

              <a href="/" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-white transition-all hover:scale-105 active:scale-95">
                Go to Dashboard <FiArrowRight />
              </a>
            </motion.div>

          ) : (
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              
              {/* ── LEFT COLUMN (Text & Benefits) ── */}
              <div className="lg:col-span-5 lg:sticky top-32">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-400 text-xs font-black uppercase tracking-widest mb-6">
                    <FaStethoscope /> For Medical Professionals
                  </div>
                  <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 dropdown-shadow">
                    Join The <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">Future</span> of Care.
                  </h1>
                  <p className="text-white/50 text-lg mb-10 max-w-md">
                    Become part of India’s most advanced AI-powered healthcare network. Digitize your practice and reach thousands of patients instantly.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BENEFITS.map((b, i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-teal-500/30 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all">
                          <b.icon className="text-teal-400" size={18} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm mb-1">{b.title}</h4>
                          <p className="text-white/40 text-xs leading-relaxed">{b.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* ── RIGHT COLUMN (Glass Form) ── */}
              <div className="lg:col-span-7">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-[2.5rem] p-1"
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                    boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                  }}
                >
                  <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2.5rem] z-0" />
                  
                  <div className="relative z-10 p-8 md:p-12">
                    
                    {/* Stepper */}
                    <div className="flex items-center justify-between mb-12 relative">
                      {/* Track */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 rounded-full z-0" />
                      {/* Active Track */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-teal-400 to-sky-500 rounded-full z-0 transition-all duration-500" 
                        style={{ width: `${((step - 1) / 2) * 100}%` }} 
                      />
                      
                      {[
                        { num: 1, icon: FiUser, label: 'Identity' },
                        { num: 2, icon: FiAward, label: 'Credentials' },
                        { num: 3, icon: FiClock, label: 'Availability' }
                      ].map((s) => {
                        const isActive = step === s.num;
                        const isPast = step > s.num;
                        return (
                          <div key={s.num} className="relative z-10 flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                              isActive ? 'bg-gradient-to-br from-teal-400 to-sky-500 text-white scale-110 shadow-teal-500/40' :
                              isPast ? 'bg-white/10 text-white border border-white/20' : 'bg-[#0f172a] text-white/20 border border-white/5'
                            }`}>
                              {isPast ? <FiCheckCircle size={20} /> : <s.icon size={20} />}
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wider absolute -bottom-7 whitespace-nowrap transition-colors ${
                              isActive ? 'text-teal-400' : isPast ? 'text-white/60' : 'text-white/20'
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Step Fields */}
                    <div className="min-h-[400px]">
                      <AnimatePresence mode="wait">
                        {/* STEP 1: PERSONAL INFO */}
                        {step === 1 && (
                          <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <h2 className="text-2xl font-black text-white mb-6">Personal details</h2>
                            
                            <FloatingInput label="Full Name (as per degree) *" value={form.name} onChange={(v: string) => updateForm('name', v)} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <FloatingInput label="Corporate Email *" type="email" value={form.email} onChange={(v: string) => updateForm('email', v)} />
                              <FloatingInput label="Mobile Number *" type="tel" value={form.phone} onChange={(v: string) => updateForm('phone', v.replace(/\D/g, '').slice(0, 10))} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <FloatingInput label="City *" value={form.city} onChange={(v: string) => updateForm('city', v)} />
                              <FloatingInput label="State *" value={form.state} onChange={(v: string) => updateForm('state', v)} />
                            </div>
                          </motion.div>
                        )}

                        {/* STEP 2: CREDENTIALS */}
                        {step === 2 && (
                          <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <h2 className="text-2xl font-black text-white mb-6">Professional Credentials</h2>
                            
                            <div>
                              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Core Specialty *</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                {SPECIALTIES.map(s => (
                                  <button key={s} type="button" onClick={() => updateForm('specialty', s)}
                                    className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all text-left truncate ${
                                      form.specialty === s 
                                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.06] hover:text-white'
                                    }`}>
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <FloatingInput label="Highest Qualification (e.g. MD, MS, DNB) *" value={form.qualification} onChange={(v: string) => updateForm('qualification', v)} />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <FloatingInput label="Medical Registration No. *" value={form.regNumber} onChange={(v: string) => updateForm('regNumber', v)} />
                              <FloatingInput label="Experience (Years) *" type="number" value={form.experience} onChange={(v: string) => updateForm('experience', v)} />
                            </div>
                            
                            <FloatingInput label="Current Hospital / Clinic Name" value={form.hospital} onChange={(v: string) => updateForm('hospital', v)} />
                          </motion.div>
                        )}

                        {/* STEP 3: AVAILABILITY */}
                        {step === 3 && (
                          <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-white mb-6">Consultation Offerings</h2>
                            
                            <div>
                              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Types Available *</p>
                              <div className="flex flex-wrap gap-3">
                                {['In-Person Clinic', 'Secure Video Call', 'Home Visit'].map(type => (
                                  <button key={type} onClick={() => toggleArray('consultationType', type)}
                                    className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all ${
                                      form.consultationType.includes(type)
                                      ? 'bg-gradient-to-r from-teal-500 to-sky-500 border-transparent text-white shadow-lg'
                                      : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.08]'
                                    }`}>
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <FloatingInput label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={(v: string) => updateForm('consultationFee', v)} />

                            <div>
                              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Spoken Languages</p>
                              <div className="flex flex-wrap gap-2">
                                {['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi'].map(lang => (
                                  <button key={lang} onClick={() => toggleArray('languages', lang)}
                                    className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                                      form.languages.includes(lang)
                                      ? 'bg-white/10 border-white/30 text-white'
                                      : 'bg-transparent border-white/5 text-white/30 hover:border-white/20'
                                    }`}>
                                    {lang}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)} rows={3}
                              placeholder="Brief bio or specialization focus..."
                              className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:bg-white/5 focus:border-teal-500/50 focus:outline-none transition-all resize-none text-sm" 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                      {step > 1 && (
                        <button onClick={() => setStep(s => s - 1)} className="px-6 py-4 rounded-xl font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm">
                          Back
                        </button>
                      )}
                      
                      {step < 3 ? (
                        <button
                          onClick={() => {
                            if (step === 1 && (!form.name || !form.email || !form.phone)) return;
                            if (step === 2 && (!form.specialty || !form.qualification || !form.experience || !form.regNumber)) return;
                            setStep(s => s + 1);
                          }}
                          className="ml-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-black text-white text-sm transition-all"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 8px 32px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                        >
                          Next Step <FiArrowRight size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmit} disabled={loading || form.consultationType.length === 0}
                          className="ml-auto w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black text-white text-sm transition-all disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 32px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                        >
                          {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Complete Application <FiCheckCircle size={18} /></>}
                        </button>
                      )}
                    </div>

                  </div>
                </motion.div>
              </div>

            </div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(20, 184, 166, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 166, 0.5); }
      `}</style>
    </div>
  );
}

// Reusable Premium Floating Label Input
function FloatingInput({ label, value, onChange, type = 'text', id = label.replace(/\s+/g, '-').toLowerCase() }: any) {
  return (
    <div className="relative group">
      <input
        id={id} type={type} placeholder=" " value={value} onChange={e => onChange(e.target.value)}
        className="block w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl text-white text-sm appearance-none focus:outline-none focus:ring-0 focus:border-teal-500/50 focus:bg-white/[0.04] peer transition-all duration-300"
      />
      <label htmlFor={id}
        className="absolute text-white/40 text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#0f172a] px-2 left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:bg-[#0f172a] peer-focus:text-teal-400 font-medium">
        {label}
      </label>
    </div>
  );
}
