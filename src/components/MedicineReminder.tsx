'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiClock, FiCheck, FiTrash2, FiEdit2, FiBell, FiAlertCircle, FiGrid } from 'react-icons/fi';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  notes: string;
  color: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
const TIMES = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'];
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed'];

export default function MedicineReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dueReminders, setDueReminders] = useState<Medicine[]>([]);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const STORAGE_KEY = 'zyntracare_medicines';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMedicines(JSON.parse(saved));
    }
    
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVcQNpHW+NueZVY1WYnR/5t1VE9eemH/x4NUJGVxctT/g1c7WYJv09f/k2lKP22L1v+veVhEe4PU/7+BV0F5itb/v4VXRXmJ1f+/hldIdYjU/7+GWEhzh9P/v4dZSHKI0/+Ah1lJcIbT/4CHWklvh9L/f4haR2+H0v9/iFtGcYfS/3+IWkZvh9L/f4haRW+H0v9/iFtFb4fS/3+IWUduh9L/f4hZRG+H0v9/iFlEb4fS/3+IWEBth9L/f4hYP22H0v9/iFg+bYfS/3+IVz1sh9L/f4hWOWyG0v9/iFc4bIbS/3+IVjhrhtL/f4hVOGqF0v9/iFU3aYXS/3+IVTZphtL/f4hUNmiF0v9/iFQ1Z4XS/3+IUzVmhNL/f4hTNWWD0v9/iFM0ZILS/3+IUjRjgtL/f4hR');
  }, []);

  useEffect(() => {
    if (medicines.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    }
  }, [medicines]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      
      const due = medicines.filter(m => {
        const todayKey = `${m.id}_${now.toDateString()}`;
        if (dismissedReminders.has(todayKey)) return false;
        return m.times.includes(currentHour);
      });
      
      setDueReminders(due);
      
      if (due.length > 0 && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [medicines, dismissedReminders]);

  const handleAddMedicine = (medicine: Omit<Medicine, 'id' | 'color'>) => {
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
      color: COLORS[medicines.length % COLORS.length],
    };
    setMedicines([...medicines, newMedicine]);
    setIsAdding(false);
  };

  const handleUpdateMedicine = (id: string, medicine: Omit<Medicine, 'id' | 'color'>) => {
    const existing = medicines.find(m => m.id === id);
    setMedicines(medicines.map(m => 
      m.id === id ? { ...m, ...medicine, color: existing?.color || COLORS[0] } : m
    ));
    setEditingId(null);
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const dismissReminder = (medicine: Medicine) => {
    const todayKey = `${medicine.id}_${new Date().toDateString()}`;
    setDismissedReminders(prev => new Set([...prev, todayKey]));
    setDueReminders(prev => prev.filter(m => m.id !== medicine.id));
  };

  return (
    <>
      {/* Medicine Reminder Button — compact on mobile */}
      <motion.button
        initial={{ scale: 1, transform: 'none' }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[110px] left-2 md:left-6 z-[9998] flex flex-col items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-lg opacity-40" />
          <div className="relative w-12 h-12 md:w-[70px] md:h-[70px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-xl border-2 md:border-4 border-white">
            <FiGrid className="text-white text-lg md:text-3xl" />
          </div>
          {dueReminders.length > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 md:w-7 md:h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white text-[9px] md:text-[11px] font-black">{dueReminders.length}</span>
            </div>
          )}
        </div>
        <span className="text-[8px] md:text-[9px] font-bold text-white mt-1 drop-shadow-lg bg-purple-500/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">Meds</span>
      </motion.button>

      {/* Due Reminder Alert */}
      <AnimatePresence>
        {dueReminders.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[99999] bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 shadow-2xl max-w-sm w-[calc(100vw-32px)]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <FiBell className="text-white text-2xl animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold">Time for your medicine!</h3>
                <p className="text-white/80 text-sm">{dueReminders.map(m => m.name).join(', ')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => dueReminders.forEach(m => dismissReminder(m))}
                className="flex-1 py-2 bg-white text-red-500 font-bold rounded-xl"
              >
                <FiCheck size={16} className="inline mr-1" /> Done
              </button>
              <button
                onClick={() => setDueReminders([])}
                className="flex-1 py-2 bg-white/20 text-white font-semibold rounded-xl"
              >
                Snooze
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medicine Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !isAdding && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiGrid className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Medicine Reminders</h2>
                    <p className="text-purple-100 text-xs">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <FiPlus size={18} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* Add/Edit Form */}
              <AnimatePresence>
                {isAdding && (
                  <MedicineForm
                    onSave={handleAddMedicine}
                    onCancel={() => setIsAdding(false)}
                  />
                )}
              </AnimatePresence>

              {/* Medicine List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {medicines.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiGrid className="text-purple-400 text-2xl" />
                    </div>
                    <p className="text-gray-400">No medicines added yet</p>
                    <button
                      onClick={() => setIsAdding(true)}
                      className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold"
                    >
                      Add Medicine
                    </button>
                  </div>
                ) : (
                  medicines.map(medicine => (
                    <motion.div
                      key={medicine.id}
                      layout
                      className="bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      {editingId === medicine.id ? (
                        <MedicineForm
                          initial={medicine}
                          onSave={(data) => handleUpdateMedicine(medicine.id, data)}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: medicine.color + '20' }}
                            >
                              <FiGrid className="text-xl" style={{ color: medicine.color }} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-bold">{medicine.name}</h4>
                              <p className="text-gray-400 text-sm">{medicine.dosage} • {medicine.frequency}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {medicine.times.map(time => (
                                  <span 
                                    key={time}
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: medicine.color + '20', color: medicine.color }}
                                  >
                                    <FiClock size={10} className="inline mr-1" />{time}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingId(medicine.id)}
                                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-white"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(medicine.id)}
                                className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/30"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {medicine.notes && (
                            <p className="text-gray-500 text-xs mt-2 italic">{medicine.notes}</p>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MedicineForm({ 
  initial, 
  onSave, 
  onCancel 
}: { 
  initial?: Medicine; 
  onSave: (data: Omit<Medicine, 'id' | 'color'>) => void; 
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [dosage, setDosage] = useState(initial?.dosage || '');
  const [frequency, setFrequency] = useState(initial?.frequency || FREQUENCIES[0]);
  const [times, setTimes] = useState<string[]>(initial?.times || [TIMES[0]]);
  const [notes, setNotes] = useState(initial?.notes || '');

  const toggleTime = (time: string) => {
    setTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time].sort()
    );
  };

  const handleSubmit = () => {
    if (!name || !dosage || times.length === 0) return;
    onSave({
      name,
      dosage,
      frequency,
      times,
      startDate: new Date().toISOString(),
      notes,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/10 p-4 bg-slate-800/50"
    >
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Medicine name"
            className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-gray-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={dosage}
            onChange={e => setDosage(e.target.value)}
            placeholder="Dosage (e.g., 500mg)"
            className="bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-gray-500"
          />
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm"
          >
            {FREQUENCIES.map(f => (
              <option key={f} value={f} className="bg-slate-800">{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Reminder Times</label>
          <div className="flex flex-wrap gap-2">
            {TIMES.map(time => (
              <button
                key={time}
                onClick={() => toggleTime(time)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  times.includes(time)
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-gray-500 resize-none"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-white/10 text-white font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name || !dosage || times.length === 0}
            className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl disabled:opacity-50"
          >
            {initial ? 'Update' : 'Add'} Medicine
          </button>
        </div>
      </div>
    </motion.div>
  );
}
