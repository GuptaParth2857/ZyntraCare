'use client';

import { useState, useEffect } from 'react';
import { FiVideo, FiMic, FiMonitor, FiPhone, FiClock, FiUser, FiCalendar, FiMapPin, FiWifi, FiSmartphone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Consultation {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  available: boolean;
  nextSlot: string;
  isRural: boolean;
  languages: string[];
}

export default function TelehealthPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [showRural, setShowRural] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, [selectedSpecialty, showRural]);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/telehealth?specialty=${selectedSpecialty}&rural=${showRural}`);
      const data = await res.json();
      if (data.consultations) {
        setConsultations(data.consultations);
      }
    } catch {
      setConsultations([
        { id: '1', doctorName: 'Dr. Priya Sharma', specialty: 'General Physician', hospital: 'Rural Health Center, UP', available: true, nextSlot: 'Today 4PM', isRural: true, languages: ['Hindi', 'English'] },
        { id: '2', doctorName: 'Dr. Amit Kumar', specialty: 'Cardiologist', hospital: 'District Hospital, Bihar', available: true, nextSlot: 'Tomorrow 10AM', isRural: true, languages: ['Hindi'] },
        { id: '3', doctorName: 'Dr. Sneha Gupta', specialty: 'Dermatologist', hospital: 'City Hospital, Delhi', available: false, nextSlot: 'Next Week', isRural: false, languages: ['English', 'Hindi'] },
        { id: '4', doctorName: 'Dr. Rajesh Patel', specialty: 'Pediatrician', hospital: 'Taluka Hospital, Gujarat', available: true, nextSlot: 'Today 6PM', isRural: true, languages: ['Gujarati', 'Hindi'] },
        { id: '5', doctorName: 'Dr. Lisa Chen', specialty: 'Psychiatrist', hospital: 'Metro Hospital, Mumbai', available: true, nextSlot: 'Today 5PM', isRural: false, languages: ['English', 'Hindi'] },
      ]);
    }
    setLoading(false);
  };

  const specialties = ['all', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Psychiatrist', 'Orthopedic', 'Gynecologist'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mb-4"
          >
            <FiVideo className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            🏥 Telehealth Consultations
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Connect with doctors remotely through video consultations. Designed for rural accessibility with low-bandwidth options.
          </p>
        </div>

        {/* Rural Focus Banner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <FiMapPin className="w-6 h-6 text-teal-400" />
            <div>
              <h3 className="text-teal-400 font-semibold">Rural Health Focus</h3>
              <p className="text-slate-300 text-sm">Prioritizing rural diagnostic accessibility</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-slate-300 text-sm">Show only rural doctors</span>
            <input
              type="checkbox"
              checked={showRural}
              onChange={(e) => setShowRural(e.target.checked)}
              className="w-5 h-5 accent-teal-500"
            />
          </label>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSpecialty === spec
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spec === 'all' ? 'All Specialties' : spec}
            </button>
          ))}
        </div>

        {/* Consultation Cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultations.map((consult, idx) => (
              <motion.div
                key={consult.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-slate-800/50 border rounded-2xl p-5 ${
                  consult.available
                    ? 'border-teal-500/30 hover:border-teal-500/60'
                    : 'border-slate-700 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <FiUser className="w-6 h-6 text-white" />
                  </div>
                  {consult.isRural && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                      <FiMapPin size={12} /> Rural
                    </span>
                  )}
                </div>

                <h3 className="text-white font-semibold mb-1">{consult.doctorName}</h3>
                <p className="text-teal-400 text-sm mb-2">{consult.specialty}</p>
                <p className="text-slate-400 text-xs mb-3 flex items-center gap-1">
                  <FiMapPin size={12} /> {consult.hospital}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {consult.languages.map((lang) => (
                    <span key={lang} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                      {lang}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                  <FiClock className="w-4 h-4" />
                  <span>Next: {consult.nextSlot}</span>
                </div>

                <button
                  disabled={!consult.available}
                  className={`w-full py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    consult.available
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <FiVideo className="w-4 h-4" />
                  {consult.available ? 'Book Consultation' : 'Not Available'}
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-4 gap-4"
        >
          {[
            { icon: FiVideo, title: 'Video Call', desc: 'HD video consultation' },
            { icon: FiMic, title: 'Audio Mode', desc: 'Low-bandwidth option' },
            { icon: FiMonitor, title: 'Screen Share', desc: 'Share reports' },
            { icon: FiSmartphone, title: 'Mobile Ready', desc: 'Works on 2G/3G' },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/30 border border-slate-700 rounded-xl p-4 text-center">
              <feature.icon className="w-8 h-8 text-teal-400 mx-auto mb-2" />
              <h4 className="text-white font-medium">{feature.title}</h4>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Emergency Link */}
        <div className="mt-8 text-center">
          <Link href="/emergency" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium">
            <FiPhone className="w-5 h-5" />
            Emergency? Click Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}