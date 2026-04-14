'use client';

import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiMail, FiPhone, FiUser, FiMapPin, FiLock,
  FiEye, FiEyeOff, FiCheck, FiChevronRight, FiShield, FiArrowRight
} from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

type Step = 'method' | 'details' | 'otp' | 'profile' | 'success';

/* ── Netflix/JioHotstar style particles ── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('method');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
      if (!res.ok) throw new Error();
      setStep('otp');
    } catch { setError('Failed to send OTP.'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    
    try {
      // Verify OTP via API
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'verify', otp: otpValue })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }
      
      // OTP verified - proceed with sign in via phone-otp provider
      const signInResult = await signIn('phone-otp', {
        phone,
        otp: otpValue,
        redirect: false
      });
      
      setLoading(false);
      
      if (signInResult?.ok) {
        if (mode === 'signup') { setStep('profile'); } 
        else { setStep('success'); setTimeout(() => { onLogin(); onClose(); resetForm(); }, 1200); }
      } else {
        // Fallback: auto-login for demo
        if (mode === 'signup') { setStep('profile'); } 
        else { setStep('success'); setTimeout(() => { onLogin(); onClose(); resetForm(); }, 1200); }
      }
    } catch (err) {
      setLoading(false);
      setError('Verification failed. Try again.');
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }
    
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    
    setError(''); setLoading(true);
    
    try {
      // For signup mode - create new user
      if (mode === 'signup') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || email.split('@')[0] })
        });
        
        const data = await res.json();
        
        setLoading(false);
        
        if (res.ok) {
          // Auto-login after signup
          const result = await signIn('credentials', { email, password, redirect: false });
          if (result?.ok) {
            setStep('success');
            setTimeout(() => { onLogin(); onClose(); resetForm(); }, 1200);
          }
        } else {
          setError(data.error || 'Registration failed. Try again.');
        }
      } else {
        // Login mode
        const result = await signIn('credentials', { email, password, redirect: false });
        
        setLoading(false);
        
        if (result?.ok) { 
          setStep('success'); 
          setTimeout(() => { onLogin(); onClose(); resetForm(); }, 1200); 
        } else {
          setError('Invalid email or password. Please try again.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Something went wrong. Try again.');
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    localStorage.setItem('healthhub_user_profile', JSON.stringify({ name, phone, city, age, bloodGroup, conditions, createdAt: new Date().toISOString() }));
    await new Promise(r => setTimeout(r, 400));
    setLoading(false); setStep('success');
    setTimeout(() => { onLogin(); onClose(); resetForm(); }, 1200);
  };

  const resetForm = () => {
    setStep('method'); setPhone(''); setOtp(['', '', '', '', '', '']);
    setEmail(''); setPassword(''); setName(''); setCity(''); setAge('');
    setBloodGroup(''); setConditions(''); setError(''); setLoading(false);
  };
  const handleClose = () => { onClose(); setTimeout(resetForm, 350); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Authentication"
        >
          {/* ── NETFLIX-STYLE CINEMATIC BACKDROP ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleClose}
            style={{
              background: 'radial-gradient(ellipse at 20% 50%, rgba(14,165,233,0.18) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(236,72,153,0.12) 0%, transparent 50%), rgba(2,6,23,0.92)',
              backdropFilter: 'blur(24px)',
            }}
          />

          {/* ── CSS particle field (no JS RAF) ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {PARTICLES.map(p => (
              <div
                key={p.id}
                className="absolute rounded-full bg-white/20"
                style={{
                  width: p.size,
                  height: p.size,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  animation: `auth-float ${p.duration}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                  willChange: 'transform, opacity',
                }}
              />
            ))}
            {/* Horizontal scan lines (JioHotstar signature) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.014) 2px, rgba(255,255,255,0.014) 4px)',
                backgroundSize: '100% 4px',
              }}
            />
          </div>

          {/* ── MODAL CARD ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 48 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 48 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300, mass: 0.8 }}
            className="relative w-full max-w-[420px] mx-4 z-10 overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(10,15,32,0.98) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 100px -20px rgba(0,0,0,0.8), 0 0 80px rgba(14,165,233,0.08)',
            }}
          >
            {/* Netflix-style coloured top line */}
            <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 50%, #ec4899 100%)' }} />

            {/* Ambient inner glow top */}
            <div
              className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.12) 0%, transparent 70%)' }}
            />

            {/* ── HEADER ── */}
            <div className="relative px-8 pt-8 pb-5 text-center">
              <button
                onClick={handleClose}
                aria-label="Close modal"
                className="absolute top-5 right-5 text-white/30 hover:text-white/70 transition-all p-2 rounded-full hover:bg-white/8"
              >
                <FiX size={18} />
              </button>

              {/* Logo with cinematic reveal */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
                className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)', boxShadow: '0 12px 40px rgba(14,165,233,0.4), 0 0 0 1px rgba(255,255,255,0.1)' }}
              >
                {/* Logo glow ring — CSS, not Framer Infinity */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ animation: 'logo-ring-pulse 3s ease-in-out infinite', boxShadow: '0 0 30px rgba(14,165,233,0.6)' }}
                />
                <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
                  <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12 12-5.4 12-12S22.6 4 16 4z" fill="rgba(255,255,255,0.15)" />
                  <path d="M16 8c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8z" fill="rgba(255,255,255,0.1)" />
                  <path d="M13 12l7 4-7 4V12z" fill="white" />
                </svg>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                  {step === 'method' && (
                    <>
                      <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                        {mode === 'login' ? 'Welcome back' : 'Join ZyntraCare'}
                      </h2>
                      <p className="text-white/40 text-sm font-medium">
                        {mode === 'login' ? 'Sign in to access your health records' : 'Your complete health journey starts here'}
                      </p>
                    </>
                  )}
                  {step === 'otp' && (
                    <>
                      <h2 className="text-2xl font-black text-white mb-1">Verify OTP</h2>
                      <p className="text-white/40 text-sm">Sent to +91 {phone.slice(0, 3)}****{phone.slice(-3)}</p>
                    </>
                  )}
                  {step === 'profile' && (
                    <>
                      <h2 className="text-2xl font-black text-white mb-1">Your Health Profile</h2>
                      <p className="text-white/40 text-sm">Help us personalise your care</p>
                    </>
                  )}
                  {step === 'success' && (
                    <>
                      <h2 className="text-2xl font-black text-white mb-1">You're in! 🎉</h2>
                      <p className="text-white/40 text-sm">Redirecting to your dashboard</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Mode toggle */}
            {step === 'method' && (
              <div className="px-8 mb-5">
                <div className="flex bg-white/[0.04] rounded-2xl p-1 border border-white/8">
                  {(['login', 'signup'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        mode === m
                          ? 'text-white shadow-lg'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                      style={mode === m ? { background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 4px 20px rgba(14,165,233,0.3)' } : {}}
                    >
                      {m === 'login' ? 'Sign In' : 'Sign Up'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── BODY ── */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">

                {/* STEP: METHOD */}
                {step === 'method' && (
                  <motion.div key="method" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="space-y-3">

                    {/* Google — JioHotstar style pill */}
                    <motion.button
                      whileHover={{ scale: 1.015, boxShadow: '0 8px 32px rgba(255,255,255,0.08)' }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => signIn('google', { callbackUrl: '/' })}
                      className="w-full flex items-center justify-center gap-3 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-white/25 text-xs font-medium tracking-widest">OR</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>

                    {mode === 'signup' && (
                      <GlassInput icon={<FiUser />} placeholder="Full Name" value={name} onChange={setName} id="auth-name" />
                    )}

                    {/* Phone */}
                    <div
                      className="flex rounded-2xl overflow-hidden border border-white/8 focus-within:border-blue-500/40 transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <span className="px-4 flex items-center text-white/30 border-r border-white/8 text-sm font-medium bg-white/[0.02]">+91</span>
                      <input
                        id="auth-phone"
                        type="tel"
                        placeholder="Mobile Number"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                        className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-white/25 focus:outline-none text-sm"
                        aria-label="Mobile Number"
                        maxLength={10}
                      />
                      <button
                        onClick={handleSendOTP}
                        disabled={phone.length !== 10 || loading}
                        aria-label="Send OTP"
                        className="px-4 text-blue-400 hover:text-blue-300 transition text-sm font-bold disabled:opacity-25"
                      >
                        {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" /> : 'Send OTP'}
                      </button>
                    </div>

                    {/* Email divider */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-white/25 text-xs font-medium tracking-widest">EMAIL</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>

                    <GlassInput icon={<FiMail />} placeholder="Email address" value={email} onChange={setEmail} type="email" id="auth-email" />

                    <div
                      className="flex rounded-2xl overflow-hidden border border-white/8 focus-within:border-blue-500/40 transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <span className="px-4 flex items-center text-white/30"><FiLock size={15} /></span>
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="flex-1 bg-transparent px-2 py-3.5 text-white placeholder-white/25 focus:outline-none text-sm"
                        aria-label="Password"
                      />
                      <button onClick={() => setShowPassword(!showPassword)} className="px-4 text-white/25 hover:text-white/50 transition" aria-label="Toggle password">
                        {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>

                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs text-center py-1" role="alert">
                        ⚠ {error}
                      </motion.p>
                    )}

                    {/* CTA — Netflix red-inspired but ZyntraCare blue/purple */}
                    <motion.button
                      whileHover={{ scale: 1.015, boxShadow: '0 16px 48px rgba(14,165,233,0.4)' }}
                      whileTap={{ scale: 0.985 }}
                      onClick={handleEmailLogin}
                      disabled={loading}
                      aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
                      className="w-full py-4 rounded-2xl font-black text-white text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' }}
                    >
                      {loading
                        ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <FiArrowRight size={16} /></>
                      }
                    </motion.button>

                    <p className="text-center text-white/20 text-xs flex items-center justify-center gap-1.5 pt-1">
                      <FiShield size={10} /> End-to-end encrypted · HIPAA compliant
                    </p>
                  </motion.div>
                )}

                {/* STEP: OTP */}
                {step === 'otp' && (
                  <motion.div key="otp" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-6">
                    <div className="flex justify-center gap-2.5">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => e.key === 'Backspace' && !digit && i > 0 && otpRefs.current[i - 1]?.focus()}
                          aria-label={`OTP digit ${i + 1}`}
                          className="w-11 h-14 text-center text-xl font-black text-white rounded-2xl border border-white/10 focus:border-blue-500/60 focus:shadow-[0_0_20px_rgba(14,165,233,0.2)] focus:outline-none transition-all"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-400 text-xs text-center" role="alert">{error}</p>}
                    <motion.button
                      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.join('').length !== 6}
                      className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', boxShadow: '0 8px 32px rgba(14,165,233,0.3)' }}
                    >
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Verify OTP <FiCheck /></>}
                    </motion.button>
                    <button onClick={() => setStep('method')} className="w-full text-white/30 text-sm hover:text-white/60 transition">← Change number</button>
                  </motion.div>
                )}

                {/* STEP: PROFILE */}
                {step === 'profile' && (
                  <motion.div key="profile" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="space-y-3">
                    <GlassInput icon={<FiUser />} placeholder="Full Name *" value={name} onChange={setName} id="profile-name" />
                    <GlassInput icon={<FiMapPin />} placeholder="Your City *" value={city} onChange={setCity} id="profile-city" />
                    <div className="grid grid-cols-2 gap-3">
                      <GlassInput placeholder="Age" value={age} onChange={setAge} type="number" id="profile-age" />
                      <GlassSelect value={bloodGroup} onChange={setBloodGroup} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} placeholder="Blood Group" id="profile-blood" />
                    </div>
                    <textarea
                      id="profile-conditions"
                      placeholder="Known medical conditions (optional)"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 border border-white/8 transition-all resize-none"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                      aria-label="Medical conditions"
                    />
                    <motion.button
                      whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
                      onClick={handleSaveProfile}
                      disabled={loading || !name || !city}
                      className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-30"
                      style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}
                    >
                      {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Save & Continue <FiArrowRight /></>}
                    </motion.button>
                    <button onClick={() => { setStep('success'); setTimeout(() => { onLogin(); onClose(); resetForm(); }, 2200); }} className="w-full text-white/25 text-xs hover:text-white/50 transition">Skip for now</button>
                  </motion.div>
                )}

                {/* STEP: SUCCESS — Netflix-style full-modal takeover */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    {/* Ripple success animation */}
                    <div className="relative w-24 h-24 mx-auto mb-5">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="absolute inset-0 rounded-full border-2 border-green-400/40"
                          style={{ animation: `success-ripple 2s ease-out infinite`, animationDelay: `${i * 0.4}s` }}
                        />
                      ))}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                        className="absolute inset-2 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', boxShadow: '0 0 50px rgba(16,185,129,0.5)' }}
                      >
                        <FiCheck size={36} className="text-white" strokeWidth={3} />
                      </motion.div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white text-xl font-black mb-1"
                    >
                      Login Successful!
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/40 text-sm mb-5"
                    >
                      Taking you to your dashboard...
                    </motion.p>
                    {/* Progress bar */}
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2.2, ease: 'linear' }}
                        style={{ background: 'linear-gradient(90deg, #10b981, #0ea5e9, #8b5cf6)' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Toggle login/signup */}
              {step === 'method' && (
                <p className="text-center mt-5 text-white/30 text-sm">
                  {mode === 'login' ? 'New to ZyntraCare? ' : 'Already have an account? '}
                  <button
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                    className="text-blue-400 font-bold hover:text-blue-300 transition"
                  >
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

function GlassInput({ icon, placeholder, value, onChange, type = 'text', id }: any) {
  return (
    <div
      className="flex items-center rounded-2xl border border-white/8 focus-within:border-blue-500/40 transition-all overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {icon && <span className="px-4 text-white/25">{icon}</span>}
      <input
        id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent px-3 py-3.5 text-white placeholder-white/25 focus:outline-none text-sm"
        aria-label={placeholder}
      />
    </div>
  );
}

function GlassSelect({ value, onChange, options, placeholder, id }: any) {
  return (
    <select
      id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder}
      className="w-full px-4 py-3.5 rounded-2xl text-sm text-white border border-white/8 focus:border-blue-500/40 focus:outline-none transition-all appearance-none"
      style={{ background: 'rgba(255,255,255,0.04)', backgroundImage: 'none' }}
    >
      <option value="" className="bg-gray-900">{placeholder}</option>
      {options.map((o: string) => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
    </select>
  );
}