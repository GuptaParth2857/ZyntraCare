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

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_reminders');
    if (saved) setReminders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('zyntracare_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addReminder = () => {
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

  const toggleDay = (day: string) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-24">
      <div className="bg-gradient-to-br from-cyan-600 to-blue-700 px-4 pt-20 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><FiClock className="text-white" size={24} /></div>
            <div>
              <h1 className="text-3xl font-black">Medicine Reminders</h1>
              <p className="text-cyan-200 text-sm">Never miss a dose</p>
            </div>
          </div>
          <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center justify-between">
            <span className="font-medium">Active Reminders</span>
            <span className="font-black text-xl">{reminders.filter(r => r.enabled).length}</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <button onClick={() => setShowAdd(true)} className="w-full py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-blue-500/50 transition flex items-center justify-center gap-2 font-bold">
          <FiPlus size={18} /> Add New Reminder
        </button>

        {reminders.length === 0 ? (
          <div className="text-center py-16">
            <FiBell className="text-5xl text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-bold">No reminders set</p>
            <p className="text-gray-500 text-sm mt-1">Add medicine reminders to stay on track</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <motion.div key={reminder.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`bg-slate-900/60 border rounded-2xl p-4 transition ${reminder.taken ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTaken(reminder.id)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition ${reminder.taken ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600 hover:border-blue-400'}`}>
                    {reminder.taken && <FiCheck size={14} className="text-white" />}
                  </button>
                  <div>
                    <h3 className={`font-bold ${reminder.taken ? 'text-gray-500 line-through' : 'text-white'}`}>{reminder.medicineName}</h3>
                    <p className="text-xs text-gray-500">{reminder.dosage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-blue-400">{reminder.time}</span>
                  <button onClick={() => deleteReminder(reminder.id)} className="text-gray-600 hover:text-red-400 p-1 transition"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
                  {DAYS.map(day => (
                    <span key={day} className={`text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold ${reminder.days.includes(day) ? 'bg-blue-500/20 text-blue-400' : 'text-gray-600'}`}>{day}</span>
                  ))}
                </div>
                <button onClick={() => toggleReminder(reminder.id)} className={`text-xs px-2 py-1 rounded-lg font-bold ${reminder.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-500'}`}>
                  {reminder.enabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </motion.div>
          ))
        )}

        <div className="mt-6 text-center">
          <Link href="/medications" className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4 transition">
            Manage full medication list →
          </Link>
        </div>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FiBell /> New Reminder</h3>
            <div className="space-y-4">
              <input value={newReminder.medicineName} onChange={e => setNewReminder({ ...newReminder, medicineName: e.target.value })} placeholder="Medicine name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50" />
              <input value={newReminder.dosage} onChange={e => setNewReminder({ ...newReminder, dosage: e.target.value })} placeholder="Dosage (e.g. 500mg)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50" />
              <input type="time" value={newReminder.time} onChange={e => setNewReminder({ ...newReminder, time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]" />
              <div>
                <p className="text-xs text-gray-500 mb-2 font-bold">Repeat on</p>
                <div className="flex gap-1.5">
                  {DAYS.map(day => (
                    <button key={day} onClick={() => toggleDay(day)} className={`w-9 h-9 rounded-lg text-xs font-bold transition ${newReminder.days.includes(day) ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40' : 'bg-white/5 text-gray-500 border border-white/10'}`}>{day}</button>
                  ))}
                </div>
              </div>
              <button onClick={addReminder} disabled={!newReminder.medicineName || !newReminder.time} className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold disabled:opacity-40 transition">Add Reminder</button>
            </div>
            <button onClick={() => setShowAdd(false)} className="w-full mt-2 text-gray-500 text-sm py-2">Cancel</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
