'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiMail, FiPhone, FiUser, FiMapPin, FiLock,
  FiEye, FiEyeOff, FiCheck, FiChevronRight, FiHeart, FiShield
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

type Step = 'method' | 'details' | 'otp' | 'profile' | 'success';

const FloatingOrb = ({ cx, cy, size, color, delay }: any) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: cx, top: cy, width: size, height: size, background: color, filter: 'blur(40px)' }}
    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 4 + delay, repeat: Infinity, delay }}
  />
);

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('method');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [conditions, setConditions] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError('Please enter a valid 10-digit number'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error();
      setStep('otp');
    } catch {
      setError('Failed to send OTP to mobile network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Enter all 6 digits'); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    if (mode === 'signup') {
      setStep('profile');
    } else {
      setStep('success');
      setTimeout(() => { onLogin(); onClose(); resetForm(); }, 2000);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { setError('Fill in all fields'); return; }
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) {
      setStep('success');
      setTimeout(() => { onLogin(); onClose(); resetForm(); }, 2000);
    } else {
      setError('Invalid credentials. Try again.');
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    // Save profile data to API/localStorage for future use
    const profileData = { name, phone, city, age, bloodGroup, conditions, createdAt: new Date().toISOString() };
    localStorage.setItem('healthhub_user_profile', JSON.stringify(profileData));
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('success');
    setTimeout(() => { onLogin(); onClose(); resetForm(); }, 2000);
  };

  const resetForm = () => {
    setStep('method'); setPhone(''); setOtp(['', '', '', '', '', '']);
    setEmail(''); setPassword(''); setName(''); setCity(''); setAge('');
    setBloodGroup(''); setConditions(''); setError(''); setLoading(false);
  };

  const handleClose = () => { onClose(); setTimeout(resetForm, 300); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication Modal"
        >
          {/* Animated backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={handleClose}
          />

          {/* Floating orbs behind */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
            <FloatingOrb cx="10%" cy="20%" size={300} color="rgba(14,165,233,0.3)" delay={0} />
            <FloatingOrb cx="70%" cy="60%" size={250} color="rgba(139,92,246,0.25)" delay={2} />
            <FloatingOrb cx="40%" cy="80%" size={200} color="rgba(236,72,153,0.2)" delay={1} />
          </div>

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md z-10 overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-all p-2 rounded-full hover:bg-white/10"             >
                <FiX size={20} />
              </button>

              {/* Logo */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}
              >
                <FiHeart className="text-white" size={28} />
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {step === 'method' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {mode === 'login' ? 'Welcome Back' : 'Join ZyntraCare'}
                      </h2>
                      <p className="text-white/50 text-sm">
                        {mode === 'login' ? 'Access your health records & appointments' : 'Your health journey starts here'}
                      </p>
                    </>
                  )}
                  {step === 'otp' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">Verify OTP</h2>
                      <p className="text-white/50 text-sm">Sent to +91 {phone.slice(0, 3)}****{phone.slice(-3)}</p>
                    </>
                  )}
                  {step === 'profile' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">Your Health Profile</h2>
                      <p className="text-white/50 text-sm">Help us personalize your care</p>
                    </>
                  )}
                  {step === 'success' && (
                    <>
                      <h2 className="text-2xl font-bold text-white mb-1">You're in! 🎉</h2>
                      <p className="text-white/50 text-sm">Redirecting to your dashboard</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mode toggle */}
            {step === 'method' && (
              <div className="px-8 mb-6">
                <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                  {(['login', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                    >
                      {m === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">

                {/* STEP: METHOD */}
                {step === 'method' && (
                  <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

                    {/* Google Login */}
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => signIn('google', { callbackUrl: '/' })}
                      className="w-full flex items-center justify-center gap-3 text-white border border-white/15 py-3.5 rounded-2xl font-medium hover:bg-white/10 transition-all group"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/30 text-xs">OR</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Phone */}
                    {mode === 'signup' && (
                      <GlassInput
                        icon={<FiUser />}
                        placeholder="Full Name"
                        value={name}
                        onChange={setName}
                        id="auth-name"
                      />
                    )}

                    <div
                      className="flex rounded-2xl overflow-hidden border border-white/10 focus-within:border-blue-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <span className="px-4 flex items-center text-white/40 border-r border-white/10 text-sm font-medium">+91</span>
                      <input
                        id="auth-phone"
                        type="tel"
                        placeholder="Mobile Number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                        className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-white/30 focus:outline-none text-sm"
                        aria-label="Mobile Number"
                        maxLength={10}
                      />
                      <button
                        onClick={handleSendOTP}
                        disabled={phone.length !== 10 || loading}
                        aria-label="Send OTP"
                        className="px-4 text-blue-400 hover:text-blue-300 transition text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" /> : 'Send OTP'}
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-white/30 text-xs">Email Login</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    <GlassInput icon={<FiMail />} placeholder="Email address" value={email} onChange={setEmail} type="email" id="auth-email" />

                    <div
                      className="flex rounded-2xl overflow-hidden border border-white/10 focus-within:border-blue-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <span className="px-4 flex items-center text-white/40"><FiLock size={16} /></span>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="flex-1 bg-transparent px-2 py-3.5 text-white placeholder-white/30 focus:outline-none text-sm"
                        aria-label="Password"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="px-4 text-white/30 hover:text-white/60 transition" aria-label="Toggle password visibility">
                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs text-center" role="alert">
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEmailLogin}
                      disabled={loading}
                      aria-label="Sign in with email"
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 8px 32px rgba(14,165,233,0.3)' }}
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>{mode === 'login' ? 'Sign In' : 'Create Account'} <FiChevronRight size={18} /></>
                      )}
                    </motion.button>

                    <p className="text-center text-white/30 text-xs flex items-center justify-center gap-1.5">
                      <FiShield size={11} /> Your data is encrypted & secure
                    </p>
                  </motion.div>
                )}

                {/* STEP: OTP */}
                {step === 'otp' && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => e.key === 'Backspace' && !digit && i > 0 && otpRefs.current[i - 1]?.focus()}
                          aria-label={`OTP digit ${i + 1}`}
                          className="w-11 h-14 text-center text-xl font-bold text-white rounded-xl border border-white/15 focus:border-blue-500 focus:outline-none transition-all"
                          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
                        />
                      ))}
                    </div>

                    {error && <p className="text-red-400 text-xs text-center" role="alert">{error}</p>}

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.join('').length !== 6}
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 8px 32px rgba(14,165,233,0.3)' }}
                    >
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Verify OTP <FiCheck /></>}
                    </motion.button>

                    <button onClick={() => setStep('method')} className="w-full text-white/40 text-sm hover:text-white/70 transition">← Change number</button>
                  </motion.div>
                )}

                {/* STEP: PROFILE */}
                {step === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                    <GlassInput icon={<FiUser />} placeholder="Full Name *" value={name} onChange={setName} id="profile-name" />
                    <GlassInput icon={<FiMapPin />} placeholder="Your City *" value={city} onChange={setCity} id="profile-city" />
                    <div className="grid grid-cols-2 gap-3">
                      <GlassInput placeholder="Age" value={age} onChange={setAge} type="number" id="profile-age" />
                      <GlassSelect
                        value={bloodGroup}
                        onChange={setBloodGroup}
                        options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                        placeholder="Blood Group"
                        id="profile-blood"
                      />
                    </div>
                    <textarea
                      id="profile-conditions"
                      placeholder="Known medical conditions (optional)"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 border border-white/10 transition-all resize-none"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                      aria-label="Medical conditions"
                    />

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={loading || !name || !city}
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}
                    >
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Save & Continue <FiChevronRight /></>}
                    </motion.button>
                    <button onClick={() => { setStep('success'); setTimeout(() => { onLogin(); onClose(); resetForm(); }, 2000); }} className="w-full text-white/30 text-xs hover:text-white/50 transition">Skip for now</button>
                  </motion.div>
                )}

                {/* STEP: SUCCESS */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: 2 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 0 40px rgba(16,185,129,0.5)' }}
                    >
                      <FiCheck size={40} className="text-white" />
                    </motion.div>
                    <p className="text-white text-lg font-semibold">Login Successful!</p>
                    <p className="text-white/40 text-sm mt-1">Redirecting to your dashboard...</p>
                    <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-green-400 to-blue-400" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle login/signup */}
              {step === 'method' && (
                <p className="text-center mt-5 text-white/30 text-sm">
                  {mode === 'login' ? "New to ZyntraCare? " : "Already have an account? "}
                  <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                    className="text-blue-400 font-semibold hover:text-blue-300 transition">
                    {mode === 'login' ? 'Sign Up Free' : 'Sign In'}
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Reusable glass input
function GlassInput({ icon, placeholder, value, onChange, type = 'text', id }: any) {
  return (
    <div
      className="flex items-center rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)' }}
    >
      {icon && <span className="px-4 text-white/30">{icon}</span>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-white/30 focus:outline-none text-sm"
        aria-label={placeholder}
      />
    </div>
  );
}

function GlassSelect({ value, onChange, options, placeholder, id }: any) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={placeholder}
      className="w-full px-4 py-3.5 rounded-2xl text-sm text-white border border-white/10 focus:border-blue-500/50 focus:outline-none transition-all appearance-none"
      style={{ background: 'rgba(255,255,255,0.05)', backgroundImage: 'none' }}
    >
      <option value="" className="bg-gray-900">{placeholder}</option>
      {options.map((o: string) => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
    </select>
  );
}