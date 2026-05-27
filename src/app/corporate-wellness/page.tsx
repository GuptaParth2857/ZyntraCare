'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiActivity, FiHeart, FiShield, FiTrendingUp, FiBriefcase,
  FiCheckCircle, FiAlertCircle, FiDownload, FiPlus, FiArrowRight,
  FiUserPlus, FiCopy, FiCheck, FiX, FiSearch, FiFilter, FiChevronDown,
} from 'react-icons/fi';
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area,
} from 'recharts';

interface CorporateProgram {
  id: string; companyName: string; contactName: string; contactEmail: string;
  contactPhone: string | null; employeeCount: number | null; services: string;
  status: string; _count?: { members: number };
}

interface CorporateMember { id: string; name: string; email: string; department: string | null; }

interface Employee extends CorporateMember {
  healthScore: number; riskLevel: 'low' | 'medium' | 'high';
  lastCheckup: string; vitals: { heartRate: number; bp: string; sugar: number };
  goals: { completed: number; total: number };
}

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Support'];
const SERVICES = ['Health Screening', 'Mental Wellness', 'Fitness Programs', 'Nutrition Counseling', 'Telehealth', 'Stress Management', 'Yoga & Meditation', 'Health Checkup Camps'];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return (Math.abs(h) % 10000) / 10000;
}

