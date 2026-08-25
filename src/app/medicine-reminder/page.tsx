'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiClock, FiBell, FiPlus, FiTrash2, FiCheck, FiChevronRight, FiAlertCircle, FiPackage } from 'react-icons/fi';

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  days: string[];
  enabled: boolean;
  taken: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MedicineReminderPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicineName: '', dosage: '', time: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_reminders');
    if (saved) setReminders(JSON.parse(saved));

    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => { if (s?.user?.id) { setUserId(s.user.id); fetchReminders(s.user.id); } })
      .catch(() => {});
  }, []);

  const fetchReminders = async (uid: string) => {
    try {
      const res = await fetch(`/api/medicine-reminders?userId=${uid}`);
      const data = await res.json();
      if (data.reminders?.length) {
        setReminders(data.reminders.map((r: any) => ({
          id: r.id,
          medicineName: r.medicine,
          dosage: r.dosage,
          time: Array.isArray(r.times) ? r.times[0] || '09:00' : '09:00',
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          enabled: true,
          taken: false,
        })));
      }
    } catch {}
  };

  useEffect(() => {
    localStorage.setItem('zyntracare_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = async () => {
    if (!newReminder.medicineName || !newReminder.time) return;
    const reminder: Reminder = {
      id: Date.now().toString(),
      medicineName: newReminder.medicineName,
      dosage: newReminder.dosage,
      time: newReminder.time,
      days: newReminder.days,
      enabled: true,
      taken: false,
    };
    setReminders([...reminders, reminder]);

    if (userId) {
      try {
        await fetch('/api/medicine-reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            medicine: newReminder.medicineName,
            dosage: newReminder.dosage,
            times: [newReminder.time],
            startDate: new Date().toISOString(),
          }),
        });
      } catch {}
    }

    setNewReminder({ medicineName: '', dosage: '', time: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
    setShowAdd(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const toggleTaken = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, taken: !r.taken } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black">Medicine Reminder</h1>
            <p className="text-gray-400 mt-1">Never miss a dose</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <FiPlus size={16} /> Add Reminder
          </motion.button>
        </motion.div>

        {reminders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiBell size={32} className="text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">No reminders yet</h2>
            <p className="text-gray-500">Add your first medicine reminder to get started</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder, i) => (
              <motion.div key={reminder.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-slate-900/60 backdrop-blur border rounded-2xl p-5 transition-all ${reminder.enabled ? 'border-white/10' : 'border-white/5 opacity-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                      <FiClock size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{reminder.medicineName}</h3>
                      <p className="text-gray-400 text-sm">{reminder.dosage} • {reminder.time}</p>
                      <div className="flex gap-1 mt-1">
                        {DAYS.map(d => (
                          <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded ${reminder.days.includes(d) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'}`}>{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleTaken(reminder.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${reminder.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                      <FiCheck size={18} />
                    </button>
                    <button onClick={() => toggleReminder(reminder.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${reminder.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                      <FiBell size={16} />
                    </button>
                    <button onClick={() => deleteReminder(reminder.id)} className="w-10 h-10 rounded-xl bg-white/5 text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition flex items-center justify-center">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-md"
          >
            <h2 className="text-2xl font-black mb-6">New Reminder</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Medicine Name</label>
                <input value={newReminder.medicineName} onChange={e => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                  placeholder="e.g. Paracetamol 500mg" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Dosage</label>
                <input value={newReminder.dosage} onChange={e => setNewReminder({ ...newReminder, dosage: e.target.value })}
                  placeholder="e.g. 1 tablet" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Time</label>
                <input type="time" value={newReminder.time} onChange={e => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Days</label>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map(d => (
                    <button key={d} onClick={() => setNewReminder({
                      ...newReminder,
                      days: newReminder.days.includes(d) ? newReminder.days.filter(x => x !== d) : [...newReminder.days, d]
                    })}
                      className={`px-3 py-2 rounded-xl text-sm font-bold transition ${newReminder.days.includes(d) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={addReminder}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold transition"
                >Add Reminder</motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
