'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertTriangle, FiClock, FiShield, FiUser } from 'react-icons/fi';

export default function SmsEmergencyPage() {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocLoading(false);
        },
        () => {
          setLocation({ lat: 28.6139, lng: 77.209 });
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.209 });
    }
  }, []);

  const handleSendSos = async () => {
    if (!location) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/send-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName || undefined,
          phone: phone || undefined,
          message: message || undefined,
          location,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send SOS');
      setResult(data);
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold mb-4">
            <FiAlertTriangle size={14} /> Emergency SOS
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            SMS{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Emergency</span>{' '}
            Alert
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Send a real-time emergency SMS with your location to alert family or emergency services.
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <FiAlertTriangle className="text-red-400 mt-0.5 shrink-0" size={18} />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {sent && result ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-4">
              <FiCheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">SOS Alert Sent!</h2>
            <p className="text-slate-400 text-sm mb-6">
              {result.demo
                ? 'SMS service not configured. In production, a real SMS would be sent. Here is the alert data:'
                : 'A real SMS has been sent to the emergency contact.'}
            </p>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
              <p className="flex justify-between"><span className="text-slate-400">Patient:</span><span>{result.alert.patient}</span></p>
              <p className="flex justify-between"><span className="text-slate-400">Location:</span><span className="text-emerald-400">{result.alert.location}</span></p>
              <p className="flex justify-between"><span className="text-slate-400">Time:</span><span>{new Date(result.alert.timestamp).toLocaleString('en-IN')}</span></p>
              {result.alert.mapsUrl && (
                <a href={result.alert.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mt-2">
                  <FiMapPin size={14} /> Open in Google Maps
                </a>
              )}
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${result.demo ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              {result.demo ? 'Simulated (API keys required)' : 'Real SMS Sent via Twilio'}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <FiAlertTriangle className="text-amber-400 shrink-0" size={20} />
              <p className="text-amber-300 text-sm">This sends a real SMS via Twilio. Configure <code className="bg-black/30 px-1 rounded text-xs">TWILIO_ACCOUNT_SID</code>, <code className="bg-black/30 px-1 rounded text-xs">TWILIO_AUTH_TOKEN</code>, <code className="bg-black/30 px-1 rounded text-xs">TWILIO_PHONE_NUMBER</code>, and <code className="bg-black/30 px-1 rounded text-xs">EMERGENCY_ALERT_PHONE</code> in <code className="bg-black/30 px-1 rounded text-xs">.env.local</code> for real SMS. Without them, it shows a simulated alert.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><FiUser size={12} /> Patient Name</label>
                <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Your name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><FiPhone size={12} /> Emergency Contact Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+919XXXXXXXXX" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><FiSend size={12} /> Emergency Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe the emergency..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-500/50 transition-colors" />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-sm text-slate-400 flex items-center gap-2">
                  <FiMapPin size={14} className="text-red-400" />
                  {locLoading ? 'Fetching location...' : location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Location unavailable'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><FiClock size={12} /> Auto-detected</span>
              </div>

              <button onClick={handleSendSos} disabled={sending || !location} className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl font-bold text-lg hover:from-red-500 hover:to-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                {sending ? (
                  <><span className="animate-pulse">Sending SOS...</span></>
                ) : (
                  <><FiSend size={20} /> Send Emergency SMS</>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
                <FiShield size={14} /> Your location is sent only when you press send.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
