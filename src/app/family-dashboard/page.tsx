'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiBell, FiActivity, FiHeart, FiAlertCircle, FiTrendingUp, FiUser, FiShield, FiCpu, FiRefreshCw, FiCheckCircle, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  bloodType: string;
  gender: string;
  type: 'adult' | 'child' | 'senior';
}

interface GrowthData {
  month: string;
  weight: number;
  height: number;
  bmi: number;
}

interface FallDetectionData {
  id: string;
  memberId: string;
  memberName: string;
  timestamp: string;
  location: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'detected' | 'acknowledged' | 'resolved';
  message: string;
}

interface VitalsTrend {
  month: string;
  bp: number;
  sugar: number;
  heartRate: number;
  weight: number;
}

export default function EnhancedFamilyDashboardPage() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', relation: '', age: 30, bloodType: 'O+', gender: 'Male', type: 'adult' as const });
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [fallDetections, setFallDetections] = useState<FallDetectionData[]>([]);
  const [vitalsTrends, setVitalsTrends] = useState<VitalsTrend[]>([]);
  const [showFallDetection, setShowFallDetection] = useState(false);

  useEffect(() => {
    const mockMembers: FamilyMember[] = [
      { id: '1', name: 'Parth Gupta', relation: 'Self', age: 28, bloodType: 'O+', gender: 'Male', type: 'adult' },
      { id: '2', name: 'Suresh Gupta', relation: 'Father', age: 62, bloodType: 'A+', gender: 'Male', type: 'senior' },
      { id: '3', name: 'Meena Gupta', relation: 'Mother', age: 58, bloodType: 'B+', gender: 'Female', type: 'senior' },
      { id: '4', name: 'Aarav Gupta', relation: 'Son', age: 6, bloodType: 'AB+', gender: 'Male', type: 'child' },
    ];
    setFamilyMembers(mockMembers);

    setGrowthData([
      { month: 'Jan', weight: 18, height: 105, bmi: 16.3 },
      { month: 'Feb', weight: 18.5, height: 106, bmi: 16.5 },
      { month: 'Mar', weight: 19, height: 107, bmi: 16.6 },
      { month: 'Apr', weight: 19.5, height: 108, bmi: 16.7 },
      { month: 'May', weight: 20, height: 109, bmi: 16.9 },
      { month: 'Jun', weight: 20.5, height: 110, bmi: 17.0 },
      { month: 'Jul', weight: 21, height: 111, bmi: 17.1 },
    ]);

    setFallDetections([
      {
        id: '1',
        memberId: '2',
        memberName: 'Suresh Gupta',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        location: 'Living Room',
        severity: 'critical',
        status: 'detected',
        message: 'Fall detected! Sudden movement pattern detected. Immediate attention required.',
      },
      {
        id: '2',
        memberId: '3',
        memberName: 'Meena Gupta',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        location: 'Kitchen',
        severity: 'warning',
        status: 'acknowledged',
        message: 'Unusual movement detected. Possible trip or stumble. Check on the member.',
      },
    ]);

    setVitalsTrends([
      { month: 'Jan', bp: 128, sugar: 132, heartRate: 78, weight: 68 },
      { month: 'Feb', bp: 125, sugar: 128, heartRate: 76, weight: 67.5 },
      { month: 'Mar', bp: 130, sugar: 135, heartRate: 80, weight: 68.2 },
      { month: 'Apr', bp: 122, sugar: 125, heartRate: 74, weight: 67 },
      { month: 'May', bp: 118, sugar: 118, heartRate: 72, weight: 66.5 },
      { month: 'Jun', bp: 120, sugar: 122, heartRate: 75, weight: 66.8 },
    ]);
  }, []);

  const currentMember = familyMembers.find(m => m.id === selectedMember) || familyMembers[0];
  const isSenior = currentMember?.type === 'senior';
  const isChild = currentMember?.type === 'child';

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relation) return;
    const member: FamilyMember = {
      id: Date.now().toString(),
      name: newMember.name,
      relation: newMember.relation,
      age: newMember.age,
      bloodType: newMember.bloodType,
      gender: newMember.gender,
      type: newMember.age > 58 ? 'senior' : newMember.age < 12 ? 'child' : 'adult',
    };
    setFamilyMembers(prev => [...prev, member]);
    setShowAddModal(false);
    setNewMember({ name: '', relation: '', age: 30, bloodType: 'O+', gender: 'Male', type: 'adult' });
  };

  const resolveFallAlert = (id: string) => {
    setFallDetections(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-pink-500/10 border border-pink-500/30 rounded-2xl mb-6">
            <FiUsers size={32} className="text-pink-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Enhanced Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Care Hub</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor growth, detect falls, track trends, and manage your family's health with AI.
          </p>
        </motion.div>

        {/* Fall Detection Alert Banner */}
        {fallDetections.filter(f => f.status === 'detected').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-500/10 border border-red-500/30 rounded-[2rem] p-6 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FiAlertCircle className="text-red-400 text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-red-300">Fall Detection Active</h3>
                <p className="text-sm text-gray-300">AI monitoring has detected potential falls for your family members</p>
              </div>
            </div>
            <div className="space-y-3">
              {fallDetections.filter(f => f.status !== 'resolved').map(fall => (
                <div key={fall.id} className={`p-4 rounded-xl border ${
                  fall.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          fall.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {fall.severity.toUpperCase()}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-medium">{fall.status}</span>
                      </div>
                      <p className="font-bold text-white">{fall.memberName} - {fall.location}</p>
                      <p className="text-sm text-gray-300 mt-1">{fall.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(fall.timestamp).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => resolveFallAlert(fall.id)}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition"
                      >
                        Resolve
                      </button>
                      <Link href="/emergency" className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition">
                        Emergency
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Family Members */}
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Family Members</h3>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
                  <FiPlus size={16} /> Add Member
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {familyMembers.map((member) => (
                  <motion.button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    whileHover={{ scale: 1.05 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[120px] transition ${
                      selectedMember === member.id
                        ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-2 border-pink-500/50'
                        : 'bg-white/5 border border-white/10 hover:border-pink-500/30'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                      member.type === 'senior' ? 'from-purple-500 to-violet-600' :
                      member.type === 'child' ? 'from-yellow-500 to-orange-500' :
                      'from-pink-500 to-rose-500'
                    } flex items-center justify-center font-black text-xl text-white`}>
                      {member.type === 'senior' ? '👴' : member.type === 'child' ? '👶' : '👤'}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white truncate max-w-[100px]">{member.name.split(' ')[0]}</p>
                      <p className="text-xs text-gray-400">{member.relation} · {member.age}</p>
                    </div>
                    {member.type === 'senior' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[10px] font-bold">
                        <FiShield size={10} /> Fall Monitor
                      </span>
                    )}
                    {member.type === 'child' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                        <FiHeart size={10} /> Growth Tracked
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Member Details */}
            {currentMember && (
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    currentMember.type === 'senior' ? 'from-purple-500 to-violet-600' :
                    currentMember.type === 'child' ? 'from-yellow-500 to-orange-500' :
                    'from-pink-500 to-rose-500'
                  } flex items-center justify-center font-black text-2xl text-white`}>
                    {currentMember.type === 'senior' ? '👴' : currentMember.type === 'child' ? '👶' : '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{currentMember.name}</h3>
                    <p className="text-gray-400">{currentMember.relation} · Age {currentMember.age} · {currentMember.gender} · Blood: {currentMember.bloodType}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentMember.type === 'senior' ? 'bg-purple-500/20 text-purple-400' :
                      currentMember.type === 'child' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {currentMember.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Vitals Overview */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'BP', value: '120/80', trend: 'Normal', color: 'text-emerald-400' },
                    { label: 'Sugar', value: isChild ? '98' : isSenior ? '145' : '118', trend: 'Normal', color: 'text-emerald-400' },
                    { label: 'Heart Rate', value: isChild ? '98' : isSenior ? '82' : '72', trend: 'Stable', color: 'text-emerald-400' },
                  ].map((vital, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">{vital.label}</p>
                      <p className="text-xl font-bold text-white">{vital.value}</p>
                      <p className={`text-xs font-medium ${vital.color}`}>{vital.trend}</p>
                    </div>
                  ))}
                </div>

                {/* Special features based on member type */}
                {isChild && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FiHeart className="text-emerald-400" /> Pediatric Growth Tracking
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {[
                        { label: 'Current Weight', value: '21 kg', percentile: '65th Percentile', color: 'text-emerald-400' },
                        { label: 'Current Height', value: '111 cm', percentile: '70th Percentile', color: 'text-blue-400' },
                        { label: 'BMI', value: '17.0', percentile: 'Healthy Range', color: 'text-purple-400' },
                      ].map((metric, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                          <p className="text-xl font-bold text-white">{metric.value}</p>
                          <p className={`text-xs font-medium ${metric.color}`}>{metric.percentile}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm font-bold text-white mb-4">Growth Chart (Last 7 Months)</p>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={growthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="month" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                          <Area type="monotone" dataKey="weight" name="Weight (kg)" stroke="#10b981" fill="rgba(16,185,129,0.2)" />
                          <Area type="monotone" dataKey="height" name="Height (cm)" stroke="#60a5fa" fill="rgba(96,165,250,0.2)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {isSenior && (
                  <div className="mb-6">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <FiShield className="text-purple-400" /> Elderly Care & Safety Monitor
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                          <FiCheckCircle className="text-emerald-400" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">Fall Detection Active</p>
                          <p className="text-xs text-gray-400">AI-powered motion analysis via connected devices</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">MONITORING</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                          <FiActivity className="text-blue-400" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">Daily Activity Level</p>
                          <p className="text-xs text-gray-400">2,847 steps today · Active pattern detected</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                          <FiClock className="text-amber-400" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">Medication Adherence</p>
                          <p className="text-xs text-gray-400">92% - 4 doses taken out of 5 today</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold">HIGH</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Health Trends */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-pink-400" /> Family Health Trends (6 Months)
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={vitalsTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="#888" fontSize={12} />
                      <YAxis stroke="#888" fontSize={12} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      <Line type="monotone" dataKey="bp" name="Blood Pressure" stroke="#f43f5e" strokeWidth={2} />
                      <Line type="monotone" dataKey="sugar" name="Blood Sugar" stroke="#8b5cf6" strokeWidth={2} />
                      <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#06b6d4" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Fall Detection Panel */}
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiShield className="text-purple-400" /> Elderly Care Alerts
              </h3>
              <div className="space-y-3">
                {fallDetections.map(fall => (
                  <div key={fall.id} className={`p-3 rounded-xl border ${
                    fall.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-white text-sm">{fall.memberName}</p>
                        <p className="text-xs text-gray-400">{fall.location}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        fall.status === 'detected' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {fall.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{fall.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/booking" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <FiPlus className="text-pink-400" />
                  <span className="text-sm">Book Appointment</span>
                </Link>
                <Link href="/medicine-reminder" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <FiActivity className="text-pink-400" />
                  <span className="text-sm">Medicine Reminder</span>
                </Link>
                <Link href="/predictive-analytics" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <FiTrendingUp className="text-pink-400" />
                  <span className="text-sm">Predictive Analytics</span>
                </Link>
                <Link href="/emergency" className="flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition">
                  <FiAlertCircle className="text-red-400" />
                  <span className="text-sm text-red-400">Emergency Call</span>
                </Link>
              </div>
            </div>

            {/* ABHA Integration Card */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <FiHeart className="text-green-400" /> ABHA Health Account
              </h3>
              <p className="text-sm text-gray-300 mb-3">Link your Ayushman Bharat Health Account for secure health record access and government scheme benefits.</p>
              <Link href="/government-schemes" className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-center hover:bg-green-700 transition block">
                View Government Schemes
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Add Family Member</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Relation</label>
                <input
                  type="text"
                  value={newMember.relation}
                  onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                  placeholder="e.g. Spouse, Father, Child"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Age</label>
                  <input
                    type="number"
                    value={newMember.age}
                    onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Gender</label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Blood Type</label>
                <select
                  value={newMember.bloodType}
                  onChange={(e) => setNewMember({ ...newMember, bloodType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-1 text-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition">
                Cancel
              </button>
              <button onClick={handleAddMember} disabled={!newMember.name || !newMember.relation} className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl font-bold transition disabled:opacity-50">
                Add Member
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