function enrichMember(m: CorporateMember): Employee {
  const s = m.id || m.email;
  const r = hashSeed(s);
  const score = Math.round(40 + r * 55);
  const d = new Date(); d.setDate(d.getDate() - Math.floor(r * 30));
  return {
    ...m,
    department: m.department || DEPARTMENTS[Math.floor(hashSeed(s + 'd') * DEPARTMENTS.length)],
    healthScore: score,
    riskLevel: score >= 70 ? 'low' : score >= 50 ? 'medium' : 'high',
    lastCheckup: d.toISOString().split('T')[0],
    vitals: {
      heartRate: Math.round(60 + hashSeed(s + 'h') * 40),
      bp: `${Math.round(110 + hashSeed(s + 'y') * 35)}/${Math.round(70 + hashSeed(s + 'z') * 25)}`,
      sugar: Math.round(80 + hashSeed(s + 'g') * 80),
    },
    goals: { completed: Math.floor(hashSeed(s + 'c') * 10), total: 10 },
  };
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function CorporateWellnessPage() {
  const [programs, setPrograms] = useState<CorporateProgram[]>([]);
  const [members, setMembers] = useState<CorporateMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('all');
  const [showRegister, setShowRegister] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<CorporateProgram | null>(null);
  const [regForm, setRegForm] = useState({ companyName: '', contactName: '', contactEmail: '', contactPhone: '', employeeCount: 50, services: [] as string[] });
  const [memberForm, setMemberForm] = useState({ name: '', email: '', department: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/corporate-wellness');
      const d = await r.json();
      if (d.success && d.programs.length) {
        setPrograms(d.programs);
        const p = d.programs[0];
        setSelectedProgram(p);
        setMembers((p.members || []).map(enrichMember));
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const r = await fetch('/api/corporate-wellness', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register-company', ...regForm }),
      });
      const d = await r.json();
      if (d.success) { setShowRegister(false); setRegForm({ companyName: '', contactName: '', contactEmail: '', contactPhone: '', employeeCount: 50, services: [] }); await fetchData(); }
    } catch {} finally { setSubmitting(false); }
  };

  const handleAddMember = async () => {
    if (!selectedProgram) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/corporate-wellness', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add-member', programId: selectedProgram.id, ...memberForm }),
      });
      const d = await r.json();
      if (d.success) { setShowAddMember(false); setMemberForm({ name: '', email: '', department: '' }); await fetchData(); }
    } catch {} finally { setSubmitting(false); }
  };

  const exportCSV = () => {
    const h = ['Name','Department','Health Score','Risk Level','Heart Rate','BP','Sugar','Last Checkup','Goals Completed','Total Goals'];
    const csv = [h.join(','), ...searched.map(e => [e.name, e.department||'', e.healthScore, e.riskLevel, e.vitals.heartRate, e.vitals.bp, e.vitals.sugar, e.lastCheckup, e.goals.completed, e.goals.total].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `wellness-${(selectedProgram?.companyName||'report').replace(/\s+/g,'-').toLowerCase()}.csv`;
    a.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/corporate-wellness?join=${selectedProgram?.id}`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const toggleService = (s: string) => setRegForm(f => ({ ...f, services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s] }));

  const employees = members as Employee[];
  const filtered = selectedDept === 'all' ? employees : employees.filter(e => e.department === selectedDept);
  const searched = searchTerm ? filtered.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()) || (e.department||'').toLowerCase().includes(searchTerm.toLowerCase())) : filtered;
  const avgScore = employees.length ? Math.round(employees.reduce((a, e) => a + e.healthScore, 0) / employees.length) : 0;
  const highRisk = employees.filter(e => e.riskLevel === 'high').length;
  const totalGoals = employees.reduce((a, e) => a + e.goals.completed, 0);
  const depts = [...new Set(employees.map(e => e.department).filter(Boolean))] as string[];
  const riskData = [
    { name: 'Low', value: employees.filter(e => e.riskLevel === 'low').length, color: '#22c55e' },
    { name: 'Medium', value: employees.filter(e => e.riskLevel === 'medium').length, color: '#eab308' },
    { name: 'High', value: employees.filter(e => e.riskLevel === 'high').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const cm = new Date().getMonth();
  const trend = [2,1,0].map(i => {
    const m = (cm - i + 12) % 12;
    return { month: months[m], score: Math.round(70 + hashSeed('t'+m) * 15) };
  }).reverse();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center"><div className="w-12 h-12 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-white/50 text-sm">Loading dashboard…</p></div>
    </div>
  );

  if (!programs.length && !showRegister) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-xl">
          <FiBriefcase className="text-indigo-300" size={32} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Corporate Wellness</h1>
        <p className="text-white/50 mb-2">Employee health & wellness management platform</p>
        <p className="text-white/30 text-sm mb-10 max-w-md mx-auto">Register your organisation to track health metrics, manage wellness goals, and monitor team vitals — all in one place.</p>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setShowRegister(true)}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl font-semibold text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2.5 mx-auto transition">
          <FiPlus size={18} /> Register Your Company
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-24 pb-4 relative">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-2 mb-8">
            <motion.div variants={fadeUp} className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-center">
                  <FiBriefcase className="text-indigo-300" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{selectedProgram?.companyName || 'Corporate Wellness'}</h1>
                  <p className="text-white/40 text-sm">{employees.length} member{employees.length !== 1 ? 's' : ''} • {depts.length} department{depts.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={exportCSV}
                  className="px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-white/20 text-sm flex items-center gap-2 transition">
                  <FiDownload size={14} /> Export
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyLink}
                  className="px-4 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white/70 hover:text-white hover:border-white/20 text-sm flex items-center gap-2 transition">
                  {inviteCopied ? <FiCheck className="text-emerald-400" size={14} /> : <FiCopy size={14} />} {inviteCopied ? 'Copied' : 'Invite'}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddMember(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition">
                  <FiUserPlus size={14} /> Add Member
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-16 space-y-6">
        {employees.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-16 text-center">
            <FiUsers className="text-white/20 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-semibold text-white/70 mb-2">No team members yet</h3>
            <p className="text-white/30 text-sm mb-6">Add employees to start tracking their wellness journey</p>
            <button onClick={() => setShowAddMember(true)} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-sm font-medium flex items-center gap-2 mx-auto shadow-lg shadow-indigo-500/20">
              <FiUserPlus size={14} /> Add First Member
            </button>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Employees', value: employees.length, color: 'text-white' },
                { label: 'Avg Health Score', value: `${avgScore}%`, color: avgScore >= 70 ? 'text-emerald-400' : avgScore >= 50 ? 'text-yellow-400' : 'text-red-400' },
                { label: 'High Risk', value: highRisk, color: highRisk > 0 ? 'text-red-400' : 'text-emerald-400' },
                { label: 'Goals Completed', value: totalGoals, color: 'text-indigo-300' },
              ].map((s, i) => (
                <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5">
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </motion.div>

            {riskData.length > 0 && (
              <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-6">
                  <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2"><FiActivity size={14} className="text-indigo-400" />Risk Distribution</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart><Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                        {riskData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    {riskData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-white/60">{d.name} <span className="text-white/40">({d.value})</span></span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-6">
                  <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2"><FiTrendingUp size={14} className="text-indigo-400" />Health Trend</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <YAxis domain={[60, 100]} stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                        <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} fill="url(#gradient)" />
                        <defs><linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} /><stop offset="100%" stopColor="#818cf8" stopOpacity={0} /></linearGradient></defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {highRisk > 0 && (
              <motion.div variants={fadeUp}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-4 flex items-start gap-3">
                <FiAlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-semibold text-red-300">{highRisk} employee{highRisk > 1 ? 's' : ''} require{highRisk === 1 ? 's' : ''} immediate attention</p>
                  <p className="text-sm text-red-400/70">Schedule health consultations and review reports</p>
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-white/80 font-semibold flex items-center gap-2"><FiUsers size={14} className="text-indigo-400" />Employee Records</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                    <input type="text" placeholder="Search…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-indigo-500/50 w-44" />
                  </div>
                  <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                    <option value="all" className="bg-indigo-950">All Departments</option>
                    {depts.map(d => <option key={d} value={d} className="bg-indigo-950">{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Employee', 'Department', 'Health Score', 'Risk', 'Vitals', 'Goals'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {searched.map(emp => (
                      <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white/70 text-sm font-semibold">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-white/80 text-sm font-medium">{emp.name}</p>
                              <p className="text-white/30 text-xs">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-white/50 text-sm">{emp.department}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${emp.healthScore >= 70 ? 'bg-emerald-500' : emp.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${emp.healthScore}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${emp.healthScore >= 70 ? 'text-emerald-400' : emp.healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{emp.healthScore}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            emp.riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            emp.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{emp.riskLevel.toUpperCase()}</span>
                        </td>
                        <td className="px-5 py-3.5 text-white/50 text-xs space-y-0.5">
                          <span className="flex items-center gap-1.5">❤️ {emp.vitals.heartRate} bpm</span>
                          <span className="flex items-center gap-1.5">🩺 {emp.vitals.bp}</span>
                          <span className="flex items-center gap-1.5">🩸 {emp.vitals.sugar} mg/dL</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <FiCheckCircle className={emp.goals.completed >= 7 ? 'text-emerald-400' : emp.goals.completed >= 4 ? 'text-yellow-400' : 'text-white/30'} size={14} />
                            <span className="text-white/50 text-sm">{emp.goals.completed}/{emp.goals.total}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                {!searched.length && (
                  <div className="text-center py-12 text-white/30 text-sm">No employees match your search</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showRegister && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRegister(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f0d2e] border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Register Company</h2>
                <button onClick={() => setShowRegister(false)} className="text-white/30 hover:text-white/60 transition"><FiX size={20} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'companyName', label: 'Company Name', type: 'text', required: true },
                  { key: 'contactName', label: 'Contact Name', type: 'text', required: true },
                  { key: 'contactEmail', label: 'Contact Email', type: 'email', required: true },
                  { key: 'contactPhone', label: 'Phone', type: 'tel' },
                  { key: 'employeeCount', label: 'Employee Count', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">{f.label}{f.required ? ' *' : ''}</label>
                    <input type={f.type} value={(regForm as any)[f.key]} onChange={e => setRegForm(r => ({ ...r, [f.key]: f.type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition" />
                  </div>
                ))}
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-2 uppercase tracking-wider">Wellness Services</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(s => (
                      <button key={s} onClick={() => toggleService(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          regForm.services.includes(s) ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowRegister(false)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm transition hover:text-white/70">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleRegister}
                  disabled={submitting || !regForm.companyName || !regForm.contactEmail}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-sm font-semibold disabled:opacity-40 flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                  {submitting ? 'Registering…' : 'Register'} <FiArrowRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showAddMember && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddMember(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#0f0d2e] border border-white/10 rounded-3xl p-8 max-w-md w-full"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Add Team Member</h2>
                <button onClick={() => setShowAddMember(false)} className="text-white/30 hover:text-white/60 transition"><FiX size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">Name *</label>
                  <input type="text" value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">Email *</label>
                  <input type="email" value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs font-medium mb-1.5 uppercase tracking-wider">Department</label>
                  <select value={memberForm.department} onChange={e => setMemberForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
                    <option value="" className="bg-[#0f0d2e]">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0f0d2e]">{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowAddMember(false)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">Cancel</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddMember}
                  disabled={submitting || !memberForm.name || !memberForm.email}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-sm font-semibold disabled:opacity-40 shadow-lg shadow-indigo-500/20">
                  {submitting ? 'Adding…' : 'Add Member'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
