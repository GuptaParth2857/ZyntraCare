'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiCalendar, FiFilter, FiClock, FiMapPin, FiUser, FiFileText, FiCheck, FiChevronDown, FiAlertCircle, FiActivity, FiShare2, FiCopy, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

interface HealthEvent {
  id: string;
  type: 'hospital' | 'lab' | 'prescription' | 'emergency' | 'vaccination' | 'vitals';
  title: string;
  date: string;
  hospital: string;
  doctor: string;
  summary: string;
  details?: string;
  location?: string;
}

interface NewEventForm {
  type: HealthEvent['type'];
  title: string;
  date: string;
  hospital: string;
  doctor: string;
  summary: string;
  details: string;
}

const EVENT_TYPE_CONFIG = {
  hospital: { label: 'Hospital Visit', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400', emoji: '🟢' },
  lab: { label: 'Lab Report', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'bg-blue-400', emoji: '🔵' },
  prescription: { label: 'Prescription', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', dot: 'bg-purple-400', emoji: '🟣' },
  emergency: { label: 'Emergency', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400', emoji: '🔴' },
  vaccination: { label: 'Vaccination', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400', emoji: '🟡' },
  vitals: { label: 'Vitals Check', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'bg-gray-400', emoji: '⚪' },
};

const INITIAL_EVENTS: HealthEvent[] = [];

export default function HealthTimelinePage() {
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [filterType, setFilterType] = useState<HealthEvent['type'] | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({ type: 'hospital', title: '', date: new Date().toISOString().split('T')[0], hospital: '', doctor: '', summary: '', details: '' });
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/health-timeline?userId=demo-user')
      .then(res => res.json())
      .then(data => setEvents(data.events || data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);


  const filteredEvents = useMemo(() => {
    return events
      .filter(e => filterType === 'all' || e.type === filterType)
      .filter(e => !dateRange.start || e.date >= dateRange.start)
      .filter(e => !dateRange.end || e.date <= dateRange.end)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, filterType, dateRange]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, HealthEvent[]> = {};
    filteredEvents.forEach(event => {
      const d = new Date(event.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const stats = useMemo(() => {
    const now = new Date();
    const totalVisits = events.filter(e => e.type === 'hospital').length;
    const lastCheckup = events.filter(e => e.type === 'hospital' || e.type === 'lab').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const upcomingVaccinations = events.filter(e => e.type === 'vaccination').length;
    const emergencies = events.filter(e => e.type === 'emergency').length;
    const totalLabs = events.filter(e => e.type === 'lab').length;
    const hospitals = [...new Set(events.map(e => e.hospital))];
    return { totalVisits, lastCheckup, upcomingVaccinations, emergencies, totalLabs, uniqueHospitals: hospitals.length };
  }, [events]);

  const addEvent = () => {
    if (!newEvent.title || !newEvent.hospital) return;
    const event: HealthEvent = {
      id: Date.now().toString(),
      ...newEvent,
    };
    setEvents(prev => [event, ...prev]);
    setShowAddForm(false);
    setNewEvent({ type: 'hospital', title: '', date: new Date().toISOString().split('T')[0], hospital: '', doctor: '', summary: '', details: '' });

    fetch('/api/health-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', event }),
    }).catch(() => {});
  };

  const generateShareText = () => {
    let text = `ZyntraCare Health Timeline\n${'='.repeat(35)}\nGenerated: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    Object.entries(groupedByMonth).forEach(([key, monthEvents]) => {
      const [year, month] = key.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      text += `--- ${monthName} ---\n`;
      monthEvents.forEach(event => {
        const cfg = EVENT_TYPE_CONFIG[event.type];
        text += `\n${cfg.emoji} ${event.title}\n`;
        text += `  Date: ${new Date(event.date).toLocaleDateString('en-IN')}\n`;
        text += `  ${event.hospital} | ${event.doctor}\n`;
        text += `  ${event.summary}\n`;
      });
      text += '\n';
    });
    text += '\nDisclaimer: Generated from ZyntraCare. Consult your doctor for medical advice.';
    return text;
  };

  const shareTimeline = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-violet-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-6">
            <FiClock size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Timeline</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Your complete chronological health journey. Every visit, report, and milestone in one place.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Health Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Total Events', value: events.length, icon: '📊', color: 'text-indigo-400' },
                  { label: 'Hospital Visits', value: stats.totalVisits, icon: '🏥', color: 'text-green-400' },
                  { label: 'Lab Reports', value: stats.totalLabs, icon: '🔬', color: 'text-blue-400' },
                  { label: 'Vaccinations', value: stats.upcomingVaccinations, icon: '💉', color: 'text-yellow-400' },
                  { label: 'Emergencies', value: stats.emergencies, icon: '🚨', color: 'text-red-400' },
                  { label: 'Hospitals Visited', value: stats.uniqueHospitals, icon: '🏛️', color: 'text-purple-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span>{stat.icon}</span>
                      <span className="text-sm text-gray-300">{stat.label}</span>
                    </div>
                    <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {stats.lastCheckup && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-xs text-green-400 font-bold mb-1">Last Checkup</p>
                  <p className="text-sm font-medium">{stats.lastCheckup.title}</p>
                  <p className="text-xs text-gray-400">{new Date(stats.lastCheckup.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-bold transition flex items-center justify-center gap-2"
                >
                  <FiPlus size={18} /> Add Event
                </button>
                <button onClick={shareTimeline}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm">
                  {copied ? <FiCheckCircle size={16} className="text-green-400" /> : <FiShare2 size={16} />}
                  {copied ? 'Copied!' : 'Export Timeline'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Timeline */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiFilter className="text-indigo-400" size={18} />
                  <span className="text-sm font-bold text-gray-400">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                      filterType === 'all' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    All ({events.length})
                  </button>
                  {(Object.entries(EVENT_TYPE_CONFIG) as [HealthEvent['type'], typeof EVENT_TYPE_CONFIG['hospital']][]).map(([type, cfg]) => {
                    const count = events.filter(e => e.type === type).length;
                    return (
                      <button key={type} onClick={() => setFilterType(type)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                          filterType === type ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}>
                        {cfg.emoji} {cfg.label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">From</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">To</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" />
                </div>
                {(dateRange.start || dateRange.end) && (
                  <button onClick={() => setDateRange({ start: '', end: '' })}
                    className="self-end px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm transition">
                    Clear
                  </button>
                )}
              </div>
            </motion.div>

            {/* Timeline Events */}
            {loading ? (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Loading timeline...</p>
              </div>
            ) : Object.entries(groupedByMonth).length === 0 ? (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <FiClock size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No events found</p>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new event</p>
                <button onClick={() => setShowAddForm(true)}
                  className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition">
                  Add First Event
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedByMonth).map(([key, monthEvents]) => {
                  const [year, month] = key.split('-');
                  const monthName = monthNames[parseInt(month) - 1];
                  return (
                    <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      {/* Month Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                          <FiCalendar size={18} className="text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black">{monthName} {year}</h2>
                          <p className="text-sm text-gray-400">{monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 h-px bg-white/10 ml-2" />
                      </div>

                      {/* Events */}
                      <div className="space-y-3 ml-5 border-l-2 border-white/10 pl-8">
                        {monthEvents.map((event, idx) => {
                          const cfg = EVENT_TYPE_CONFIG[event.type];
                          return (
                            <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="relative">
                              {/* Timeline dot */}
                              <div className={`absolute -left-[41px] top-5 w-4 h-4 rounded-full border-2 border-slate-950 ${cfg.dot}`} />

                              <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition hover:border-white/20`}>
                                <button
                                  onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                  className="w-full px-6 py-4 text-left"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                          {cfg.emoji} {cfg.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', weekday: 'short' })}
                                        </span>
                                      </div>
                                      <h3 className="font-bold text-lg">{event.title}</h3>
                                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-sm text-gray-400 flex items-center gap-1">
                                          <FiMapPin size={12} /> {event.hospital}
                                        </span>
                                        {event.doctor && (
                                          <span className="text-sm text-gray-400 flex items-center gap-1">
                                            <FiUser size={12} /> {event.doctor}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <FiChevronDown size={20} className={`text-gray-400 transition-transform ${expandedEvent === event.id ? 'rotate-180' : ''}`} />
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {expandedEvent === event.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                      className="overflow-hidden">
                                      <div className="px-6 pb-4 border-t border-white/10 pt-4">
                                        <div className="bg-white/5 rounded-xl p-4 mb-3">
                                          <p className="text-sm font-bold text-indigo-400 mb-1">Summary</p>
                                          <p className="text-sm text-gray-300">{event.summary}</p>
                                        </div>
                                        {event.location && (
                                          <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <FiMapPin size={12} /> {event.location}
                                          </p>
                                        )}
                                        {event.details && (
                                          <p className="text-xs text-gray-400 mt-2">{event.details}</p>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiPlus className="text-indigo-400" /> Add Health Event
                </h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white transition">
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Event Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(EVENT_TYPE_CONFIG) as [HealthEvent['type'], typeof EVENT_TYPE_CONFIG['hospital']][]).map(([type, cfg]) => (
                      <button key={type} onClick={() => setNewEvent(prev => ({ ...prev, type }))}
                        className={`p-3 rounded-xl border text-center text-sm transition ${
                          newEvent.type === type ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}>
                        <span className="text-lg block mb-1">{cfg.emoji}</span>
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Title *</label>
                  <input type="text" value={newEvent.title} onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Annual Health Checkup"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Date *</label>
                  <input type="date" value={newEvent.date} onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Hospital / Clinic *</label>
                  <input type="text" value={newEvent.hospital} onChange={(e) => setNewEvent(prev => ({ ...prev, hospital: e.target.value }))}
                    placeholder="e.g., AIIMS, New Delhi"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Doctor</label>
                  <input type="text" value={newEvent.doctor} onChange={(e) => setNewEvent(prev => ({ ...prev, doctor: e.target.value }))}
                    placeholder="e.g., Dr. Rajesh Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Summary *</label>
                  <textarea value={newEvent.summary} onChange={(e) => setNewEvent(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief summary of the visit / report..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Additional Details (optional)</label>
                  <textarea value={newEvent.details} onChange={(e) => setNewEvent(prev => ({ ...prev, details: e.target.value }))}
                    placeholder="Prescriptions, follow-up instructions, etc."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-medium transition">
                    Cancel
                  </button>
                  <button onClick={addEvent} disabled={!newEvent.title || !newEvent.hospital}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl font-bold transition disabled:opacity-50">
                    Add Event
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
