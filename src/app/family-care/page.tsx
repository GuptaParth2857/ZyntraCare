'use client';

import { useState } from 'react';
import { FiUsers, FiPlus, FiBell, FiPhone, FiCalendar, FiClock, FiActivity, FiHeart, FiAlertCircle, FiMapPin, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  bloodType: string;
  avatar: string;
  color: string;
  healthAlerts: { id: string; message: string; type: 'critical' | 'warning' | 'info'; time: string }[];
  upcomingAppointments: { id: string; doctor: string; specialty: string; date: string; time: string; location: string }[];
  medications: { id: string; name: string; dosage: string; frequency: string; nextDue: string }[];
  vitals: { lastChecked: string; bp: string; sugar: string; heartRate: string };
}

const familyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Dad (Rajesh Gupta)',
    relation: 'Father',
    age: 58,
    bloodType: 'B+',
    avatar: 'RG',
    color: 'from-blue-500 to-cyan-500',
    healthAlerts: [
      { id: '1', message: 'Blood Pressure check due tomorrow', type: 'warning', time: '9:00 AM' },
      { id: '2', message: 'Metoprolol 50mg - Take after food', type: 'info', time: '8:00 PM' },
    ],
    upcomingAppointments: [
      { id: '1', doctor: 'Dr. Amit Sharma', specialty: 'Cardiologist', date: 'Mar 15', time: '10:30 AM', location: 'AIIMS, Delhi' },
    ],
    medications: [
      { id: '1', name: 'Metoprolol 50mg', dosage: '1 tablet', frequency: 'After breakfast', nextDue: '8:00 AM' },
    ],
    vitals: { lastChecked: '2 days ago', bp: '130/85', sugar: '110 mg/dL', heartRate: '72 bpm' },
  },
  {
    id: '2',
    name: 'Mom (Sunita Gupta)',
    relation: 'Mother',
    age: 52,
    bloodType: 'O+',
    avatar: 'SG',
    color: 'from-pink-500 to-rose-500',
    healthAlerts: [
      { id: '1', message: 'Calcium supplement reminder', type: 'info', time: '10:00 PM' },
    ],
    upcomingAppointments: [
      { id: '1', doctor: 'Dr. Neha Kapoor', specialty: 'Gynecologist', date: 'Mar 20', time: '4:00 PM', location: 'Fortis, Delhi' },
    ],
    medications: [
      { id: '1', name: 'Calcium + D3', dosage: '1 tablet', frequency: 'After dinner', nextDue: '10:00 PM' },
    ],
    vitals: { lastChecked: '5 days ago', bp: '120/80', sugar: '95 mg/dL', heartRate: '78 bpm' },
  },
];

export default function FamilyDashboardPage() {
  const [selectedMember, setSelectedMember] = useState<string>('1');
  const currentMember = familyMembers.find(m => m.id === selectedMember);

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
            Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Care Hub</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage your entire family's health in one place. Get alerts, track medications, and schedule appointments.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Family Members</h3>
                <button className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
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
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center font-black text-xl text-white`}>
                      {member.avatar}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white truncate max-w-[100px]">{member.relation}</p>
                      <p className="text-xs text-gray-400">{member.age} years</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {currentMember && (
              <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentMember.color} flex items-center justify-center font-black text-2xl text-white`}>
                    {currentMember.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{currentMember.name}</h3>
                    <p className="text-gray-400">{currentMember.relation} - Age {currentMember.age} - Blood: {currentMember.bloodType}</p>
                  </div>
                  <Link href="/health-tracker" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl font-bold text-sm transition">
                    <FiActivity /> View Health
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">BP</p>
                    <p className="text-xl font-bold text-white">{currentMember.vitals.bp}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Sugar</p>
                    <p className="text-xl font-bold text-white">{currentMember.vitals.sugar}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400 mb-1">Heart</p>
                    <p className="text-xl font-bold text-white">{currentMember.vitals.heartRate}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <FiBell className="text-amber-400" /> Health Alerts
                  </h4>
                  <div className="space-y-2">
                    {currentMember.healthAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <FiBell size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{alert.message}</p>
                          <p className="text-xs text-gray-400">{alert.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <FiActivity className="text-emerald-400" /> Medications
                  </h4>
                  <div className="space-y-2">
                    {currentMember.medications.map((med) => (
                      <div key={med.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <FiActivity size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{med.name}</p>
                          <p className="text-xs text-gray-400">{med.dosage} - {med.frequency}</p>
                        </div>
                        <p className="text-sm font-medium text-emerald-400">{med.nextDue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiCalendar className="text-pink-400" /> Upcoming Appointments
              </h3>
              <div className="space-y-3">
                {familyMembers.flatMap(m => m.upcomingAppointments).map((apt) => (
                  <div key={apt.id} className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm font-medium text-white">{apt.doctor}</p>
                    <p className="text-xs text-gray-400">{apt.specialty}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span><FiCalendar size={12} /> {apt.date}</span>
                      <span><FiClock size={12} /> {apt.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/booking" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <FiCalendar className="text-pink-400" />
                  <span className="text-sm">Book Appointment</span>
                </Link>
                <Link href="/medications" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition">
                  <FiActivity className="text-pink-400" />
                  <span className="text-sm">Medicine Reminder</span>
                </Link>
                <Link href="/emergency" className="flex items-center gap-3 p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition">
                  <FiPhone className="text-red-400" />
                  <span className="text-sm text-red-400">Emergency Call</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
