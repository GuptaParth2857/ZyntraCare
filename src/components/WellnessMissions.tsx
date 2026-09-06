'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FiCheckCircle, FiActivity, FiZap, FiArrowRight, FiCalendar, FiUser } from 'react-icons/fi';
import { GiWaterDrop, GiWalk } from 'react-icons/gi';

interface Mission {
  id: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  unit: string;
  link: string;
  icon: React.ReactNode;
  color: string;
  cta: string;
}

const BASE_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Log Today\'s Vitals',
    desc: 'Log your BP, pulse or weight in Health Tracker',
    progress: 0,
    target: 1,
    unit: 'log',
    link: '/health-tracker',
    icon: <GiWaterDrop size={20} />,
    color: 'from-blue-500 to-cyan-500',
    cta: 'Log Vitals',
  },
  {
    id: 'm2',
    title: 'Schedule an Appointment',
    desc: 'Have an upcoming doctor visit scheduled',
    progress: 0,
    target: 1,
    unit: 'appt',
    link: '/specialists',
    icon: <GiWalk size={20} />,
    color: 'from-emerald-500 to-teal-500',
    cta: 'Book Visit',
  },
  {
    id: 'm3',
    title: 'Complete Your Health Profile',
    desc: 'Add blood type, allergies & emergency contact',
    progress: 0,
    target: 1,
    unit: 'profile',
    link: '/dashboard?tab=records',
    icon: <FiZap size={20} />,
    color: 'from-orange-500 to-red-500',
    cta: 'Update Profile',
  }
];

export default function WellnessMissions() {
  const { data: session, status } = useSession();
  const [missions, setMissions] = useState<Mission[]>(BASE_MISSIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLoggedIn = status === 'authenticated';

  useEffect(() => {
    if (!isLoggedIn) {
      setMissions(BASE_MISSIONS);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const userId = (session?.user as any)?.id as string;
    const today = new Date().toISOString().split('T')[0];

    (async () => {
      try {
        const [metricsRes, bookingsRes, recordRes] = await Promise.all([
          fetch('/api/health-metrics', { signal: controller.signal }),
          fetch(`/api/bookings?userId=${encodeURIComponent(userId || '')}`, { signal: controller.signal }),
          fetch('/api/patient-records', { signal: controller.signal }),
        ]);

        const [metricsData, bookingsData, recordData] = await Promise.all([
          metricsRes.json(),
          bookingsRes.json(),
          recordRes.json(),
        ]);

        const vitalsLogged = (metricsData.metrics || []).filter(
          (m: any) => m.date === today
        ).length;
        const upcomingAppointments = (bookingsData.bookings || []).filter((b: any) => {
          if (b.status !== 'confirmed') return false;
          const aptDate = b.date ? String(b.date).slice(0, 10) : '';
          return aptDate >= today;
        }).length;
        const profileComplete = Array.isArray(recordData.records) && recordData.records.length > 0;

        setMissions([
          { ...BASE_MISSIONS[0], progress: Math.min(vitalsLogged, 1) },
          { ...BASE_MISSIONS[1], progress: Math.min(upcomingAppointments, 1) },
          { ...BASE_MISSIONS[2], progress: profileComplete ? 1 : 0 },
        ]);
      } catch {
        setError('Health activity unavailable right now.');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [isLoggedIn, session]);

  const totalPct = missions.reduce((sum, m) => sum + Math.min(m.progress / m.target, 1) * 100, 0) / missions.length;
  const score = Math.round(totalPct);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <p className="text-gray-400 text-sm font-semibold mb-1">Today&apos;s Activity Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{score}</span>
            <span className="text-blue-400 font-bold text-sm">/ 100</span>
          </div>
          {!isLoggedIn && (
            <p className="text-gray-500 text-xs mt-2">Sign in to track your health activity</p>
          )}
        </div>
        <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <FiActivity size={32} className="text-white" />
        </div>
      </div>

      {error && !loading && (
        <p className="text-sm text-amber-400/90">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missions.map((mission, idx) => {
          const pct = Math.min(mission.target > 0 ? Math.round((mission.progress / mission.target) * 100) : 0, 100);
          const done = mission.progress >= mission.target;
          return (
            <div
              key={mission.id}
              style={{ transitionDelay: `${idx * 60}ms` }}
              className={`relative bg-slate-900/50 border rounded-3xl p-5 overflow-hidden group transition ${
                done ? 'border-emerald-500/30' : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${mission.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mission.color} flex items-center justify-center text-white`}>
                  {mission.icon}
                </div>
                {done && (
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 uppercase tracking-widest font-black flex items-center gap-1"><FiCheckCircle size={14} /> Done</span>
                  </div>
                )}
              </div>

              <h3 className="text-white font-bold mb-1">{mission.title}</h3>
              <p className="text-gray-500 text-xs mb-4">{mission.desc}</p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{mission.progress} / {mission.target} {mission.unit}</span>
                  <span className={done ? 'text-emerald-400' : 'text-blue-400'}>{pct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${mission.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {isLoggedIn ? (
                done ? (
                  <div className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <><FiCheckCircle className="inline mr-1" /> Completed</>
                  </div>
                ) : (
                  <Link
                    href={mission.link}
                    className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  >
                    {mission.cta} <FiArrowRight />
                  </Link>
                )
              ) : (
                <Link
                  href="/auth/signin"
                  className="w-full mt-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 bg-white/5 text-white border border-white/10 hover:bg-white/10"
                >
                  Sign In <FiArrowRight />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {!isLoggedIn && (
        <div className="flex items-center gap-3 text-gray-500 text-sm">
          <FiCalendar className="text-blue-400" />
          <span>Missed missions are counted from your real health activity.</span>
          <FiUser className="text-emerald-400" />
        </div>
      )}
    </div>
  );
}