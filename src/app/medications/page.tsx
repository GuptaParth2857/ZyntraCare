'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiUpload, FiClock, FiBell, FiCheck, FiAlertCircle, FiPlus, FiTrash2, FiEdit2, FiShare2, FiRefreshCw } from 'react-icons/fi';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  duration: string;
  notes: string;
  reminderEnabled: boolean;
  taken: boolean[];
}

interface DetectedMedicine {
  name: string;
  confidence: number;
  dosage?: string;
}

export default function MedicationReminderPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [ocrImage, setOcrImage] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedMedicine[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '', dosage: '', frequency: 'Once daily', duration: '7 days', notes: '', reminderEnabled: true,
  });

  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'As needed'];
  const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_medications');
    if (saved) {
      setMedications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('zyntracare_medications', JSON.stringify(medications));
  }, [medications]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setOcrImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runOCR = () => {
    if (!ocrImage) return;
    setAnalyzing(true);
    setTimeout(() => {
      const mockDetected: DetectedMedicine[] = [
        { name: 'Metformin 500mg', confidence: 94, dosage: '500mg' },
        { name: 'Amlodipine 5mg', confidence: 89, dosage: '5mg' },
        { name: 'Aspirin 75mg', confidence: 82, dosage: '75mg' },
      ];
      setDetected(mockDetected);
      setAnalyzing(false);
    }, 2500);
  };

  const addMedication = (med?: DetectedMedicine) => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: med?.name || newMed.name,
      dosage: med?.dosage || newMed.dosage,
      frequency: newMed.frequency,
      time: ['Morning', 'Night'],
      duration: newMed.duration,
      notes: newMed.notes,
      reminderEnabled: newMed.reminderEnabled,
      taken: [false, false],
    };
    setMedications([...medications, newMedication]);
    setShowAdd(false);
    setShowOCR(false);
    setNewMed({ name: '', dosage: '', frequency: 'Once daily', duration: '7 days', notes: '', reminderEnabled: true });
    setOcrImage(null);
    setDetected([]);
  };

  const toggleTaken = (medId: string, doseIndex: number) => {
    setMedications(medications.map(med =>
      med.id === medId
        ? { ...med, taken: med.taken.map((t, i) => i === doseIndex ? !t : t) }
        : med
    ));
  };

  const deleteMed = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const completedToday = medications.filter(m => m.taken.every(Boolean)).length;
  const todayTotal = medications.length * 2;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <div>
                <h1 className="text-3xl font-black">Medication Manager</h1>
                <p className="text-teal-200">Smart reminders & prescription OCR</p>
              </div>
            </div>
          </div>

          {/* Today's Progress */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Today's Progress</span>
              <span className="font-bold">{completedToday * 50}%</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all"
                style={{ width: `${medications.length > 0 ? (completedToday / medications.length) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-teal-200 mt-2">{completedToday} of {medications.length} medications taken</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowOCR(true)}
              className="flex-1 py-3 bg-white text-teal-600 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FiCamera /> Scan Prescription
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Manually
            </button>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Medications List */}
        {medications.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">💊</span>
            <p className="text-xl font-bold mt-4">No medications added</p>
            <p className="text-gray-500">Add medications manually or scan a prescription</p>
          </div>
        ) : (
          medications.map(med => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💊</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{med.name}</h3>
                    <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                    <p className="text-xs text-slate-400 mt-1">{med.duration}</p>
                  </div>
                </div>
                <button onClick={() => deleteMed(med.id)} className="text-red-400 p-2">
                  <FiTrash2 />
                </button>
              </div>

              {/* Dose Times */}
              <div className="flex gap-2 mt-4">
                {med.time.map((time, i) => (
                  <button
                    key={i}
                    onClick={() => toggleTaken(med.id, i)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                      med.taken[i]
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {med.taken[i] ? <FiCheck /> : <FiClock />}
                    {time}
                  </button>
                ))}
              </div>

              {med.notes && (
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  <FiAlertCircle size={12} /> {med.notes}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* OCR Modal */}
      <AnimatePresence>
        {showOCR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowOCR(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCamera /> Scan Prescription
              </h3>
              
              {!ocrImage ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer block">
                  <FiUpload className="text-4xl text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Tap to upload prescription</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  <img src={ocrImage} alt="Prescription" className="w-full rounded-xl" />
                  
                  {analyzing ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
                      <p className="text-slate-500 mt-2">Analyzing prescription...</p>
                    </div>
                  ) : detected.length > 0 ? (
                    <div className="space-y-2">
                      <p className="font-medium">Detected Medicines:</p>
                      {detected.map((med, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-teal-50 rounded-lg">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-xs text-slate-500">{med.confidence}% confidence</p>
                          </div>
                          <button
                            onClick={() => addMedication(med)}
                            className="px-3 py-1 bg-teal-500 text-white rounded-lg text-sm"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={runOCR}
                      className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium"
                    >
                      Run Analysis
                    </button>
                  )}
                </div>
              )}

              <button onClick={() => setShowOCR(false)} className="w-full mt-4 text-slate-500">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Manual Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4">Add Medication</h3>
              <div className="space-y-4">
                <input
                  placeholder="Medicine Name"
                  value={newMed.name}
                  onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <input
                  placeholder="Dosage (e.g., 500mg)"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                >
                  {frequencies.map(f => <option key={f}>{f}</option>)}
                </select>
                <input
                  placeholder="Duration (e.g., 7 days)"
                  value={newMed.duration}
                  onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={newMed.notes}
                  onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
                  className="w-full p-3 border border-slate-200 rounded-xl h-20"
                />
                <button
                  onClick={() => addMedication()}
                  disabled={!newMed.name || !newMed.dosage}
                  className="w-full py-3 bg-teal-500 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  Add Medication
                </button>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-full mt-2 text-slate-500">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}