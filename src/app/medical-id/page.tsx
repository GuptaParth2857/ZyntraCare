'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShield, FiUser, FiCalendar, FiDroplet, FiHeart, FiAlertCircle, FiDownload, FiShare2, FiEdit2 } from 'react-icons/fi';

export default function MedicalIDPage() {
  const [showDetails, setShowDetails] = useState(false);

  const patientInfo = {
    name: 'Guest User',
    bloodGroup: 'A+',
    dob: '01/01/1990',
    height: '175 cm',
    weight: '72 kg',
    allergies: ['Penicillin', 'Pollen'],
    emergencyContact: '+91-9876543210',
    conditions: ['None reported'],
    organDonor: true,
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-3xl mb-4">
            <FiShield size={32} className="text-blue-400" />
          </div>
          <h1 className="text-4xl font-black mb-2">Medical ID</h1>
          <p className="text-gray-400 text-sm">Your emergency-ready medical identity card</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              <FiUser size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{patientInfo.name}</h2>
              <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><FiCalendar size={12} /> DOB: {patientInfo.dob}</p>
              <span className="inline-block mt-1 px-3 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-full border border-blue-500/30">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <FiDroplet className="text-red-400 mx-auto mb-1" size={20} />
              <p className="text-xs text-gray-500">Blood Type</p>
              <p className="font-bold text-lg">{patientInfo.bloodGroup}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <FiHeart className="text-green-400 mx-auto mb-1" size={20} />
              <p className="text-xs text-gray-500">Organ Donor</p>
              <p className="font-bold text-lg">{patientInfo.organDonor ? 'Yes' : 'No'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="text-lg block mb-1">📏</span>
              <p className="text-xs text-gray-500">Height</p>
              <p className="font-bold text-lg">{patientInfo.height}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <span className="text-lg block mb-1">⚖️</span>
              <p className="text-xs text-gray-500">Weight</p>
              <p className="font-bold text-lg">{patientInfo.weight}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1"><FiAlertCircle size={12} /> Allergies</p>
              <p className="text-sm">{patientInfo.allergies.join(', ') || 'None'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-1">Emergency Contact</p>
              <p className="text-sm">{patientInfo.emergencyContact}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition flex items-center justify-center gap-2">
              <FiDownload size={14} /> Download
            </button>
            <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2">
              <FiShare2 size={14} /> Share
            </button>
            <Link href="/health-id" className="flex-1 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold text-sm hover:bg-purple-500/30 transition flex items-center justify-center gap-2">
              <FiEdit2 size={14} /> Full Health ID
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Link href="/dashboard" className="text-gray-500 hover:text-white text-sm underline underline-offset-4 transition">
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
