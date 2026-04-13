'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPhone, FiHeart, FiAlertCircle, FiPlus, FiX, FiDownload, FiShare2, FiEdit2, FiActivity, FiClock, FiShield } from 'react-icons/fi';
import QRCode from 'qrcode';

interface MedicalInfo {
  name: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  emergencyContact: string;
  emergencyPhone: string;
  dob: string;
  organDonor: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa', 'Aspirin', 'Ibuprofen', 'Latex', 'Peanuts', 'Shellfish', 'Bee Stings'];
const COMMON_CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Epilepsy', 'Kidney Disease', 'None'];

export default function MedicalIDWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    name: '',
    bloodType: '',
    allergies: [],
    medications: [],
    conditions: [],
    emergencyContact: '',
    emergencyPhone: '',
    dob: '',
    organDonor: false,
  });

  const STORAGE_KEY = 'zyntracare_medical_id';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMedicalInfo(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (medicalInfo.name && medicalInfo.bloodType) {
      const qrData = JSON.stringify({
        name: medicalInfo.name,
        blood: medicalInfo.bloodType,
        allergies: medicalInfo.allergies.join(', '),
        conditions: medicalInfo.conditions.join(', '),
        emergency: medicalInfo.emergencyPhone,
        organDonor: medicalInfo.organDonor,
      });
      
      QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      }).then(setQrDataUrl);
    }
  }, [medicalInfo]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicalInfo));
    setIsEditMode(false);
  };

  const toggleAllergy = (item: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      allergies: prev.allergies.includes(item)
        ? prev.allergies.filter(a => a !== item)
        : [...prev.allergies, item],
    }));
  };

  const toggleCondition = (item: string) => {
    setMedicalInfo(prev => ({
      ...prev,
      conditions: prev.conditions.includes(item)
        ? prev.conditions.filter(c => c !== item)
        : [...prev.conditions, item],
    }));
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = 'my-medical-id-qr.png';
      link.href = qrDataUrl;
      link.click();
    }
  };

  const shareInfo = async () => {
    const text = `Emergency Medical ID - ${medicalInfo.name}\nBlood: ${medicalInfo.bloodType}\nAllergies: ${medicalInfo.allergies.join(', ') || 'None'}\nConditions: ${medicalInfo.conditions.join(', ') || 'None'}\nEmergency Contact: ${medicalInfo.emergencyContact} - ${medicalInfo.emergencyPhone}`;
    
    if (navigator.share) {
      await navigator.share({ title: 'My Medical ID', text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Medical info copied to clipboard!');
    }
  };

  const isComplete = medicalInfo.name && medicalInfo.bloodType;

  return (
    <>
      {/* Medical ID Button - hidden on mobile */}
      <div className="hidden md:block">
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[190px] left-6 z-[9998] group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-red-500 rounded-full blur-lg opacity-50" />
          <div className="relative w-[70px] h-[70px] bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
            <FiHeart className="text-white text-3xl" />
          </div>
          {isComplete && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-[9px] font-black">ID</span>
            </div>
          )}
        </div>
        <span className="text-[9px] font-bold text-white mt-2 drop-shadow-lg bg-pink-500/80 px-2 py-1 rounded-full">Medical ID</span>
      </motion.button>
      </div>

      {/* Medical ID Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !isEditMode && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-red-600 p-5 relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
                >
                  <FiX size={16} />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FiHeart className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Medical ID</h2>
                    <p className="text-pink-100 text-sm">Your emergency health card</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {!isComplete ? (
                  /* Setup Prompt */
                  <div className="text-center py-8 space-y-4">
                    <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                      <FiAlertCircle className="text-pink-400 text-4xl" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Create Your Medical ID</h3>
                    <p className="text-gray-400 text-sm">
                      In case of emergency, doctors can scan your QR code to get vital health information instantly.
                    </p>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                      <FiPlus size={18} />
                      Set Up Now
                    </button>
                  </div>
                ) : (
                  <>
                    {/* QR Code Display */}
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 rounded-2xl">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="Medical ID QR Code" className="w-40 h-40" />
                        ) : (
                          <div className="w-40 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                            <span className="text-gray-400">Loading...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-2">Scan for emergency info</p>
                      
                      {/* Quick Info */}
                      <div className="w-full grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400">Blood Type</p>
                          <p className="font-black text-red-400 text-xl">{medicalInfo.bloodType || '?'}</p>
                        </div>
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-gray-400">Organ Donor</p>
                          <p className="font-bold text-pink-400 text-sm">{medicalInfo.organDonor ? 'Yes ✓' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Info Cards */}
                    <div className="space-y-3">
                      {medicalInfo.allergies.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
                          <p className="text-[10px] text-orange-400 font-semibold mb-1 flex items-center gap-1">
                            <FiAlertCircle size={12} /> ALLERGIES
                          </p>
                          <p className="text-white text-sm font-medium">{medicalInfo.allergies.join(', ')}</p>
                        </div>
                      )}
                      
                      {medicalInfo.conditions.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                          <p className="text-[10px] text-yellow-400 font-semibold mb-1 flex items-center gap-1">
                            <FiActivity size={12} /> MEDICAL CONDITIONS
                          </p>
                          <p className="text-white text-sm font-medium">{medicalInfo.conditions.join(', ')}</p>
                        </div>
                      )}

                      {medicalInfo.emergencyContact && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                          <p className="text-[10px] text-blue-400 font-semibold mb-1 flex items-center gap-1">
                            <FiPhone size={12} /> EMERGENCY CONTACT
                          </p>
                          <p className="text-white text-sm font-medium">{medicalInfo.emergencyContact}</p>
                          <p className="text-blue-400 text-sm">{medicalInfo.emergencyPhone}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={downloadQR}
                        className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <FiDownload size={16} /> Save QR
                      </button>
                      <button
                        onClick={shareInfo}
                        className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                      >
                        <FiShare2 size={16} /> Share
                      </button>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="px-4 py-3 bg-pink-500 text-white font-semibold rounded-xl flex items-center justify-center"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </>
                )}

                {/* Edit Mode */}
                {isEditMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 border-t border-white/10 pt-4"
                  >
                    <h3 className="text-white font-bold flex items-center gap-2">
                      <FiEdit2 size={18} /> Edit Medical Info
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={medicalInfo.name}
                          onChange={e => setMedicalInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={medicalInfo.dob}
                          onChange={e => setMedicalInfo(prev => ({ ...prev, dob: e.target.value }))}
                          className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Blood Type *</label>
                      <div className="flex flex-wrap gap-2">
                        {BLOOD_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => setMedicalInfo(prev => ({ ...prev, bloodType: type }))}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                              medicalInfo.bloodType === type
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Allergies</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_ALLERGIES.map(allergy => (
                          <button
                            key={allergy}
                            onClick={() => toggleAllergy(allergy)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                              medicalInfo.allergies.includes(allergy)
                                ? 'bg-orange-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {allergy}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Medical Conditions</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_CONDITIONS.map(condition => (
                          <button
                            key={condition}
                            onClick={() => toggleCondition(condition)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                              medicalInfo.conditions.includes(condition)
                                ? 'bg-yellow-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {condition}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={medicalInfo.emergencyContact}
                          onChange={e => setMedicalInfo(prev => ({ ...prev, emergencyContact: e.target.value }))}
                          className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Phone</label>
                        <input
                          type="tel"
                          value={medicalInfo.emergencyPhone}
                          onChange={e => setMedicalInfo(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                          className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm"
                          placeholder="Phone"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={medicalInfo.organDonor}
                        onChange={e => setMedicalInfo(prev => ({ ...prev, organDonor: e.target.checked }))}
                        className="w-5 h-5 accent-green-500"
                      />
                      <span className="text-green-400 text-sm font-medium flex items-center gap-2">
                        <FiShield size={16} /> I am an organ donor
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold rounded-xl"
                      >
                        Save Medical ID
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
