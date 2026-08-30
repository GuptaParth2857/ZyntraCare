'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import {
  FiHeart, FiUser, FiPhone, FiAlertCircle, FiPlus, FiX, FiDownload,
  FiShare2, FiEdit2, FiActivity, FiClock, FiShield, FiCheck, FiLink,
  FiSmartphone, FiInfo, FiTrash2
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

interface MedicalInfo {
  name: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContacts: EmergencyContact[];
  doctorName: string;
  doctorPhone: string;
  dob: string;
  organDonor: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'Ibuprofen', 'Latex', 'Peanuts', 'Shellfish', 'Bee Stings', 'Codeine', 'Cephalosporins'];
const COMMON_CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Epilepsy', 'Kidney Disease', 'Thyroid Disorder', 'Arthritis', 'None'];
const COMMON_MEDICATIONS = ['Metformin', 'Amlodipine', 'Atorvastatin', 'Omeprazole', 'Levothyroxine', 'Metoprolol', 'Losartan', 'Albuterol', 'Paracetamol', 'None'];
const RELATIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'];

const DEFAULT_INFO: MedicalInfo = {
  name: '',
  bloodType: '',
  allergies: [],
  medications: [],
  conditions: [],
  emergencyContacts: [
    { name: '', phone: '', relation: 'Spouse' },
    { name: '', phone: '', relation: 'Parent' },
  ],
  doctorName: '',
  doctorPhone: '',
  dob: '',
  organDonor: false,
};

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export default function MedicalIdPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPwaInstructions, setShowPwaInstructions] = useState(false);
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>(DEFAULT_INFO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/medical-id?userId=demo-user')
      .then(res => res.json())
      .then(data => {
        const info = data.medicalInfo || data;
        if (info && info.name) {
          setMedicalInfo({
            ...DEFAULT_INFO,
            ...info,
            emergencyContacts: info.emergencyContacts || DEFAULT_INFO.emergencyContacts,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateQR = useMemo(
    () =>
      debounce(async (info: MedicalInfo) => {
      if (info.name && info.bloodType) {
        const qrData = JSON.stringify({
          name: info.name,
          blood: info.bloodType,
          allergies: info.allergies.join(', '),
          conditions: info.conditions.join(', '),
          medications: info.medications.join(', '),
          emergency: info.emergencyContacts.map(c => `${c.name} (${c.relation}): ${c.phone}`).join(' | '),
          doctor: `${info.doctorName} - ${info.doctorPhone}`,
          organDonor: info.organDonor,
        });
        const url = await QRCode.toDataURL(qrData, {
          width: 280,
          margin: 2,
          color: { dark: '#1e1e2e', light: '#ffffff' },
        });
        setQrDataUrl(url);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (medicalInfo.name && medicalInfo.bloodType) {
      generateQR(medicalInfo);
    }
  }, [medicalInfo, generateQR]);

  const handleSave = () => {
    const info = medicalInfo;
    const contacts = info.emergencyContacts || [];
    fetch('/api/medical-id', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'demo-user',
        bloodGroup: info.bloodType,
        allergies: (info.allergies || []).join(', '),
        medications: (info.medications || []).join(', '),
        conditions: (info.conditions || []).join(', '),
        emergencyContact1: contacts[0]?.name || '',
        emergencyPhone1: contacts[0]?.phone || '',
        emergencyContact2: contacts[1]?.name || '',
        emergencyPhone2: contacts[1]?.phone || '',
        organDonor: info.organDonor,
      }),
    }).catch(() => {});
    setIsEditMode(false);
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = 'zyntracare-medical-id-qr.png';
      link.href = qrDataUrl;
      link.click();
    }
  };

  const copyLink = async () => {
    const text = `Emergency Medical ID - ${medicalInfo.name}\nBlood: ${medicalInfo.bloodType}\nAllergies: ${medicalInfo.allergies.join(', ') || 'None'}\nConditions: ${medicalInfo.conditions.join(', ') || 'None'}\nMedications: ${medicalInfo.medications.join(', ') || 'None'}\nEmergency Contacts: ${medicalInfo.emergencyContacts.filter(c => c.name).map(c => `${c.name} (${c.relation}): ${c.phone}`).join(' | ')}\nDoctor: ${medicalInfo.doctorName} - ${medicalInfo.doctorPhone}\nOrgan Donor: ${medicalInfo.organDonor ? 'Yes' : 'No'}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareInfo = async () => {
    const text = `Emergency Medical ID - ${medicalInfo.name}\nBlood: ${medicalInfo.bloodType}\nAllergies: ${medicalInfo.allergies.join(', ') || 'None'}\nEmergency Contacts: ${medicalInfo.emergencyContacts.filter(c => c.name).map(c => `${c.name}: ${c.phone}`).join(' | ')}`;
    if (navigator.share) {
      await navigator.share({ title: 'My Medical ID - ZyntraCare', text });
    } else {
      await copyLink();
    }
  };

  const toggleAllergy = (item: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      allergies: prev.allergies.includes(item) ? prev.allergies.filter(a => a !== item) : [...prev.allergies, item],
    }));
  };

  const toggleCondition = (item: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      conditions: prev.conditions.includes(item) ? prev.conditions.filter(c => c !== item) : [...prev.conditions, item],
    }));
  };

  const toggleMedication = (item: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      medications: prev.medications.includes(item) ? prev.medications.filter(m => m !== item) : [...prev.medications, item],
    }));
  };

  const updateContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setMedicalInfo(prev => {
      const contacts = [...prev.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
  };

  const addContact = () => {
    setMedicalInfo(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relation: 'Other' }],
    }));
  };

  const removeContact = (index: number) => {
    setMedicalInfo(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }));
  };

  const isComplete = medicalInfo.name && medicalInfo.bloodType;

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.22, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-red-600/20 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 pt-24 pb-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-flex mb-4">
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-red-500/30 rounded-full"
            />
            <div className="relative p-4 bg-red-500/15 border border-red-500/40 rounded-full backdrop-blur-sm">
              <FiHeart size={32} className="text-red-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            ICE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-orange-400">
              Medical ID Card
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            In Case of Emergency — First responders scan your QR code to get vital health information instantly.
          </p>
        </motion.div>

        {/* Call 102 Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <a
            href="tel:102"
            className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-red-500/30 transition-all hover:shadow-red-500/50"
          >
            <FiPhone size={22} className="animate-pulse" />
            Call 102 — Emergency
          </a>
        </motion.div>

        {/* Main Card */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/70 backdrop-blur-2xl border border-red-500/20 rounded-3xl p-12 text-center"
          >
            <div className="w-10 h-10 border-2 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading medical ID...</p>
          </motion.div>
        ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/70 backdrop-blur-2xl border border-red-500/20 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/30">
                <FiHeart size={30} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-red-200 text-xs uppercase tracking-widest font-bold mb-1">ZyntraCare Medical ID</p>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  {medicalInfo.name || 'Your Name'}
                </h2>
                <p className="text-red-200/70 text-sm mt-1">
                  {medicalInfo.dob ? `DOB: ${medicalInfo.dob}` : 'Date of Birth not set'} • {medicalInfo.organDonor ? 'Organ Donor' : 'Not an Organ Donor'}
                </p>
              </div>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${
                  isEditMode
                    ? 'bg-white/20 border-white/30 text-white'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <FiEdit2 size={14} className="inline mr-2" />
                {isEditMode ? 'Done Editing' : 'Edit Info'}
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 md:p-8">
            {/* QR Code Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Medical ID QR Code" className="w-52 h-52" />
                  ) : (
                    <div className="w-52 h-52 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Enter name & blood type to generate QR</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-2 text-center">Scan to access emergency info</p>
                {/* Share Buttons */}
                <div className="flex gap-2 mt-3">
                  <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-red-500/30 transition">
                    {copied ? <FiCheck size={12} className="text-emerald-400" /> : <FiLink size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={downloadQR} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-red-500/30 transition">
                    <FiDownload size={12} /> Download QR
                  </button>
                  <button onClick={shareInfo} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-red-500/30 transition">
                    <FiShare2 size={12} /> Share
                  </button>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1">Blood Type</p>
                  <p className="text-4xl font-black text-red-400">{medicalInfo.bloodType || '?'}</p>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-pink-400/70 uppercase tracking-wider mb-1">Organ Donor</p>
                  <p className="text-xl font-black text-pink-400">{medicalInfo.organDonor ? 'YES ✓' : 'NO'}</p>
                </div>
                <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Doctor</p>
                  <p className="text-white font-bold text-sm">{medicalInfo.doctorName || 'Not set'}</p>
                  <p className="text-red-400 text-sm">{medicalInfo.doctorPhone || ''}</p>
                </div>
              </div>
            </div>

            {/* Emergency Info Sections */}
            <div className="space-y-4 mb-8">
              {/* Allergies */}
              {medicalInfo.allergies.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiAlertCircle size={12} /> Allergies — Critical
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.allergies.map(a => (
                      <span key={a} className="bg-orange-500/20 text-orange-300 text-sm font-semibold px-3 py-1 rounded-full border border-orange-500/30">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditions */}
              {medicalInfo.conditions.filter(c => c !== 'None').length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                  <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiActivity size={12} /> Medical Conditions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.conditions.filter(c => c !== 'None').map(c => (
                      <span key={c} className="bg-yellow-500/20 text-yellow-300 text-sm font-semibold px-3 py-1 rounded-full border border-yellow-500/30">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {medicalInfo.medications.filter(m => m !== 'None').length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FiClock size={12} /> Current Medications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalInfo.medications.filter(m => m !== 'None').map(m => (
                      <span key={m} className="bg-blue-500/20 text-blue-300 text-sm font-semibold px-3 py-1 rounded-full border border-blue-500/30">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {medicalInfo.emergencyContacts.filter(c => c.name).length > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FiPhone size={12} /> Emergency Contacts
                  </p>
                  <div className="space-y-3">
                    {medicalInfo.emergencyContacts.filter(c => c.name).map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">{c.name}</p>
                          <p className="text-emerald-400 text-xs">{c.relation}</p>
                        </div>
                        <a href={`tel:${c.phone}`} className="text-emerald-400 text-sm font-bold hover:underline">{c.phone}</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PWA Instructions */}
            <div className="border-t border-white/10 pt-6">
              <button
                onClick={() => setShowPwaInstructions(!showPwaInstructions)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition mb-3"
              >
                <FiSmartphone size={14} />
                Save to Home Screen for Quick Access
                <FiInfo size={12} />
              </button>
              <AnimatePresence>
                {showPwaInstructions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-sm text-gray-400">
                      <p className="font-bold text-white text-xs uppercase tracking-wider mb-2">How to add to Home Screen:</p>
                      <p><span className="text-red-400 font-bold">iOS Safari:</span> Tap Share icon → Add to Home Screen</p>
                      <p><span className="text-red-400 font-bold">Android Chrome:</span> Tap ⋮ menu → Add to Home Screen</p>
                      <p><span className="text-red-400 font-bold">Desktop:</span> Click the install icon in the address bar</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        )}

        {/* Edit Mode Overlay */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto px-4 py-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <FiEdit2 className="text-red-400" /> Edit Medical ID
                    </h2>
                    <button onClick={() => setIsEditMode(false)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition">
                      <FiX size={16} />
                    </button>
                  </div>

                  {/* Name & DOB */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={medicalInfo.name}
                        onChange={e => setMedicalInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Date of Birth</label>
                      <input
                        type="date"
                        value={medicalInfo.dob}
                        onChange={e => setMedicalInfo(prev => ({ ...prev, dob: e.target.value }))}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition"
                      />
                    </div>
                  </div>

                  {/* Blood Type */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Blood Type *</label>
                    <div className="flex flex-wrap gap-2">
                      {BLOOD_TYPES.map(type => (
                        <button
                          key={type}
                          onClick={() => setMedicalInfo(prev => ({ ...prev, bloodType: type }))}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                            medicalInfo.bloodType === type
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Allergies</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGIES.map(allergy => (
                        <button
                          key={allergy}
                          onClick={() => toggleAllergy(allergy)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            medicalInfo.allergies.includes(allergy)
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {allergy}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Medical Conditions</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_CONDITIONS.map(condition => (
                        <button
                          key={condition}
                          onClick={() => toggleCondition(condition)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            medicalInfo.conditions.includes(condition)
                              ? 'bg-yellow-500 text-white'
                              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Medications */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Current Medications</label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_MEDICATIONS.map(med => (
                        <button
                          key={med}
                          onClick={() => toggleMedication(med)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            medicalInfo.medications.includes(med)
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {med}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs text-gray-400">Emergency Contacts</label>
                      <button onClick={addContact} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
                        <FiPlus size={12} /> Add Contact
                      </button>
                    </div>
                    <div className="space-y-3">
                      {medicalInfo.emergencyContacts.map((contact, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Contact {i + 1}</span>
                            {medicalInfo.emergencyContacts.length > 2 && (
                              <button onClick={() => removeContact(i)} className="text-red-400 hover:text-red-300 transition">
                                <FiTrash2 size={12} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={contact.name}
                              onChange={e => updateContact(i, 'name', e.target.value)}
                              placeholder="Name"
                              className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 transition"
                            />
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={e => updateContact(i, 'phone', e.target.value)}
                              placeholder="Phone"
                              className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 transition"
                            />
                            <select
                              value={contact.relation}
                              onChange={e => updateContact(i, 'relation', e.target.value)}
                              className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 transition"
                            >
                              {RELATIONS.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Doctor Name</label>
                      <input
                        type="text"
                        value={medicalInfo.doctorName}
                        onChange={e => setMedicalInfo(prev => ({ ...prev, doctorName: e.target.value }))}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition"
                        placeholder="Dr. Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Doctor Phone</label>
                      <input
                        type="tel"
                        value={medicalInfo.doctorPhone}
                        onChange={e => setMedicalInfo(prev => ({ ...prev, doctorPhone: e.target.value }))}
                        className="w-full bg-white/5 text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  {/* Organ Donor */}
                  <label className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 cursor-pointer hover:bg-emerald-500/15 transition">
                    <input
                      type="checkbox"
                      checked={medicalInfo.organDonor}
                      onChange={e => setMedicalInfo(prev => ({ ...prev, organDonor: e.target.checked }))}
                      className="w-5 h-5 accent-emerald-500"
                    />
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                      <FiShield size={16} /> I am an organ donor
                    </span>
                  </label>

                  {/* Save / Cancel */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={!medicalInfo.name || !medicalInfo.bloodType}
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-red-500/25"
                    >
                      Save Medical ID
                    </motion.button>
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
