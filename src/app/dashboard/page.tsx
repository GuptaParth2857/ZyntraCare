'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FiUser, FiCalendar, FiFileText, FiActivity, FiClock, FiPlus, FiVideo, FiCheck, FiTrendingUp, FiServer, FiStar, FiMapPin, FiChevronRight, FiZap, FiLoader, FiAlertCircle, FiX } from 'react-icons/fi';
import { FaStethoscope, FaPills, FaNotesMedical, FaHeartbeat } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumGuard from '@/components/PremiumGuard';
import ClientOnly from '@/components/ClientOnly';
import dynamic from 'next/dynamic';
import WellnessMissions from '@/components/WellnessMissions';

const NearbyHospitalsMap = dynamic(() => import('@/components/NearbyHospitalsMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-900/50 animate-pulse rounded-3xl flex items-center justify-center border border-white/5"><span className="text-white/40 text-sm font-bold tracking-widest uppercase">Initializing Live Map...</span></div>,
});

const LazyLineChart = dynamic(
  () => import('recharts').then(mod => {
    const { 
      AreaChart: AreaChartComp, 
      Area: AreaComp, 
      XAxis: XAxisComp, 
      YAxis: YAxisComp, 
      CartesianGrid: CartesianGridComp, 
      Tooltip: TooltipComp, 
      ResponsiveContainer: ResponsiveContainerComp 
    } = mod.default || mod;
    
    return function Chart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainerComp width="100%" height="100%">
          <AreaChartComp data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGridComp strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxisComp dataKey="hour" stroke="rgba(255,255,255,0.2)" tickFormatter={(hr: number) => `${hr}:00`} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
            <YAxisComp stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }} />
            <TooltipComp contentStyle={{ backgroundColor: 'rgba(2,6,23,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', backdropFilter: 'blur(12px)' }} />
            <AreaComp type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChartComp>
        </ResponsiveContainerComp>
      );
    };
  }),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center"><p className="text-white/40 font-bold uppercase tracking-widest text-xs">Loading chart...</p></div> }
);

