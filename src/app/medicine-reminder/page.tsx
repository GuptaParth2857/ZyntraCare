'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiClock, FiBell, FiPlus, FiTrash2, FiCheck, FiInfo, FiLock, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  times: string[];
  days: string[];
  enabled: boolean;
  taken: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MedicineReminderPage() {
  const { data: session, status } = useSession();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [newReminder, setNewReminder] = useState({
    medicineName: '', dosage: '', time: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === '1';
  const userId = demoMode ? 'demo-user' : (session?.user as any)?.id || '';
  const isAuthenticated = demoMode || status === 'authenticated';

  const mapReminder = (r: any): Reminder => ({
    id: r.id,
    medicineName: r.medicineName,
    dosage: r.dosage,
    times: Array.isArray(r.times) && r.times.length ? r.times : ['09:00'],
    days: Array.isArray(r.days) && r.days.length ? r.days : [],
    enabled: r.enabled,
    taken: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`/api/medicine-reminders${demoMode ? '?userId=demo-user' : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.reminders) {
          setReminders(data.reminders.map(mapReminder));
          setError('');
        } else if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => setError('Failed to load reminders'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, demoMode]);

  const addReminder = async () => {
    setError('');
    if (!newReminder.medicineName || !newReminder.time) {
      setError('Medicine name and time are required');
      return;
    }
    try {
      const res = await fetch('/api/medicine-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          medicine: newReminder.medicineName,
          dosage: newReminder.dosage,
          times: [newReminder.time],
          days: newReminder.days,
          startDate: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to create reminder');
        return;
      }
      setReminders(prev => [mapReminder(data.reminder), ...prev]);
      setNewReminder({ medicineName: '', dosage: '', time: '', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
      setShowAdd(false);
    } catch (err) {
      setError('Failed to create reminder');
    }
  };

  const toggleReminder = async (reminder: Reminder) => {
    setError('');
    const next = !reminder.enabled;
    setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, enabled: next } : r));
    try {
      const res = await fetch(`/api/medicine-reminders?id=${reminder.id}${demoMode ? '&userId=demo-user' : ''}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reminder.id, isActive: next }),
      });
      if (!res.ok) {
        setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, enabled: !next } : r));
        setError((await res.json().catch(() => ({}))).error || 'Failed to update reminder');
      }
    } catch (err) {
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, enabled: !next } : r));
      setError('Failed to update reminder');
    }
  };

  const toggleTaken = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, taken: !r.taken } : r));
  };

  const deleteReminder = async (id: string) => {
    setError('');
    try {
      const res = await fetch(`/api/medicine-reminders?id=${id}${demoMode ? '&userId=demo-user' : ''}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to delete reminder');
        return;
      }
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete reminder');
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-teal-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Medicine Reminder</span>
            </h1>
            <p className="text-gray-400 mt-2">Never miss a dose — saved to your account</p>
          </div>
          {isAuthenticated && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowAdd(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <FiPlus size={16} /> Add Reminder
            </motion.button>
          )}
        </motion.div>

        {!isAuthenticated && status !== 'loading' ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white/[0.03] border border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-xl">
            <div className="w-14 h-14 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5">
              <FiLock className="text-emerald-400" size={24} />
            </div>
            <h2 className="text-2xl font-black mb-2">Private to your account</h2>
            <p className="text-white/50 text-sm mb-8">Your medication schedule is stored with your account. Sign in to keep your reminders safe and in sync.</p>
            <Link href="/auth/signin" className="inline-flex px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-sm hover:from-emerald-500 hover:to-teal-500 transition">
              Sign In
            </Link>
            <p className="text-white/20 text-xs mt-4">Hot preview at <span className="font-mono text-white/40">/medicine-reminder?demo=1</span></p>
          </motion.div>
        ) : status === 'loading' ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <FiLoader className="animate-spin text-emerald-400" size={32} />
            <p className="text-white/40 text-sm">Loading your reminders…</p>
          </div>
        ) : (
          <>
            {demoMode && (
              <div className="max-w-3xl mx-auto mb-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-sm font-bold">
                <FiInfo size={16} className="flex-shrink-0" />
                Viewing demo dataset. Sign in to manage your own reminders.
              </div>
            )}

            {error && (
              <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
                <FiAlertCircle className="text-red-400 flex-shrink-0" />
                <p className="text-red-400/90 text-sm font-medium">{error}</p>
                <button onClick={() => { setError(''); }} className="ml-auto px-3 py-1 bg-red-500/20 rounded-lg text-red-400 text-xs font-bold hover:bg-red-500/30 transition">Dismiss</button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16 text-gray-400">Loading your reminders...</div>
            ) : reminders.length === 0 ? (
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
                          <p className="text-gray-400 text-sm">{reminder.dosage} • {reminder.times.join(' · ')}</p>
                          {reminder.days.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {DAYS.map(d => (
                                <span key={d} className={`text-[10px] px-1.5 py-0.5 rounded ${reminder.days.includes(d) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-600'}`}>{d}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleTaken(reminder.id)} title="Mark as taken (this device)"
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${reminder.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                          <FiCheck size={18} />
                        </button>
                        <button onClick={() => toggleReminder(reminder)} title={reminder.enabled ? 'Pause' : 'Activate'}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${reminder.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
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
          </>
        )}
      </div>

      {showAdd && isAuthenticated && (
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
                    <button key={d} type="button" onClick={() => setNewReminder({
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