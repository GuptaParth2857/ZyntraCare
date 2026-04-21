'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiCreditCard, FiCheck, FiArrowRight, FiShield, FiFileText, FiActivity } from 'react-icons/fi';

interface Lab {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  tests: string[];
  price: number;
  originalPrice: number;
  discount: number;
  available: boolean;
  duration: string;
}

const MOCK_LABS: Lab[] = [
  { id: '1', name: 'Apollo Diagnostics', location: 'HSR Layout', distance: '1.2km', rating: 4.8, tests: ['Blood Test', 'CBC', 'Lipid Profile'], price: 499, originalPrice: 800, discount: 38, available: true, duration: '24 hours' },
  { id: '2', name: 'Dr. Lal PathLabs', location: 'Koramangala', distance: '2.5km', rating: 4.6, tests: ['Thyroid', 'Diabetes', 'Liver'], price: 699, originalPrice: 1200, discount: 42, available: true, duration: '48 hours' },
  { id: '3', name: 'City Lab', location: 'Indiranagar', distance: '3.0km', rating: 4.5, tests: ['Full Body Checkup'], price: 1499, originalPrice: 2500, discount: 40, available: true, duration: '72 hours' },
  { id: '4', name: 'Sanjeevini Labs', location: 'JP Nagar', distance: '4.1km', rating: 4.7, tests: ['MRI', 'CT Scan'], price: 3499, originalPrice: 5000, discount: 30, available: false, duration: '24 hours' },
];

export default function LabBookingPage() {
  const [labs] = useState<Lab[]>(MOCK_LABS);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', fasting: false });

  const availableLabs = labs.filter(l => l.available);
  
  const totalPrice = selectedTests.length > 0 
    ? selectedTests.length * 299 
    : selectedLab?.price || 0;

  const handleTestToggle = (test: string) => {
    setSelectedTests(prev => 
      prev.includes(test) 
        ? prev.filter(t => t !== test)
        : [...prev, test]
    );
  };

  const bookNow = () => {
    if (!selectedLab || !date || !time || !form.name || !form.phone || !form.email) return;
    setShowPayment(true);
  };

  const confirmBooking = () => {
    setBookingConfirmed(true);
    setShowPayment(false);
  };

  const bookingId = `LB-${Date.now()}`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiCalendar className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Lab Booking</h1>
              <p className="text-violet-200">Book diagnostic tests online</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Lab Selection */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg">Select Lab</h2>
          {availableLabs.map(lab => (
            <motion.div
              key={lab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => { setSelectedLab(lab); setSelectedTests([]); }}
              className={`bg-white rounded-2xl p-4 border-2 cursor-pointer transition ${
                selectedLab?.id === lab.id ? 'border-violet-500' : 'border-transparent'
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{lab.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <FiMapPin size={12} /> {lab.location} • {lab.distance}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-violet-600">₹{lab.price}</p>
                  <p className="text-xs text-slate-400 line-through">₹{lab.originalPrice}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-amber-500">★</span>
                <span className="text-sm font-medium">{lab.rating}</span>
                <span className="text-xs text-slate-400">• {lab.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Selection */}
        {selectedLab && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h2 className="font-bold text-lg">Select Tests</h2>
            <div className="flex flex-wrap gap-2">
              {selectedLab.tests.map(test => (
                <button
                  key={test}
                  onClick={() => handleTestToggle(test)}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    selectedTests.includes(test)
                      ? 'bg-violet-500 text-white'
                      : 'bg-white border'
                  }`}
                >
                  {test}
                </button>
              ))}
            </div>
            {selectedTests.length > 0 && (
              <div className="bg-violet-50 rounded-xl p-3">
                <p className="font-medium">Custom Package: ₹{totalPrice}</p>
                <p className="text-xs text-slate-500">{selectedTests.length} tests selected</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Date & Time */}
        {selectedLab && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h2 className="font-bold text-lg">Select Slot</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white p-3 rounded-xl"
              />
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white p-3 rounded-xl"
              >
                <option value="">Select Time</option>
                <option value="08:00">08:00 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Patient Details */}
        {selectedLab && date && time && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h2 className="font-bold text-lg">Patient Details</h2>
            <input
              placeholder="Patient Name"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full bg-white p-3 rounded-xl"
            />
            <input
              placeholder="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className="w-full bg-white p-3 rounded-xl"
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              className="w-full bg-white p-3 rounded-xl"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.fasting}
                onChange={(e) => setForm({...form, fasting: e.target.checked})}
              />
              <span className="text-sm">Fasting required (8-12 hours)</span>
            </label>
          </motion.div>
        )}

        {/* Book Button */}
        {selectedLab && date && time && form.name && form.phone && form.email && (
          <button
            onClick={bookNow}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            Proceed to Payment <FiArrowRight />
          </button>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCreditCard /> Payment
              </h3>
              
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex justify-between">
                  <span>{selectedLab?.name}</span>
                  <span>₹{totalPrice || selectedLab?.price}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>Service Fee</span>
                  <span>₹49</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{(totalPrice || selectedLab?.price || 0) + 49}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <button className="w-full p-3 bg-violet-500 text-white rounded-xl font-medium">UPI</button>
                <button className="w-full p-3 bg-slate-100 rounded-xl font-medium">Card</button>
                <button className="w-full p-3 bg-slate-100 rounded-xl font-medium">Wallets</button>
              </div>

              <button
                onClick={confirmBooking}
                className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-bold"
              >
                Pay & Book
              </button>
            </motion.div>
          </div>
        )}

        {/* Confirmation */}
        {bookingConfirmed && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-emerald-500 text-4xl" />
              </div>
              <h3 className="text-xl font-bold">Booking Confirmed!</h3>
              <p className="text-slate-500 mt-2">ID: {bookingId}</p>
              <p className="text-sm text-slate-400 mt-1">{selectedLab?.name} • {date} at {time}</p>
              <p className="text-xs text-slate-400 mt-4">SMS & Email sent to patient</p>
              <button onClick={() => setBookingConfirmed(false)} className="w-full mt-6 py-3 bg-slate-100 rounded-xl font-medium">
                Done
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}