'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDroplet, FiSearch, FiMapPin, FiPhone, FiClock, FiUser, FiHeart, FiFilter, FiAlertCircle, FiCheckCircle, FiShare2, FiBell } from 'react-icons/fi';

interface BloodDonor {
  id: string;
  name: string;
  bloodType: string;
  location: string;
  distance: string;
  phone: string;
  available: boolean;
  lastDonated: string;
  donations: number;
  verified: boolean;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MOCK_DONORS: BloodDonor[] = [
  { id: '1', name: 'Rahul S.', bloodType: 'O-', location: 'HSR Layout, Bangalore', distance: '1.2km', phone: '9876543210', available: true, lastDonated: '45 days ago', donations: 12, verified: true },
  { id: '2', name: 'Priya M.', bloodType: 'A+', location: 'Koramangala, Bangalore', distance: '2.5km', phone: '9876543211', available: true, lastDonated: '90 days ago', donations: 8, verified: true },
  { id: '3', name: 'Amit K.', bloodType: 'B+', location: 'Indiranagar, Bangalore', distance: '3.8km', phone: '9876543212', available: false, lastDonated: '30 days ago', donations: 15, verified: true },
  { id: '4', name: 'Sneha R.', bloodType: 'AB+', location: 'Whitefield, Bangalore', distance: '5.2km', phone: '9876543213', available: true, lastDonated: '120 days ago', donations: 5, verified: true },
  { id: '5', name: 'Vikram J.', bloodType: 'O+', location: 'JP Nagar, Bangalore', distance: '4.1km', phone: '9876543214', available: true, lastDonated: '60 days ago', donations: 20, verified: true },
  { id: '6', name: 'Anjali P.', bloodType: 'A-', location: 'MG Road, Bangalore', distance: '2.0km', phone: '9876543215', available: true, lastDonated: '75 days ago', donations: 7, verified: false },
  { id: '7', name: 'Rajesh T.', bloodType: 'B-', location: ' Bannerghatta, Bangalore', distance: '6.5km', phone: '9876543216', available: false, lastDonated: '25 days ago', donations: 3, verified: true },
  { id: '8', name: 'Meera S.', bloodType: 'AB-', location: 'City Market, Bangalore', distance: '1.8km', phone: '9876543217', available: true, lastDonated: '180 days ago', donations: 10, verified: true },
];

export default function BloodDonorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlood, setSelectedBlood] = useState<string>('');
  const [donors, setDonors] = useState<BloodDonor[]>(MOCK_DONORS);
  const [showRequest, setShowRequest] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [requestForm, setRequestForm] = useState({ name: '', phone: '', bloodType: '', urgency: 'normal', location: '', message: '' });
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = !searchQuery || donor.location.toLowerCase().includes(searchQuery.toLowerCase()) || donor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBlood = !selectedBlood || donor.bloodType === selectedBlood;
    return matchesSearch && matchesBlood;
  });

  const handleRequest = () => {
    setRequestSent(true);
    setTimeout(() => {
      setShowRequest(false);
      setRequestSent(false);
      setRequestForm({ name: '', phone: '', bloodType: '', urgency: 'normal', location: '', message: '' });
    }, 3000);
  };

  const bloodTypeColors: Record<string, string> = {
    'A+': 'bg-red-100 text-red-700 border-red-200',
    'A-': 'bg-red-50 text-red-600 border-red-100',
    'B+': 'bg-orange-100 text-orange-700 border-orange-200',
    'B-': 'bg-orange-50 text-orange-600 border-orange-100',
    'AB+': 'bg-purple-100 text-purple-700 border-purple-200',
    'AB-': 'bg-purple-50 text-purple-600 border-purple-100',
    'O+': 'bg-blue-100 text-blue-700 border-blue-200',
    'O-': 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-900 via-slate-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <FiDroplet className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Blood Donor Network</h1>
              <p className="text-red-300">Real-time blood donors in your area</p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
            >
              <p className="text-3xl font-black text-red-400">{donors.filter(d => d.available).length}</p>
              <p className="text-xs text-gray-400">Available Now</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
            >
              <p className="text-3xl font-black text-emerald-400">{donors.length}</p>
              <p className="text-xs text-gray-400">Total Donors</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
            >
              <p className="text-3xl font-black text-blue-400">{donors.reduce((a, d) => a + d.donations, 0)}</p>
              <p className="text-xs text-gray-400">Total Donations</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4"
            >
              <p className="text-3xl font-black text-purple-400">{donors.filter(d => d.verified).length}</p>
              <p className="text-xs text-gray-400">Verified Donors</p>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {BLOOD_GROUPS.map(blood => (
                <button
                  key={blood}
                  onClick={() => setSelectedBlood(selectedBlood === blood ? '' : blood)}
                  className={`px-4 py-3 rounded-xl font-bold transition ${
                    selectedBlood === blood
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {blood}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRequest(true)}
              className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-bold flex items-center gap-2"
            >
              <FiAlertCircle /> Request Blood
            </button>
          </motion.div>
        </div>
      </div>

      {/* Donors List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Nearby Donors ({filteredDonors.length})</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FiFilter /> Filtered
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDonors.map((donor, index) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 hover:border-red-500/30 transition"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${bloodTypeColors[donor.bloodType]}`}>
                    {donor.bloodType}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{donor.name}</h3>
                      {donor.verified && <FiCheckCircle className="text-emerald-400" size={14} />}
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <FiMapPin size={12} /> {donor.location}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{donor.distance} away</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${donor.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {donor.available ? 'Available' : 'Busy'}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Last Donated</p>
                    <p className="font-medium">{donor.lastDonated}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Donations</p>
                    <p className="font-medium">{donor.donations}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${donor.phone}`}
                    className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-red-500/30 transition"
                  >
                    <FiPhone size={16} /> Call
                  </a>
                  <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition">
                    <FiShare2 size={16} /> Share
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDonors.length === 0 && (
          <div className="text-center py-16">
            <FiDroplet className="text-6xl text-gray-700 mx-auto mb-4" />
            <p className="text-xl font-bold">No donors found</p>
            <p className="text-gray-400">Try changing your filters or request blood</p>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !requestSent && setShowRequest(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-3xl border border-white/10 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {requestSent ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheckCircle className="text-emerald-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold">Request Sent!</h3>
                  <p className="text-gray-400 mt-2">Donors in your area will be notified</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <FiAlertCircle className="text-red-400" /> Request Blood
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Patient Name *</label>
                      <input
                        type="text"
                        value={requestForm.name}
                        onChange={(e) => setRequestForm({...requestForm, name: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                        placeholder="Patient's name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400">Blood Type *</label>
                        <select
                          value={requestForm.bloodType}
                          onChange={(e) => setRequestForm({...requestForm, bloodType: e.target.value})}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Urgency</label>
                        <select
                          value={requestForm.urgency}
                          onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}
                          className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="urgent">Urgent</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Location *</label>
                      <input
                        type="text"
                        value={requestForm.location}
                        onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                        placeholder="Hospital/Address"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Contact Phone *</label>
                      <input
                        type="tel"
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm({...requestForm, phone: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white"
                        placeholder="10-digit phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Message (Optional)</label>
                      <textarea
                        value={requestForm.message}
                        onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white h-24"
                        placeholder="Additional details..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRequest(false)}
                        className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRequest}
                        disabled={!requestForm.name || !requestForm.bloodType || !requestForm.location || !requestForm.phone}
                        className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl font-bold disabled:opacity-50"
                      >
                        Send Request
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}