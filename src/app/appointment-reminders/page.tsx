'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiBellOff, FiCalendar, FiClock, FiCheck, FiX, FiPlus,
  FiChevronDown, FiChevronRight, FiPhone, FiMail, FiSmartphone,
  FiAlertCircle, FiUser, FiMapPin, FiActivity, FiRefreshCw, FiFilter,
  FiTrash2, FiEdit2
} from 'react-icons/fi';
import { MdLocalHospital } from 'react-icons/md';

interface Appointment {
  id: string;
  hospital: string;
  hospitalShort: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Video' | 'Home Visit';
  status: 'upcoming' | 'completed' | 'cancelled';
  reminderEnabled: boolean;
  reminderTimings: string[];
  reminderMethods: string[];
}

interface Notification {
  id: string;
  appointmentId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'update' | 'cancelled';
}



const TIMING_OPTIONS = ['24hr', '1hr', '30min'];
const METHOD_OPTIONS = ['In-app', 'SMS', 'Email'];

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'cancelled': return 'bg-red-500/15 text-red-400 border-red-500/30';
    default: return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  }
}

function CalendarView({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const upcomingDates = appointments
    .filter(a => a.status === 'upcoming')
    .reduce((acc, a) => { acc[a.date] = a; return acc; }, {} as Record<string, Appointment>);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
      <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
        <FiCalendar size={14} className="text-blue-400" />
        {today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-bold py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasAppt = upcomingDates[dateStr];
          const isToday = day === today.getDate();

          return (
            <div
              key={day}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs transition ${
                isToday ? 'bg-blue-600 text-white font-bold' :
                hasAppt ? 'bg-teal-500/15 text-teal-400 font-bold border border-teal-500/30' :
                'text-gray-500 hover:bg-white/5'
              }`}
            >
              {day}
              {hasAppt && !isToday && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-teal-400 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AppointmentRemindersPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'calendar'>('upcoming');
  const [filterStatus, setFilterStatus] = useState('');
  const [showPopup, setShowPopup] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch('/api/appointment-reminders?userId=demo-user');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error('Failed to fetch reminders', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      const unread = notifications.find(n => !n.read);
      if (unread && !showPopup) setShowPopup(unread);
    }, 3000);
    return () => clearTimeout(timer);
  }, [notifications, showPopup, loading]);

  const toggleReminder = (aptId: string) => {
    setAppointments(prev => prev.map(a =>
      a.id === aptId ? { ...a, reminderEnabled: !a.reminderEnabled } : a
    ));
  };

  const toggleTiming = (aptId: string, timing: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== aptId) return a;
      const timings = a.reminderTimings.includes(timing)
        ? a.reminderTimings.filter(t => t !== timing)
        : [...a.reminderTimings, timing];
      return { ...a, reminderTimings: timings, reminderEnabled: timings.length > 0 || a.reminderMethods.length > 0 };
    }));
  };

  const toggleMethod = (aptId: string, method: string) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== aptId) return a;
      const methods = a.reminderMethods.includes(method)
        ? a.reminderMethods.filter(m => m !== method)
        : [...a.reminderMethods, method];
      return { ...a, reminderMethods: methods, reminderEnabled: methods.length > 0 || a.reminderTimings.length > 0 };
    }));
  };

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const dismissPopup = useCallback(() => {
    if (showPopup) markNotificationRead(showPopup.id);
    setShowPopup(null);
  }, [showPopup, markNotificationRead]);

  const filteredUpcoming = appointments.filter(a => {
    if (filterStatus && a.status !== filterStatus) return false;
    return a.status === 'upcoming';
  });

  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[180px]"
        />
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Notification Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[9999] w-[90%] max-w-md"
          >
            <div className={`backdrop-blur-2xl border rounded-2xl p-4 shadow-2xl ${
              showPopup.type === 'cancelled' ? 'bg-red-900/80 border-red-500/30' :
              showPopup.type === 'update' ? 'bg-emerald-900/80 border-emerald-500/30' :
              'bg-slate-900/90 border-blue-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  showPopup.type === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  showPopup.type === 'update' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {showPopup.type === 'cancelled' ? <FiX size={18} /> :
                   showPopup.type === 'update' ? <FiCheck size={18} /> :
                   <FiBell size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{showPopup.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{showPopup.message}</p>
                </div>
                <button onClick={dismissPopup} className="text-gray-500 hover:text-white transition">
                  <FiX size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 pt-24 pb-10 max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="relative inline-flex mb-4">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-blue-500/25 rounded-full"
            />
            <div className="relative p-4 bg-blue-500/15 border border-blue-500/40 rounded-full backdrop-blur-sm">
              <FiBell size={32} className="text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">
            Appointment{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
              Reminders
            </span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Never miss a hospital visit. Set personalized reminders for every appointment.
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div className="flex gap-2">
            {(['upcoming', 'past', 'calendar'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {tab === 'upcoming' ? '📅 Upcoming' : tab === 'past' ? '📋 Past' : '🗓 Calendar'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition"
            >
              <FiBell size={18} className="text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/25"
            >
              <FiPlus size={14} /> New Reminder
            </button>
          </div>
        </motion.div>

        {/* Notifications Panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                  <FiBell size={14} className="text-blue-400" /> Notifications
                </h3>
                <div className="space-y-3">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition ${
                        n.read ? 'bg-white/3 border border-white/5' : 'bg-blue-500/5 border border-blue-500/20'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        n.type === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                        n.type === 'update' ? 'bg-emerald-500/15 text-emerald-400' :
                        'bg-blue-500/15 text-blue-400'
                      }`}>
                        {n.type === 'cancelled' ? <FiX size={14} /> :
                         n.type === 'update' ? <FiCheck size={14} /> :
                         <FiBell size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-sm ${n.read ? 'text-gray-400' : 'text-white'}`}>{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                        <p className="text-gray-600 text-[10px] mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Reminder Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-slate-900/70 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <FiPlus className="text-blue-400" /> Add New Reminder
                  </h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white transition">
                    <FiX size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Select Appointment</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/50 transition appearance-none">
                      <option value="" className="bg-slate-900">Choose an upcoming appointment...</option>
                      {appointments.filter(a => a.status === 'upcoming').map(a => (
                        <option key={a.id} value={a.id} className="bg-slate-900">
                          {a.doctor} — {a.hospitalShort} ({a.date} {a.time})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Reminder Timing</label>
                      <div className="flex gap-2">
                        {TIMING_OPTIONS.map(t => (
                          <button key={t} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-blue-500/30 transition font-bold">
                            {t} before
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">Reminder Method</label>
                      <div className="flex gap-2">
                        {METHOD_OPTIONS.map(m => (
                          <button key={m} className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-blue-500/30 transition font-bold flex items-center justify-center gap-1">
                            {m === 'In-app' ? <FiBell size={10} /> : m === 'SMS' ? <FiSmartphone size={10} /> : <FiMail size={10} />}
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/25">
                    Create Reminder
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Appointments */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading appointments...</p>
              </div>
            ) : filteredUpcoming.length === 0 && (
              <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
                <FiCalendar size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No upcoming appointments</p>
              </div>
            )}
            {filteredUpcoming.map((apt, i) => {
              const daysUntil = getDaysUntil(apt.date);
              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 hover:border-blue-500/20 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Date Badge */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <span className="text-2xl font-black leading-none">{new Date(apt.date).getDate()}</span>
                      <span className="text-[10px] font-bold uppercase">{new Date(apt.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-white text-base">{apt.doctor}</h3>
                          <p className="text-gray-400 text-sm flex items-center gap-1">
                            <MdLocalHospital size={12} className="text-blue-400" /> {apt.hospital}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border flex-shrink-0 ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-400"><FiClock size={12} /> {apt.time}</span>
                        <span className="flex items-center gap-1 text-gray-400"><FiActivity size={12} /> {apt.specialty}</span>
                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-500">{apt.type}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          daysUntil <= 1 ? 'bg-red-500/20 text-red-400' :
                          daysUntil <= 3 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                        </span>
                      </div>

                      {/* Reminder Settings */}
                      <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                            {apt.reminderEnabled ? <FiBell size={12} className="text-blue-400" /> : <FiBellOff size={12} />}
                            Reminders
                          </span>
                          <button
                            onClick={() => toggleReminder(apt.id)}
                            className={`w-11 h-6 rounded-full transition-all relative ${
                              apt.reminderEnabled ? 'bg-blue-600' : 'bg-white/10'
                            }`}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                              apt.reminderEnabled ? 'left-[22px]' : 'left-0.5'
                            }`} />
                          </button>
                        </div>

                        {apt.reminderEnabled && (
                          <>
                            <div>
                              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold mb-2">Timing</p>
                              <div className="flex gap-2">
                                {TIMING_OPTIONS.map(t => (
                                  <button
                                    key={t}
                                    onClick={() => toggleTiming(apt.id, t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                      apt.reminderTimings.includes(t)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold mb-2">Method</p>
                              <div className="flex gap-2">
                                {METHOD_OPTIONS.map(m => (
                                  <button
                                    key={m}
                                    onClick={() => toggleMethod(apt.id, m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                      apt.reminderMethods.includes(m)
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white/5 text-gray-500 border border-white/10 hover:text-white'
                                    }`}
                                  >
                                    {m === 'In-app' ? <FiBell size={10} /> : m === 'SMS' ? <FiSmartphone size={10} /> : <FiMail size={10} />}
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Past Appointments */}
        {activeTab === 'past' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading appointments...</p>
              </div>
            ) : pastAppointments.length === 0 && (
              <div className="text-center py-16 bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5">
                <FiCalendar size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">No past appointments</p>
              </div>
            )}
            {pastAppointments.map((apt, i) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 opacity-70"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    apt.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  }`}>
                    {apt.status === 'completed' ? <FiCheck size={20} /> : <FiX size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{apt.doctor}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{apt.hospital} • {apt.specialty}</p>
                    <p className="text-gray-600 text-xs">{apt.date} at {apt.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CalendarView appointments={appointments} />
            <div className="space-y-3">
              <h3 className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-2">Upcoming This Month</h3>
              {appointments.filter(a => a.status === 'upcoming').map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="text-center flex-shrink-0">
                    <p className="text-2xl font-black text-blue-400">{new Date(apt.date).getDate()}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{new Date(apt.date).toLocaleDateString('en-IN', { month: 'short' })}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{apt.doctor}</p>
                    <p className="text-gray-500 text-xs">{apt.time} • {apt.specialty}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    apt.reminderEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600'
                  }`}>
                    {apt.reminderEnabled ? <FiBell size={12} /> : <FiBellOff size={12} />}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
