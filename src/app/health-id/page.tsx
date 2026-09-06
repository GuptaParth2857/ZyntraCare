'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiUserPlus, FiUserX, FiExternalLink, FiCopy, FiCheckCircle, FiAlertTriangle, FiClock, FiRefreshCw, FiLink, FiActivity, FiCpu, FiFileText, FiSave } from 'react-icons/fi';

interface MedicalIDData {
  userId: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergencyContact1: string;
  emergencyPhone1: string;
  emergencyContact2: string;
  emergencyPhone2: string;
  organDonor: boolean;
  insuranceProvider: string;
  insuranceNumber: string;
  notes: string;
  createdAt?: string;
}

function truncate(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const DEMO_USER_ID = 'demo-user';

export default function HealthIDPage() {
  const [medicalId, setMedicalId] = useState<MedicalIDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [txLog, setTxLog] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<MedicalIDData>({
    userId: DEMO_USER_ID,
    bloodGroup: '',
    allergies: '',
    conditions: '',
    medications: '',
    emergencyContact1: '',
    emergencyPhone1: '',
    emergencyContact2: '',
    emergencyPhone2: '',
    organDonor: false,
    insuranceProvider: '',
    insuranceNumber: '',
    notes: '',
  });

  const addLog = useCallback((msg: string) => setTxLog(prev => [msg, ...prev].slice(0, 20)), []);

  const fetchMedicalId = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/medical-id?userId=${DEMO_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setMedicalId(data);
        setForm(data);
        addLog(`✅ Medical ID loaded for ${DEMO_USER_ID}`);
      } else if (res.status === 404) {
        setMedicalId(null);
        addLog('ℹ️ No Medical ID found. Create one below.');
      }
    } catch {
      setErrorMsg('Failed to load medical ID');
      addLog('❌ Error fetching medical ID');
    }
    setLoading(false);
  }, [addLog]);

  useEffect(() => {
    fetchMedicalId();
  }, [fetchMedicalId]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/medical-id', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: DEMO_USER_ID }),
      });
      if (res.ok) {
        const data = await res.json();
        setMedicalId(data.medicalId || { ...form, userId: DEMO_USER_ID });
        setEditMode(false);
        setSuccessMsg('Medical ID saved successfully');
        addLog(`✅ Medical ID saved/updated`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save');
        addLog(`❌ Save failed: ${err.error}`);
      }
    } catch {
      setErrorMsg('Network error saving medical ID');
      addLog('❌ Network error');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-3xl mb-6 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <FiShield size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">ID</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your secure digital health identity. Store emergency contacts, medical conditions, and insurance details.
          </p>
        </motion.div>

        <div className="max-w-lg mx-auto space-y-6">
          {loading ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 text-center">
              <div className="w-12 h-12 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Loading health ID...</p>
            </div>
          ) : !medicalId && !editMode ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiShield size={28} className="text-white" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Create Your Health ID</h3>
              <p className="text-gray-400 text-sm mb-6">Set up your digital health identity with emergency contacts and medical info</p>
              <button onClick={() => setEditMode(true)} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] active:scale-[0.98] transition">
                <FiUserPlus size={16} className="inline mr-2" /> Create Health ID
              </button>
            </div>
          ) : (
            <>
              {/* Medical ID Card */}
              {medicalId && !editMode && (
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><FiCheckCircle className="text-emerald-400" size={18} /></div>
                      <div>
                        <p className="text-white font-bold text-sm">Health ID Active</p>
                        <p className="text-gray-500 text-xs font-mono">{medicalId.userId}</p>
                      </div>
                    </div>
                    <button onClick={() => { setEditMode(true); }} className="text-xs text-gray-500 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                      <FiCpu size={12} /> Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {medicalId.bloodGroup && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Blood Group</p>
                        <p className="font-bold text-red-400">{medicalId.bloodGroup}</p>
                      </div>
                    )}
                    {medicalId.organDonor && (
                      <div className="bg-emerald-500/10 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Organ Donor</p>
                        <p className="font-bold text-emerald-400">Yes</p>
                      </div>
                    )}
                    {medicalId.emergencyContact1 && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Emergency Contact</p>
                        <p className="font-bold text-white text-xs">{medicalId.emergencyContact1}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{medicalId.emergencyPhone1}</p>
                      </div>
                    )}
                    {medicalId.insuranceProvider && (
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Insurance</p>
                        <p className="font-bold text-white text-xs">{medicalId.insuranceProvider}</p>
                      </div>
                    )}
                  </div>

                  {medicalId.conditions && (
                    <div className="mt-3 bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Conditions</p>
                      <p className="text-xs text-gray-300">{medicalId.conditions}</p>
                    </div>
                  )}
                  {medicalId.allergies && (
                    <div className="mt-2 bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Allergies</p>
                      <p className="text-xs text-gray-300">{medicalId.allergies}</p>
                    </div>
                  )}
                  {medicalId.medications && (
                    <div className="mt-2 bg-white/5 rounded-xl p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Medications</p>
                      <p className="text-xs text-gray-300">{medicalId.medications}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Form */}
              {(editMode || !medicalId) && (
                <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 space-y-4">
                  <h3 className="font-bold text-sm flex items-center gap-2"><FiFileText className="text-indigo-400" /> {medicalId ? 'Edit Health ID' : 'Create Health ID'}</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Blood Group</label>
                      <select value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-indigo-500/50 transition appearance-none cursor-pointer">
                        <option value="" className="bg-slate-900">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs cursor-pointer w-full">
                        <input type="checkbox" checked={form.organDonor} onChange={e => setForm({ ...form, organDonor: e.target.checked })} className="accent-emerald-500" />
                        <span className="text-gray-300">Organ Donor</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Medical Conditions</label>
                    <textarea value={form.conditions} onChange={e => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. Diabetes Type 2, Hypertension" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Allergies</label>
                    <textarea value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })} placeholder="e.g. Penicillin, Peanuts" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Current Medications</label>
                    <textarea value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })} placeholder="e.g. Metformin 500mg, Amlodipine 5mg" rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Emergency Contact 1</label>
                      <input type="text" value={form.emergencyContact1} onChange={e => setForm({ ...form, emergencyContact1: e.target.value })} placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Phone</label>
                      <input type="tel" value={form.emergencyPhone1} onChange={e => setForm({ ...form, emergencyPhone1: e.target.value })} placeholder="+91-XXXXXXXXXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Emergency Contact 2</label>
                      <input type="text" value={form.emergencyContact2} onChange={e => setForm({ ...form, emergencyContact2: e.target.value })} placeholder="Name (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Phone</label>
                      <input type="tel" value={form.emergencyPhone2} onChange={e => setForm({ ...form, emergencyPhone2: e.target.value })} placeholder="+91-XXXXXXXXXX" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Insurance Provider</label>
                      <input type="text" value={form.insuranceProvider} onChange={e => setForm({ ...form, insuranceProvider: e.target.value })} placeholder="e.g. Star Health" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Policy Number</label>
                      <input type="text" value={form.insuranceNumber} onChange={e => setForm({ ...form, insuranceNumber: e.target.value })} placeholder="Policy # (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Additional Notes</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any other important medical info..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <FiSave size={14} />}
                      {saving ? 'Saving...' : 'Save Health ID'}
                    </button>
                    {medicalId && (
                      <button onClick={() => { setEditMode(false); setForm(medicalId); }} className="px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded-2xl text-sm font-medium hover:bg-white/10 transition">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Success */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
              <FiCheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <p className="text-emerald-300 text-xs">{successMsg}</p>
            </div>
          )}

          {/* Transaction Log */}
          {txLog.length > 0 && (
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Activity Log</h4>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {txLog.map((log, i) => (
                  <p key={i} className="text-xs text-gray-400 font-mono">{log}</p>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-300 text-xs">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-3"><FiShield className="text-indigo-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Secure Storage</h3>
            <p className="text-gray-500 text-xs">Your health data is stored securely and only accessible by you and authorized doctors.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3"><FiUserPlus className="text-purple-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Emergency Ready</h3>
            <p className="text-gray-500 text-xs">First responders can access your emergency contacts and critical medical info instantly.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3"><FiActivity className="text-emerald-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Always Available</h3>
            <p className="text-gray-500 text-xs">Access your health ID from any device, anytime. Your data is always within reach.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
