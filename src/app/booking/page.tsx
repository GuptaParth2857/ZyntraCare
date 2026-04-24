'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  FiSearch, FiMapPin, FiCalendar, FiClock, FiFilter,
  FiCheck, FiArrowLeft, FiArrowRight, FiUser, FiPhone,
  FiStar, FiActivity, FiAlertCircle
} from 'react-icons/fi';
import { MdLocalHospital, MdEmergency } from 'react-icons/md';
import { FaAmbulance } from 'react-icons/fa';

const AnimatedBackground = dynamic(() => import('@/components/AnimatedBackground'), { ssr: false });

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Noida', 'Gurugram'];
const SPECIALTIES = ['Cardiology', 'Orthopedics', 'Oncology', 'Neurology', 'Pediatrics', 'Gynecology', 'Gastroenterology', 'Nephrology', 'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'Urology', 'Endocrinology', 'Pulmonology'];
const APPOINTMENT_TYPES = ['In-Person Consultation', 'Video Consultation', 'Home Visit', 'Emergency'];
const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

interface Hospital {
  id: string; name: string; city: string; type: string; rating: number;
  beds: { available: number; icu: number }; specialties: string[]; phone: string;
  emergency: boolean; ambulance: boolean; verified: boolean; waitTime: string;
  location: { lat: number; lng: number };
}

function HospitalCard({ hospital, onSelect, selected }: { hospital: Hospital; onSelect: (h: Hospital) => void; selected: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(hospital)}
      className={`cursor-pointer border rounded-2xl p-5 transition-all ${selected ? 'border-blue-500/60 bg-blue-500/5' : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900/70'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${hospital.type === 'Government' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
            <MdLocalHospital size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base leading-tight">{hospital.name}</h3>
              {hospital.verified && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full font-bold">✓ Verified</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><FiMapPin size={11} />{hospital.city}</span>
              <span className="text-gray-600">•</span>
              <span className={hospital.type === 'Government' ? 'text-emerald-400' : 'text-blue-400'}>{hospital.type}</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1 text-yellow-400"><FiStar size={11} fill="currentColor" />{hospital.rating}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hospital.specialties.slice(0, 3).map(s => (
                <span key={s} className="text-[11px] bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {hospital.specialties.length > 3 && <span className="text-[11px] text-gray-500">+{hospital.specialties.length - 3}</span>}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-emerald-400 text-sm font-bold">{hospital.beds.available} beds free</div>
          <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-1 justify-end"><FiClock size={10} />{hospital.waitTime}</div>
          <div className="flex gap-1.5 mt-2 justify-end">
            {hospital.emergency && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><MdEmergency size={10} />24/7</span>}
            {hospital.ambulance && <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full font-bold">🚑</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OTPModal({ phone, onVerified, onClose }: { phone: string; onVerified: () => void; onClose: () => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  const sendOTP = async () => {
    const res = await fetch('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
    const data = await res.json();
    if (data.success) {
      setSent(true);
      if (data.devOtp) setDevOtp(data.devOtp);
    } else {
      setError(data.error);
    }
  };

  useEffect(() => { sendOTP(); }, []);

  useEffect(() => {
    if (!sent) return;
    const iv = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(iv);
  }, [sent]);

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    setVerifying(true);
    setError('');
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, action: 'verify', otp: code }),
    });
    const data = await res.json();
    setVerifying(false);
    if (data.verified) onVerified();
    else setError(data.error || 'Incorrect OTP');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9000] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-black text-white mb-2">Verify Phone Number</h3>
        <p className="text-gray-400 text-sm mb-6">OTP sent to <span className="text-white font-semibold">{phone}</span></p>
        {devOtp && <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-400 text-sm">🛠 Dev OTP: <strong>{devOtp}</strong></div>}
        <div className="flex gap-2 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => e.key === 'Backspace' && !digit && i > 0 && document.getElementById(`otp-${i - 1}`)?.focus()}
              maxLength={1}
              className="w-12 h-14 text-center text-2xl font-black bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
        <div className="text-center text-gray-500 text-sm mb-4">
          {timeLeft > 0 ? `Resend in ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : (
            <button onClick={() => { setTimeLeft(300); sendOTP(); }} className="text-blue-400 hover:text-blue-300 font-semibold">Resend OTP</button>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition">Cancel</button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={verifyOTP}
            disabled={verifying || otp.join('').length !== 6}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white font-bold transition"
          >
            {verifying ? 'Verifying...' : 'Verify →'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BookingPage() {
  // Guest mode - no login required
  const session = null;
  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('Delhi');
  const [search, setSearch] = useState('');
  const [appointmentType, setAppointmentType] = useState('In-Person Consultation');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Get available dates (next 14 days)
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ city, limit: '12' });
      if (specialty) params.append('specialty', specialty);
      if (search) params.append('q', search);
      const res = await fetch(`/api/hospitals?${params}`);
      const data = await res.json();
      setHospitals(data.hospitals || []);
    } catch {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [city, specialty]);

  const handleBook = async () => {
    if (!phoneVerified) { setShowOTP(true); return; }
    // Simulate booking
    const id = `BK${Date.now().toString().slice(-8)}`;
    setBookingId(id);
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.08, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-32 left-1/3 w-[600px] h-[600px] bg-emerald-600/25 rounded-full blur-[200px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.12, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-teal-600/18 rounded-full blur-[150px]"
          />
        </div>
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md w-full bg-slate-900/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl p-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-500/30">
            <FiCheck size={36} className="text-white" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-1">Your appointment has been scheduled at</p>
          <p className="text-white font-bold text-lg mb-4">{selectedHospital?.name}</p>
          <div className="bg-black/30 rounded-2xl p-5 mb-6 text-left space-y-2 border border-white/5">
            <div className="flex justify-between"><span className="text-gray-500">Booking ID</span><span className="text-blue-400 font-bold">{bookingId}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-white font-semibold">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="text-white font-semibold">{selectedSlot}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-white font-semibold">{appointmentType}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Specialty</span><span className="text-white font-semibold">{specialty || 'General'}</span></div>
          </div>
          <p className="text-gray-500 text-sm mb-6">Confirmation SMS sent to {patientPhone}</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition text-center">View Dashboard</Link>
            <Link href="/" className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-bold transition text-center">Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <AnimatedBackground theme="indigo" />
      {showOTP && <OTPModal phone={patientPhone} onVerified={() => { setPhoneVerified(true); setShowOTP(false); handleBook(); }} onClose={() => setShowOTP(false)} />}

      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <MdLocalHospital className="text-white text-lg" />
            </div>
            <span className="font-black text-white">ZyntraCare <span className="text-blue-400 font-medium text-sm">/ Book Appointment</span></span>
          </Link>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${step >= n ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500'}`}>{n}</div>
                {n < 3 && <div className={`w-8 h-0.5 rounded ${step > n ? 'bg-blue-600' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Find Hospital ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-3xl font-black text-white mb-2">Find a Hospital</h1>
              <p className="text-gray-400 mb-6">Search across 1000+ verified hospitals in India</p>

              {/* Filters */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiMapPin size={12} /> City</label>
                    <select value={city} onChange={e => setCity(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition appearance-none">
                      {CITIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                  {/* Specialty */}
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiActivity size={12} /> Specialty</label>
                    <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition appearance-none">
                      <option value="" className="bg-slate-900">All Specialties</option>
                      {SPECIALTIES.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                  </div>
                  {/* Search */}
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiSearch size={12} /> Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchHospitals()}
                        placeholder="Hospital name..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                    </div>
                  </div>
                </div>
                <button onClick={fetchHospitals} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-sm font-bold transition">
                  <FiFilter size={14} /> Apply Filters
                </button>
              </div>

              {/* Hospital list */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  {hospitals.map(h => <HospitalCard key={h.id} hospital={h} onSelect={setSelectedHospital} selected={selectedHospital?.id === h.id} />)}
                  {hospitals.length === 0 && <div className="text-center text-gray-500 py-16">No hospitals found. Try a different search.</div>}
                </div>
              )}

              {selectedHospital && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                  <button onClick={() => setStep(2)} className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/30 transition">
                    Book at {selectedHospital.name.split(' ').slice(0, 3).join(' ')}... <FiArrowRight />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Pick Date/Time ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"><FiArrowLeft /> Back</button>
              <h1 className="text-3xl font-black text-white mb-2">Select Date & Time</h1>
              <p className="text-blue-400 font-semibold mb-6">{selectedHospital?.name}</p>

              {/* Appointment Type */}
              <div className="mb-6">
                <label className="text-gray-300 font-semibold text-sm block mb-3">Appointment Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {APPOINTMENT_TYPES.map(t => (
                    <button key={t} onClick={() => setAppointmentType(t)}
                      className={`p-3 rounded-xl border text-sm font-semibold transition ${appointmentType === t ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                      {t === 'Emergency' ? '🚨' : t === 'Video Consultation' ? '📹' : t === 'Home Visit' ? '🏠' : '🏥'} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><FiCalendar size={14} /> Select Date</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => {
                    const str = date.toISOString().split('T')[0];
                    const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                    return (
                      <button key={str} onClick={() => setSelectedDate(str)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-semibold transition whitespace-nowrap ${selectedDate === str ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="mb-8">
                  <label className="text-gray-300 font-semibold text-sm mb-3 flex items-center gap-2"><FiClock size={14} /> Available Slots</label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isBooked = Math.random() < 0.3;
                      return (
                        <button key={slot} onClick={() => !isBooked && setSelectedSlot(slot)} disabled={isBooked}
                          className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition ${isBooked ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/5 text-gray-600' : selectedSlot === slot ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!selectedDate || !selectedSlot}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed px-8 py-4 rounded-2xl font-bold text-lg transition shadow-lg shadow-blue-500/25"
              >
                Continue to Patient Details <FiArrowRight />
              </button>
            </motion.div>
          )}

          {/* ── Step 3: Patient Details ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"><FiArrowLeft /> Back</button>
              <h1 className="text-3xl font-black text-white mb-2">Patient Details</h1>
              <p className="text-gray-400 mb-6">Confirm your booking information</p>

              {/* Booking summary */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-6">
                <h3 className="font-bold text-blue-400 mb-3 text-sm uppercase tracking-wide">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Hospital</span><span className="text-white font-semibold">{selectedHospital?.name.slice(0, 35)}{(selectedHospital?.name?.length || 0) > 35 ? '...' : ''}</span>
                  <span className="text-gray-500">Date</span><span className="text-white font-semibold">{selectedDate}</span>
                  <span className="text-gray-500">Time</span><span className="text-white font-semibold">{selectedSlot}</span>
                  <span className="text-gray-500">Type</span><span className="text-white font-semibold">{appointmentType}</span>
                  <span className="text-gray-500">Specialty</span><span className="text-white font-semibold">{specialty || 'General Medicine'}</span>
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiUser size={12} /> Full Name *</label>
                    <input required value={patientName} onChange={e => setPatientName(e.target.value)}
                      placeholder="Patient's full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiUser size={12} /> Age</label>
                    <input type="number" min="1" max="120" value={patientAge} onChange={e => setPatientAge(e.target.value)}
                      placeholder="Age in years"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1">
                    <FiPhone size={12} /> Phone Number *
                    {phoneVerified && <span className="ml-2 text-emerald-400 text-xs font-bold">✓ Verified</span>}
                  </label>
                  <input value={patientPhone} onChange={e => { setPatientPhone(e.target.value); setPhoneVerified(false); }}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-1"><FiAlertCircle size={12} /> Chief Complaint / Symptoms</label>
                  <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition resize-none" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleBook}
                  disabled={!patientName || !patientPhone}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  {phoneVerified ? <><FiCheck /> Confirm Booking</> : <><FiPhone /> Verify Phone & Confirm</>}
                </motion.button>
                <p className="text-gray-600 text-xs text-center">You will receive an OTP on your phone to confirm this booking</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
