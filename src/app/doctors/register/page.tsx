'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPhone, FiMail, FiMapPin, FiCheckCircle, FiArrowRight, FiStar, FiAward, FiBriefcase, FiClock } from 'react-icons/fi';
import { FaStethoscope, FaBrain, FaHeartbeat, FaBone, FaBaby } from 'react-icons/fa';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
  'Gynecology', 'Dermatology', 'Psychiatry', 'ENT', 'Ophthalmology',
  'Nephrology', 'Gastroenterology', 'Pulmonology', 'Urology', 'General Medicine',
  'Emergency Medicine', 'Anesthesiology', 'Radiology', 'Pathology', 'Surgery',
];

const BENEFITS = [
  { icon: FiStar, title: 'Verified Badge', desc: 'Blue verified checkmark on your profile for credibility' },
  { icon: FaHeartbeat, title: '10,000+ Patients', desc: 'Connect with lakhs of patients searching for specialists' },
  { icon: FiClock, title: 'Flexible Schedule', desc: 'Set your own availability & consultation slots' },
  { icon: FiAward, title: 'AI Referrals', desc: 'Our Gemini AI automatically refers matching cases to you' },
];

export default function DoctorRegistrationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // Step 1 - Personal
    name: '', email: '', phone: '', city: '', state: '',
    // Step 2 - Professional
    specialty: '', qualification: '', experience: '', regNumber: '', hospital: '',
    // Step 3 - Availability
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
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-12">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
            <FiCheckCircle size={44} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-3">Application Submitted!</h2>
          <p className="text-gray-400 mb-4">Thank you, <span className="text-white font-bold">{form.name}</span>!</p>
          <p className="text-gray-400 text-sm mb-6">Our team will verify your credentials and activate your profile within <span className="text-emerald-400 font-bold">48-72 hours</span>. You'll receive an email at <span className="text-white">{form.email}</span>.</p>
          <div className="bg-black/30 rounded-2xl p-4 text-left space-y-2 mb-6 border border-white/5">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-3">Application Summary</p>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="text-white font-semibold">{form.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Specialty</span><span className="text-white font-semibold">{form.specialty}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Experience</span><span className="text-white font-semibold">{form.experience} years</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Hospital</span><span className="text-white font-semibold">{form.hospital || 'Independent'}</span></div>
          </div>
          <a href="/" className="block w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl font-bold transition text-center">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 relative z-10">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-5 py-2 rounded-full text-sm font-bold mb-6">
            <FaStethoscope size={14} /> Join ZyntraCare Provider Network
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
            Register as a <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">Doctor</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            Join 2,000+ verified doctors on India's fastest growing healthcare platform. Reach more patients, manage bookings, and grow your practice.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-4 gap-4 mb-16">
          {BENEFITS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-white/8 rounded-2xl p-5 text-center hover:border-teal-500/30 transition group">
              <div className="w-12 h-12 bg-teal-500/15 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-teal-500/25 transition">
                <b.icon className="text-teal-400" size={22} />
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{b.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {['Personal Info', 'Credentials', 'Availability'].map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-teal-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                  {step > i + 1 ? <FiCheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden md:block ${step === i + 1 ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                {i < 2 && <div className={`w-8 h-0.5 rounded ${step > i + 1 ? 'bg-emerald-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <FiUser className="text-teal-400" /> Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">Full Name (as per degree) *</label>
                      <input required value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Dr. Full Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Email *</label>
                        <input required type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="doctor@email.com"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Phone *</label>
                        <input required value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+91 98765 43210"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">City *</label>
                        <input required value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="City"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">State *</label>
                        <input required value={form.state} onChange={e => updateForm('state', e.target.value)} placeholder="State"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                    </div>
                    <button onClick={() => form.name && form.email && form.phone && setStep(2)}
                      disabled={!form.name || !form.email || !form.phone}
                      className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white py-4 rounded-xl font-bold transition flex items-center justify-center gap-2">
                      Continue <FiArrowRight />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <FiAward className="text-teal-400" /> Professional Credentials
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-2 block">Specialty *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SPECIALTIES.map(s => (
                          <button key={s} type="button" onClick={() => updateForm('specialty', s)}
                            className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition text-left ${form.specialty === s ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">Qualification *</label>
                      <input required value={form.qualification} onChange={e => updateForm('qualification', e.target.value)} placeholder="e.g. MBBS, MD Cardiology, FACC"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Years of Experience *</label>
                        <input required type="number" min="1" value={form.experience} onChange={e => updateForm('experience', e.target.value)} placeholder="e.g. 12"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm font-medium mb-1 block">Medical Reg. Number *</label>
                        <input required value={form.regNumber} onChange={e => updateForm('regNumber', e.target.value)} placeholder="MCI/State Reg. No."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">Current Hospital / Clinic</label>
                      <input value={form.hospital} onChange={e => updateForm('hospital', e.target.value)} placeholder="Hospital name or 'Independent Practice'"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition">Back</button>
                      <button onClick={() => form.specialty && form.qualification && form.experience && form.regNumber && setStep(3)}
                        disabled={!form.specialty || !form.qualification || !form.experience || !form.regNumber}
                        className="flex-[2] bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                        Continue <FiArrowRight />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                    <FiClock className="text-teal-400" /> Consultation Details
                  </h2>
                  <div className="space-y-5">
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-2 block">Consultation Type *</label>
                      <div className="flex flex-wrap gap-3">
                        {['In-Person', 'Video Call', 'Home Visit'].map(type => (
                          <button key={type} type="button" onClick={() => toggleArray('consultationType', type)}
                            className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${form.consultationType.includes(type) ? 'bg-teal-600 border-teal-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">Consultation Fee (₹)</label>
                      <input type="number" value={form.consultationFee} onChange={e => updateForm('consultationFee', e.target.value)} placeholder="e.g. 1500"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-2 block">Languages Spoken</label>
                      <div className="flex flex-wrap gap-2">
                        {['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Gujarati', 'Punjabi', 'Malayalam'].map(lang => (
                          <button key={lang} type="button" onClick={() => toggleArray('languages', lang)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${form.languages.includes(lang) ? 'bg-sky-600 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm font-medium mb-1 block">Professional Bio</label>
                      <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)} rows={4}
                        placeholder="Brief description of your specialization, expertise, and approach to patient care..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition resize-none" />
                    </div>
                    <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-4">
                      <p className="text-teal-400 text-sm font-bold mb-1">✓ By submitting, you agree that:</p>
                      <p className="text-gray-400 text-xs leading-relaxed">Your credentials will be verified by our medical team. Your profile will be visible to patients after approval (48-72 hrs). All provided information is accurate.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition">Back</button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit} disabled={loading || form.consultationType.length === 0}
                        className="flex-[2] bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 disabled:opacity-40 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                        {loading ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (<><FiCheckCircle /> Submit Application</>)}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