const TABS = [
  { id: 'appointments', label: 'Appointments', short: 'Visits', icon: <FiCalendar /> },
  { id: 'records', label: 'Medical Records', short: 'Records', icon: <FiFileText /> },
  { id: 'health', label: 'Health Metrics', short: 'Vitals', icon: <FaHeartbeat /> },
  { id: 'map', label: 'Hospital Radar', short: 'Map', icon: <FiMapPin /> },
  { id: 'predictions', label: 'AI Health Trends', short: 'AI Hub', icon: <FiTrendingUp /> },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'appointments');
  const [predictions, setPredictions] = useState<number[]>([]);
  const [bedStats, setBedStats] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [vitals, setVitals] = useState({ bp: '', hr: null as number | null, spo2: null as number | null, bmi: null as number | null });
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [error, setError] = useState('');
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [recordView, setRecordView] = useState<any>(null);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    dateOfBirth: '',
    gender: '',
  });

  const handleTabChange = useCallback((tabId: string) => setActiveTab(tabId), []);

  const isLoggedIn = status === 'authenticated';
  const userId = isLoggedIn ? ((session?.user as any)?.id as string) || '' : '';
  const subscription = isLoggedIn ? (session?.user as any)?.subscription : null;
  const isPremium = !!subscription && subscription.status === 'active' && ['Premium Monthly', 'Premium Yearly'].includes(subscription.plan);
  const userName = isLoggedIn ? (session?.user?.name || 'User') : 'Guest User';
  const userEmail = session?.user?.email || '';

  const fetchRecords = useCallback(async (signal?: AbortSignal) => {
    if (!isLoggedIn || !userId) {
      setLoadingRecords(false);
      return;
    }
    try {
      const res = await fetch(`/api/patient-records?userId=${userId}`, { signal });
      const data = await res.json();
      const rec = data.record || null;
      setCurrentRecord(rec);
      setRecords(rec
        ? [{
            id: rec.id,
            title: 'Health Profile',
            date: rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '',
            hospital: 'ZyntraCare Records',
            type: 'report',
          }]
        : []);
    } catch {
      // ignore fetch errors, honest empty state shown
    } finally {
      setLoadingRecords(false);
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/predict-flow', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load flow predictions');
        return res.json();
      })
      .then(data => { if (Array.isArray(data)) setPredictions(data); })
      .catch(() => setError('Some dashboard widgets couldn’t load. Showing cached data.'));

    fetch('/api/beds?limit=5', { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load bed availability');
        return res.json();
      })
      .then(data => { 
        if (data.hospitals) setBedStats(data.hospitals); 
      })
      .catch(() => setError('Some dashboard widgets couldn’t load. Showing cached data.'));

    if (isLoggedIn) {
      fetch(`/api/bookings?userId=${userId}&limit=20`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (data.bookings) {
            setAppointments(data.bookings.map((b: any) => ({
              id: b.id,
              doctor: b.doctorName || b.doctor?.user?.name || 'Doctor',
              specialty: b.specialty || b.doctor?.specialty || 'General',
              hospital: b.hospitalName || b.hospital?.name || '',
              date: b.date ? new Date(b.date).toLocaleDateString() : '',
              dateISO: b.date ? String(b.date).slice(0, 10) : '',
              time: b.time || '',
              status: b.status === 'confirmed' ? 'Upcoming' : b.status === 'completed' ? 'Completed' : b.status === 'cancelled' ? 'Cancelled' : b.status || 'Upcoming',
              type: b.isOnline || b.appointmentType?.toLowerCase().includes('video') ? 'Teleconsult' : 'In-Person',
              notes: b.notes || '',
            })));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAppointments(false));

      fetchRecords(controller.signal);

      setLoadingVitals(true);
      fetch('/api/health-metrics', { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          const metrics = data.metrics || [];
          if (metrics.length > 0) {
            const latest = metrics[metrics.length - 1];
            setVitals({
              bp: latest.bloodPressure || '',
              hr: latest.heartRate ?? null,
              spo2: latest.oxygenLevel ?? null,
              bmi: latest.weight && latest.height
                ? Number((latest.weight / Math.pow(latest.height / 100, 2)).toFixed(1))
                : null,
            });
          } else {
            setVitals({ bp: '', hr: null, spo2: null, bmi: null });
          }
        })
        .catch(() => {})
        .finally(() => setLoadingVitals(false));
    } else {
      setLoadingAppointments(false);
      setLoadingRecords(false);
      setLoadingVitals(false);
    }

    return () => controller.abort();
  }, [isLoggedIn, userId, fetchRecords]);

  const handleSaveRecord = async () => {
    if (!userId) return;
    setSavingRecord(true);
    setError('');
    try {
      const res = await fetch('/api/patient-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      setRecordFormOpen(false);
      await fetchRecords();
    } catch {
      setError('Failed to save health profile. Please try again.');
    } finally {
      setSavingRecord(false);
    }
  };

  const recordFields: { label: string; value: string }[] = currentRecord && [
    { label: 'Blood Type', value: currentRecord.bloodType || '—' },
    { label: 'Date of Birth', value: currentRecord.dateOfBirth || '—' },
    { label: 'Gender', value: currentRecord.gender || '—' },
    { label: 'Allergies', value: currentRecord.allergies || '—' },
    { label: 'Medical History', value: currentRecord.medicalHistory || '—' },
    { label: 'Emergency Contact', value: currentRecord.emergencyContact ? `${currentRecord.emergencyContact}${currentRecord.emergencyContactPhone ? ` (${currentRecord.emergencyContactPhone})` : ''}` : '—' },
  ];

  return (
    <div className="min-h-screen bg-transparent relative overflow-x-hidden font-inter pb-32 text-white">
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.15) 0%, transparent 60%)' }} />
        <div className="absolute bottom-0 left-[10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNTQgMzBoNmY2VjU0SDU0VjMwbS0wIDBiLTZiLTZiNi02aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-20 mask-image-gradient" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10 pt-28">
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="relative bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-6 md:p-10 mb-10 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[60px]" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 w-full text-center md:text-left">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse border-2 border-sky-500/30" style={{ animationDuration: '3s' }} />
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-sky-500 to-indigo-600 p-1 rounded-full shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                <div className="w-full h-full bg-[#020617] rounded-full flex items-center justify-center border-4 border-[#020617] relative overflow-hidden">
                  {session?.user?.image ? (
                    <img src={session?.user?.image || ''} alt={userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <FiUser size={48} className="text-white/80 z-10" />
                  )}
                  <div className="absolute bottom-0 w-full h-1/2 bg-sky-500/20 blur-md" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{userName}</h1>
                {isPremium && (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    <FiStar className="inline mr-1" size={12} /> PREMIUM
                  </span>
                )}
                {!isLoggedIn && (
                  <span className="bg-teal-500/20 text-teal-400 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/30">
                    Guest User
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-3">{userEmail || 'Sign in to access all features'}</p>
              {isLoggedIn ? (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="bg-sky-500/15 text-sky-400 text-xs font-semibold px-3 py-1 rounded-full border border-sky-500/20">Patient</span>
                  <span className="bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20">Verified</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <button onClick={() => window.location.href = '/subscription'} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-500/30 transition">
                    <FiStar className="inline mr-1" size={12} /> Sign up for Premium
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10 w-full md:w-auto">
            {isLoggedIn ? (
              <>
                <button onClick={() => window.location.href = '/specialists'} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiPlus size={15} /> Book Appointment
                </button>
                <button onClick={() => window.location.href = '/teleconsult'} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiVideo size={15} /> Teleconsult
                </button>
              </>
            ) : (
              <div className="w-full flex gap-2">
                <button onClick={() => window.location.href = '/auth/signin'} className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiUser size={15} /> Sign In
                </button>
                <button onClick={() => window.location.href = '/emergency'} className="flex-1 flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl font-semibold text-sm transition">
                  <FiActivity size={15} /> Emergency
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {!isLoggedIn && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-teal-950/60 to-sky-950/40 border border-teal-500/20 rounded-[2rem] p-6 mb-10 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <FiZap className="text-teal-400" size={20} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Welcome to ZyntraCare!</h3>
                <p className="text-slate-400 text-sm">Access emergency features and health info without signing up</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/emergency" className="flex flex-col items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 hover:bg-red-500/20 transition">
                <FiActivity className="text-red-400" size={24} />
                <span className="text-white text-xs font-bold">Emergency</span>
              </Link>
              <Link href="/hospitals" className="flex flex-col items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 hover:bg-sky-500/20 transition">
                <FiMapPin className="text-sky-400" size={24} />
                <span className="text-white text-xs font-bold">Hospitals</span>
              </Link>
              <Link href="/pharmacies" className="flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 hover:bg-emerald-500/20 transition">
                <FaPills className="text-emerald-400" size={24} />
                <span className="text-white text-xs font-bold">Pharmacies</span>
              </Link>
              <Link href="/labs" className="flex flex-col items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-500/20 transition">
                <FaNotesMedical className="text-purple-400" size={24} />
                <span className="text-white text-xs font-bold">Labs</span>
              </Link>
            </div>
          </motion.div>
        )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
              <FiAlertCircle className="text-amber-400 flex-shrink-0" />
              <p className="text-amber-400/90 text-sm font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-amber-400 hover:text-amber-300"><FiX /></button>
            </motion.div>
          )}

        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 custom-scrollbar relative z-10">
            {[
              { icon: <FiVideo />, label: 'Fast Teleconsult', href: '/teleconsult', bg: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
              { icon: <FiCalendar />, label: 'Book Doctor', href: '/specialists', bg: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
              { icon: <FaNotesMedical />, label: 'Pill Scanner', href: '/pill-scanner', bg: 'from-purple-500 to-indigo-600', shadow: 'shadow-purple-500/20' },
            ].map((btn, i) => (
              <Link key={i} href={btn.href} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r ${btn.bg} shadow-lg ${btn.shadow} text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap`}>
                {btn.icon} {btn.label}
              </Link>
            ))}
          </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FiZap className="text-blue-400" /> Daily Health Missions
          </h2>
          <WellnessMissions />
        </motion.div>

        <div className="flex gap-2 overflow-x-auto pb-6 custom-scrollbar mb-4 relative">
          <div className="absolute bottom-6 left-0 w-full h-[1px] bg-white/5" />
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all whitespace-nowrap z-10 text-sm ${
                  isActive ? 'bg-white/[0.08] text-white shadow-2xl' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                }`}>
                <span className={isActive ? 'text-sky-400' : ''}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {isActive && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.8)]" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, type: 'spring', damping: 25 }}>
            
            {activeTab === 'appointments' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {!isLoggedIn ? (
                  <div className="col-span-full text-center py-12 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                    <FiCalendar className="mx-auto text-gray-600 mb-4" size={48} />
                    <p className="text-gray-400 mb-4">Sign in to view your appointments</p>
                    <button onClick={() => window.location.href = '/auth/signin'} className="text-sky-400 hover:text-sky-300 font-bold">Sign In</button>
                  </div>
                ) : loadingAppointments ? (
                  <div className="col-span-full text-center py-12">
                    <FiLoader className="animate-spin text-sky-400 mx-auto mb-4" size={32} />
                    <p className="text-gray-400">Loading appointments...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                    <FiCalendar className="mx-auto text-gray-600 mb-4" size={48} />
                    <p className="text-gray-400 mb-4">No appointments yet</p>
                    <Link href="/specialists" className="text-sky-400 hover:text-sky-300 font-bold">Book Your First Appointment</Link>
                  </div>
                ) : (
                  appointments.map((apt, i) => (
                    <div key={apt.id || i} className="group bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 hover:bg-white/[0.04] transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex gap-5">
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:border-sky-500/50 transition-colors">
                            <FaStethoscope className="text-white text-2xl" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-xl leading-snug">{apt.doctor}</h3>
                            <p className="text-sky-400 font-bold text-sm tracking-wide">{apt.specialty}</p>
                            <p className="text-white/40 text-xs mt-1 font-medium">{apt.hospital}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          apt.status === 'Upcoming' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]' : 'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-[#0f172a] rounded-2xl p-5 border border-white/5 mb-8">
                        <div>
                          <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1 pl-1">Date</p>
                          <p className="text-white font-bold flex items-center gap-2"><FiCalendar className="text-sky-400"/> {apt.date}</p>
                        </div>
                        <div>
                          <p className="text-white/30 text-[10px] uppercase font-black tracking-widest mb-1 pl-1">Time</p>
                          <p className="text-white font-bold flex items-center gap-2"><FiClock className="text-indigo-400"/> {apt.time}</p>
                        </div>
                      </div>
                      {apt.status === 'Upcoming' ? (
                        <div className="flex gap-4">
                          {apt.type === 'Teleconsult' ? (
                            <Link href={`/teleconsult?appt=${apt.id}`} className="flex-[2] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                              <FiVideo /> Join Room
                            </Link>
                          ) : (
                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(apt.hospital || 'nearby hospitals')}`} target="_blank" rel="noopener noreferrer" className="flex-[2] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                              <FiMapPin /> Directions
                            </a>
                          )}
                          <button onClick={() => setSelectedApt(apt)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                            <FiFileText size={18} /> Details
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedApt(apt)} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white py-4 rounded-2xl font-bold transition-all">
                          View Summary
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'health' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Blood Pressure', val: vitals.bp || '--', unit: 'mmHg', color: 'from-rose-500 to-red-600', shadow: 'shadow-rose-500/30', hint: !isLoggedIn ? 'Sign in to view vitals' : vitals.bp ? 'Latest reading' : 'Log via Health Tracker' },
                  { label: 'Heart Rate', val: vitals.hr != null ? String(vitals.hr) : '--', unit: 'BPM', color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/30', hint: !isLoggedIn ? 'Sign in to view vitals' : vitals.hr != null ? 'Latest reading' : 'Log via Health Tracker' },
                  { label: 'Blood Oxygen', val: vitals.spo2 != null ? String(vitals.spo2) : '--', unit: '% SpO2', color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/30', hint: !isLoggedIn ? 'Sign in to view vitals' : vitals.spo2 != null ? 'Latest reading' : 'Log via Health Tracker' },
                  { label: 'BMI Index', val: vitals.bmi != null ? String(vitals.bmi) : '--', unit: 'kg/m²', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30', hint: !isLoggedIn ? 'Sign in to view vitals' : vitals.bmi != null ? 'Latest reading' : 'Log via Health Tracker' },
                ].map((metric, i) => (
                  <div key={i} className={`bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden group hover:bg-white/[0.04] transition-colors`}>
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${metric.color} rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} mb-6 flex items-center justify-center shadow-lg ${metric.shadow}`}>
                      <FiActivity className="text-white text-xl" />
                    </div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest mb-1">{metric.label}</p>
                    <div className="flex items-baseline gap-2">
                      {loadingVitals ? (
                        <span className="text-white/40 text-3xl lg:text-4xl font-black"><FiLoader className="animate-spin inline" size={28} /></span>
                      ) : (
                        <span className="text-3xl lg:text-4xl font-black text-white">{metric.val}</span>
                      )}
                      <span className="text-white/40 font-bold text-sm tracking-wide">{metric.unit}</span>
                    </div>
                    <p className="text-white/20 text-xs mt-2">{metric.hint}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'predictions' && (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center border border-sky-500/20"><FiTrendingUp size={24}/></div>
                      <div>
                        <h3 className="font-black text-white text-xl">Hospital Visit Forecaster</h3>
                        <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Based on live hospital footfall reports</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    {predictions.length > 0 ? (
                      <ClientOnly><LazyLineChart data={predictions.map((val, hr) => ({ hour: hr, count: val }))} /></ClientOnly>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6">
                        <FiTrendingUp className="text-white/20" size={40} />
                        <p className="text-white/40 font-bold">No hospital visit data available yet</p>
                        <p className="text-white/20 text-xs max-w-sm">Forecasts appear here once hospital footfall reports are recorded in the system.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 md:p-8">
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-3"><FiServer className="text-emerald-400" /> Resource Nodes</h3>
                  <div className="space-y-4">
                    {bedStats.slice(0, 5).map((h, i) => (
                      <div key={i} className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-white/5">
                        <span className="text-white/80 font-bold text-sm truncate max-w-[140px]">{h.name}</span>
                        <div className="flex gap-3 text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <span className="text-white"><span className="text-emerald-400 font-black">{h.beds?.available ?? 0}</span> Bed</span>
                          <span className="text-white/20">|</span>
                          <span className="text-white"><span className="text-sky-400 font-black">{h.beds?.icu?.available ?? 0}</span> ICU</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'map' && (
              <div className="rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative bg-[#020617] ring-1 ring-sky-500/20">
                <div className="bg-white/[0.02] border-b border-white/10 p-6 md:p-8 z-10 relative flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-1"><FiMapPin className="text-sky-400" /> ZyntraCare Radar</h2>
                    <p className="text-white/40 text-sm font-bold tracking-widest uppercase">Nearby Hospitals Live</p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
                <div style={{ height: '600px', filter: 'brightness(0.9) contrast(1.1) saturate(1.2)' }}>
                  <NearbyHospitalsMap initialRadius={5} />
                </div>
              </div>
            )}

            {activeTab === 'records' && (
              <PremiumGuard>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {!isLoggedIn ? (
                    <div className="col-span-full text-center py-12 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                      <FiFileText className="mx-auto text-gray-600 mb-4" size={48} />
                      <p className="text-gray-400 mb-4">Sign in to view medical records</p>
                      <button onClick={() => window.location.href = '/auth/signin'} className="text-sky-400 hover:text-sky-300 font-bold">Sign In</button>
                    </div>
                  ) : loadingRecords ? (
                    <div className="col-span-full text-center py-12">
                      <FiLoader className="animate-spin text-emerald-400 mx-auto mb-4" size={32} />
                      <p className="text-gray-400">Loading records...</p>
                    </div>
                  ) : records.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white/[0.02] border border-white/10 rounded-[2rem]">
                      <FiFileText className="mx-auto text-gray-600 mb-4" size={48} />
                      <p className="text-gray-400 mb-4">No health profile yet</p>
                      <p className="text-white/20 text-sm">Add your blood type, allergies &amp; emergency contact to get started</p>
                    </div>
                  ) : (
                    records.map((rec, i) => (
                      <div key={rec.id || i} onClick={() => setRecordView(currentRecord)} className="bg-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-[2rem] p-6 md:p-8 group transition-all relative overflow-hidden cursor-pointer hover:bg-white/[0.04]">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                          {rec.type === 'report' ? <FaNotesMedical size={24} /> : <FaPills size={24} />}
                        </div>
                        <h3 className="font-black text-white text-lg mb-2">{rec.title}</h3>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6">{rec.hospital} • {rec.date}</p>
                        <button onClick={() => setRecordView(currentRecord)} className="text-emerald-400 text-sm font-black uppercase tracking-wide flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                          View Document <FiChevronRight />
                        </button>
                      </div>
                    ))
                  )}
                  
                  {isLoggedIn && (
                    <div onClick={() => { setFormData({
                      bloodType: currentRecord?.bloodType || '',
                      allergies: currentRecord?.allergies || '',
                      medicalHistory: currentRecord?.medicalHistory || '',
                      emergencyContact: currentRecord?.emergencyContact || '',
                      emergencyContactPhone: currentRecord?.emergencyContactPhone || '',
                      dateOfBirth: currentRecord?.dateOfBirth || '',
                      gender: currentRecord?.gender || '',
                    }); setRecordFormOpen(true); }}
                      className="bg-white/[0.01] backdrop-blur-xl border-2 border-dashed border-white/10 hover:border-sky-500/50 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[250px] cursor-pointer transition-colors group hover:bg-sky-500/5">
                      <div className="w-16 h-16 bg-white/5 text-white/50 group-hover:bg-sky-500/20 group-hover:text-sky-400 rounded-full flex items-center justify-center mb-4 transition-colors">
                        <FiPlus size={32} />
                      </div>
                      <span className="font-black text-white/50 group-hover:text-white uppercase tracking-widest text-sm transition-colors">{currentRecord ? 'Edit Profile' : 'Upload Record'}</span>
                    </div>
                  )}
                </div>
              </PremiumGuard>
            )}
            
          </motion.div>
        </AnimatePresence>

        {selectedApt && (
          <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedApt(null)}>
            <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedApt(null)} className="absolute top-4 right-4 text-white/40 hover:text-white"><FiX /></button>
              <h3 className="text-white font-black text-xl mb-4 flex items-center gap-2"><FiCalendar className="text-sky-400" /> Appointment Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Doctor', value: selectedApt.doctor },
                  { label: 'Specialty', value: selectedApt.specialty },
                  { label: 'Hospital', value: selectedApt.hospital || '—' },
                  { label: 'Date', value: selectedApt.date || '—' },
                  { label: 'Time', value: selectedApt.time || '—' },
                  { label: 'Type', value: selectedApt.type },
                  { label: 'Status', value: selectedApt.status },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{row.label}</span>
                    <span className="text-white font-bold text-right">{row.value}</span>
                  </div>
                ))}
                {selectedApt.notes && (
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-1">Notes / Symptoms</p>
                    <p className="text-white text-sm">{selectedApt.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {recordView && (
          <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRecordView(null)}>
            <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setRecordView(null)} className="absolute top-4 right-4 text-white/40 hover:text-white"><FiX /></button>
              <h3 className="text-white font-black text-xl mb-6 flex items-center gap-2"><FiFileText className="text-emerald-400" /> Health Profile</h3>
              <div className="space-y-3 text-sm">
                {recordFields.map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                    <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{row.label}</span>
                    <span className="text-white font-bold text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setFormData({
                bloodType: currentRecord?.bloodType || '',
                allergies: currentRecord?.allergies || '',
                medicalHistory: currentRecord?.medicalHistory || '',
                emergencyContact: currentRecord?.emergencyContact || '',
                emergencyContactPhone: currentRecord?.emergencyContactPhone || '',
                dateOfBirth: currentRecord?.dateOfBirth || '',
                gender: currentRecord?.gender || '',
              }); setRecordView(null); setRecordFormOpen(true); }}
                className="mt-6 w-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-bold text-sm transition">
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {recordFormOpen && (
          <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setRecordFormOpen(false)}>
            <div className="bg-slate-900/95 border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg my-8 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setRecordFormOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><FiX /></button>
              <h3 className="text-white font-black text-xl mb-1"><FiFileText className="inline text-emerald-400 mr-2" /> Health Profile</h3>
              <p className="text-white/40 text-xs mb-6">This powers your dashboard records and emergency contacts.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Blood Type</span>
                  <select value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Gender</span>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Date of Birth</span>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50" />
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Emergency Contact Name</span>
                  <input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} placeholder="e.g. Mother" className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50" />
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Emergency Contact Phone</span>
                  <input value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} placeholder="10-digit mobile" className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50" />
                </label>
              </div>
              <label className="block mt-4">
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Allergies</span>
                <input value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} placeholder="e.g. Penicillin, Peanuts" className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50" />
              </label>
              <label className="block mt-4">
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Medical History</span>
                <textarea value={formData.medicalHistory} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} placeholder="e.g. Diabetes, Asthma, past surgeries" rows={3} className="mt-1 w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-emerald-500/50 resize-none" />
              </label>
              <button onClick={handleSaveRecord} disabled={savingRecord} className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white py-4 rounded-2xl font-black text-sm transition flex items-center justify-center gap-2 disabled:opacity-60">
                {savingRecord ? <><FiLoader className="animate-spin" size={18} /> Saving...</> : <><FiCheck size={18} /> Save Profile</>}
              </button>
            </div>
          </div>
        )}
        
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.3); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.5); }
      `}</style>
    </div>
  );
}
