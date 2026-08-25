'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUser, FiPhone, FiAlertCircle, FiDownload, FiShare2 } from 'react-icons/fi';
import QRCode from 'qrcode';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyCardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    fullName: '',
    bloodGroup: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
  });
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generated, setGenerated] = useState(false);

  const generateCard = async () => {
    if (!form.fullName || !form.bloodGroup || !form.emergencyContact || !form.emergencyPhone) return;

    const info = {
      name: form.fullName,
      blood: form.bloodGroup,
      allergies: form.allergies || 'None',
      emergencyContact: form.emergencyContact,
      emergencyPhone: form.emergencyPhone,
      conditions: form.medicalConditions || 'None',
    };

    try {
      const dataUrl = await QRCode.toDataURL(JSON.stringify(info), {
        width: 250,
        margin: 2,
        color: { dark: '#0d9488', light: '#00000000' },
      });
      setQrDataUrl(dataUrl);
      setGenerated(true);
    } catch {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#0d9488';
          ctx.fillRect(0, 0, 200, 200);
          setQrDataUrl(canvas.toDataURL());
        }
      }
    }
  };

  const downloadCard = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = 'scale(1)';
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      bloodGroup: '',
      allergies: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalConditions: '',
    });
    setQrDataUrl('');
    setGenerated(false);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-transparent to-yellow-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]" />
      </div>

      <canvas ref={canvasRef} width={200} height={200} className="hidden" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
            <FiShield size={32} className="text-amber-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">
              Emergency QR Card
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Create a medical QR card with your emergency information for quick access.
          </p>
        </motion.div>

        {!generated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Blood Group *</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="" className="bg-slate-900">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg} className="bg-slate-900">{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Emergency Phone *</label>
                  <input
                    type="tel"
                    value={form.emergencyPhone}
                    onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                    placeholder="Emergency contact number"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Emergency Contact Name *</label>
                  <input
                    type="text"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    placeholder="Contact person name"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Allergies</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Medical Conditions</label>
                <textarea
                  value={form.medicalConditions}
                  onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                  placeholder="e.g. Diabetes, Asthma, Hypertension"
                  rows={3}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={generateCard}
                disabled={!form.fullName || !form.bloodGroup || !form.emergencyContact || !form.emergencyPhone}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl font-bold text-lg disabled:opacity-50 hover:from-amber-500 hover:to-yellow-500 transition-all"
              >
                Generate QR Card
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div
              ref={cardRef}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                  <FiShield size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Emergency Medical Card</h2>
                  <p className="text-amber-400 text-sm">Show this to emergency responders</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-bold flex items-center gap-2"><FiUser className="text-amber-400" /> {form.fullName}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                    <p className="font-bold text-lg text-red-400">{form.bloodGroup}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Allergies</p>
                    <p className="font-bold">{form.allergies || 'None'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Emergency Contact</p>
                    <p className="font-bold">{form.emergencyContact}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Emergency Phone</p>
                    <p className="font-bold flex items-center gap-2"><FiPhone className="text-amber-400" /> {form.emergencyPhone}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Medical Conditions</p>
                    <p className="font-bold">{form.medicalConditions || 'None'}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                {qrDataUrl && (
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <img src={qrDataUrl} alt="Emergency QR Code" className="w-48 h-48" />
                    <p className="text-xs text-gray-500 text-center mt-2">Scan for medical info</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition"
              >
                Create New Card
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex items-start gap-3">
              <FiAlertCircle className="text-amber-400 mt-1 flex-shrink-0" />
              <p className="text-amber-300 text-sm">
                Save this card to your phone or print it. Keep it in your wallet or as a lock screen
                for emergency access. First responders can scan the QR code to get your medical info.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
