'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FiActivity, FiAlertTriangle, FiZap, FiTarget, FiTrendingUp,
  FiUsers, FiClock, FiMapPin, FiRadio, FiAward, FiGlobe,
  FiTrendingDown, FiShield, FiDatabase, FiUser, FiHome, FiUserCheck, FiServer
} from 'react-icons/fi';
import RoleGuard from '@/components/RoleGuard';

interface LiveAlert {
  id: string;
  type: 'emergency' | 'critical' | 'warning' | 'success';
  city: string;
  lat: number;
  lng: number;
  message: string;
  time: string;
  priority: number;
}

interface HealthMetric {
  label: string;
  value: number;
  delta: number;
  icon: React.ReactNode;
  color: string;
}

interface City {
  name: string;
  lat: number;
  lng: number;
  size: number;
  hospitals: number;
}

interface EmergencyAlertRow {
  id: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  alertType: string;
  status: string;
  time: string;
}

interface OverviewData {
  counts: {
    users: number; hospitals: number; doctors: number; labs: number; pharmacies: number;
    appointments: number; emergencyAlerts: number; healthRecords: number; subscriptions: number;
    feedback: number; contacts: number; sponsors: number; camps: number; organDonors: number;
    organRecipients: number; transactions: number; rewards: number; drones: number;
    ambulances: number; clinics: number; onlineNow: number; beds: number;
  };
  today: {
    users: number; hospitals: number; doctors: number; labs: number; pharmacies: number;
    appointments: number; emergencyAlerts: number; healthRecords: number; feedback: number;
    transactions: number; rewards: number; drones: number;
  };
  recent: { type: string; message: string; time: string }[];
  emergencyAlerts: EmergencyAlertRow[];
  cities: City[];
  bedSummary: {
    total: number; available: number; occupied: number; occupancy: number;
    icu: number; availableIcu: number; icuOccupancy: number;
  };
  rates: {
    appointmentConfirmation: number; doctorAvailability: number;
    verifiedHospitals: number; alertResolution: number;
  };
  timestamp: string;
}

function alertToLiveAlert(a: EmergencyAlertRow): LiveAlert {
  const lowerType = (a.alertType || '').toLowerCase();
  const type: LiveAlert['type'] =
    a.status !== 'TRIGGERED' ? 'success'
    : lowerType.includes('crit') ? 'critical'
    : 'emergency';
  return {
    id: a.id,
    type,
    city: a.location || 'Unknown',
    lat: a.latitude ?? 20.5937,
    lng: a.longitude ?? 78.9629,
    message: `${a.alertType || 'MEDICAL'} alert — ${a.status || 'TRIGGERED'}`,
    time: new Date(a.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    priority: 5,
  };
}

export default function GodModePage() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [systemPulse, setSystemPulse] = useState(0);
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/overview');
        if (!res.ok) throw new Error('failed');
        const data: OverviewData = await res.json();
        setOverview(data);
        setCities(data.cities || []);
        setAlerts((data.emergencyAlerts || []).map(alertToLiveAlert));
        setLiveFeed(
          (data.recent || []).slice(0, 10).map(r =>
            `${r.type === 'user' ? '🆕' : r.type === 'appointment' ? '🗓️' : '💬'} ${r.message} [${new Date(r.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}]`
          )
        );
        const c = data.counts;
        const t = data.today;
        setHealthMetrics([
          { label: 'Users Online', value: c.onlineNow, delta: t.users, icon: <FiUsers />, color: 'text-blue-400' },
          { label: 'Registered Users', value: c.users, delta: t.users, icon: <FiUser />, color: 'text-sky-400' },
          { label: 'Hospitals', value: c.hospitals, delta: t.hospitals, icon: <FiHome />, color: 'text-teal-400' },
          { label: 'Doctors', value: c.doctors, delta: t.doctors, icon: <FiUserCheck />, color: 'text-emerald-400' },
          { label: 'Emergency Alerts', value: c.emergencyAlerts, delta: t.emergencyAlerts, icon: <FiAlertTriangle />, color: 'text-red-400' },
          { label: 'Health Records', value: c.healthRecords, delta: t.healthRecords, icon: <FiDatabase />, color: 'text-green-400' },
        ]);
      } catch {
        // keep existing data on failure
      }
    };
    load();
    const refresh = setInterval(load, 30000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setSystemPulse(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawMap = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(20, 200, 180, 0.1)';
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 20) * i);
        ctx.lineTo(canvas.width, (canvas.height / 20) * i);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo((canvas.width / 20) * i, 0);
        ctx.lineTo((canvas.width / 20) * i, canvas.height);
        ctx.stroke();
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scaleX = canvas.width / 40;
      const scaleY = canvas.height / 30;

      cities.forEach((city) => {
        const x = centerX + (city.lng - 78) * scaleX;
        const y = centerY - (city.lat - 22) * scaleY;
        const size = city.size * 8 + Math.sin(systemPulse / 10 + city.lat) * 2;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        if (city.name === selectedCity) {
          gradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
          gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(20, 200, 180, 0.6)');
          gradient.addColorStop(1, 'rgba(20, 200, 180, 0)');
        }

        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = city.name === selectedCity ? '#ff6464' : '#14c8b4';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(city.name, x, y - size - 8);
      });

      alerts.slice(0, 40).forEach((alert) => {
        const x = centerX + (alert.lng - 78) * scaleX;
        const y = centerY - (alert.lat - 22) * scaleY;

        const colors: Record<string, string> = {
          emergency: '#ff4444',
          critical: '#ff8844',
          warning: '#ffaa00',
          success: '#44ff88'
        };

        ctx.beginPath();
        ctx.arc(x, y, 12 + Math.sin(systemPulse / 5) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = colors[alert.type];
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    drawMap();
  }, [systemPulse, selectedCity, alerts, cities]);

  const getAlertColor = (type: LiveAlert['type']) => {
    const colors = {
      emergency: 'bg-red-500/20 border-red-500 text-red-400',
      critical: 'bg-orange-500/20 border-orange-500 text-orange-400',
      warning: 'bg-amber-500/20 border-amber-500 text-amber-400',
      success: 'bg-green-500/20 border-green-500 text-green-400'
    };
    return colors[type];
  };

  const selectedCityInfo = selectedCity ? cities.find(c => c.name === selectedCity) : null;
  const counts = overview?.counts;
  const rates = overview?.rates;
  const beds = overview?.bedSummary;

  return (
    <RoleGuard
      allow={['admin']}
      title="Admin access required"
      description="Please sign in with an admin account to view God Mode."
    >
    <div className="min-h-screen bg-transparent text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
              <FiShield className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
                ZYNTRA GOD MODE
              </h1>
              <p className="text-slate-400 text-sm">Real-time health infrastructure overview from live database</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-2">
              <FiActivity className="text-green-400 animate-pulse" />
              <span className="text-green-400 font-mono text-sm">
                {(counts?.onlineNow ?? 0).toLocaleString()} ONLINE
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center gap-2">
              <FiGlobe className="text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm">DB CONNECTED</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {healthMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <div className={`text-2xl mb-2 ${metric.color}`}>{metric.icon}</div>
            <div className="text-2xl font-bold text-white">{metric.value.toLocaleString()}</div>
            <div className="text-xs text-slate-400">{metric.label}</div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metric.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metric.delta >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {Math.abs(metric.delta)} today
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiMapPin className="text-cyan-400" />
              Live Health Map
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Emergency</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Resolved</span>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="w-full cursor-crosshair"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const centerX = rect.width / 2;
              const scaleX = rect.width / 40;

              const city = cities.find((c) => {
                const cityX = centerX + (c.lng - 78) * scaleX;
                return Math.abs(cityX - x) < 30;
              });

              if (city) setSelectedCity(selectedCity === city.name ? null : city.name);
            }}
          />
          {selectedCity && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-red-500/10 border-t border-red-500/30"
            >
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                <FiAlertTriangle />
                {selectedCity}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-red-400">{selectedCityInfo?.hospitals ?? 0}</div>
                  <div className="text-xs text-slate-400">Hospitals in City</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-cyan-400">
                    {counts && selectedCityInfo ? Math.round((selectedCityInfo.hospitals / (counts.hospitals || 1)) * 100) : 0}%
                  </div>
                  <div className="text-xs text-slate-400">Share of Network</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-green-400">{beds?.available ?? 0}</div>
                  <div className="text-xs text-slate-400">Beds Available</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-amber-400">{alerts.length}</div>
                  <div className="text-xs text-slate-400">Live Alerts</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiRadio className="text-red-400 animate-pulse" />
                Emergency Feed
              </h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-8">No emergency alerts recorded.</p>
              ) : (
                alerts.slice(0, 10).map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 border-b border-white/5 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">{alert.city}</span>
                      <span className="opacity-60">{alert.time}</span>
                    </div>
                    <div className="text-sm mt-1">{alert.message}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiActivity className="text-green-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              {liveFeed.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6">No recent activity.</p>
              ) : (
                liveFeed.map((feed, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-slate-300 font-mono py-1 border-b border-white/5"
                  >
                    {feed}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiTarget className="text-cyan-400 text-xl" />
            <span className="text-cyan-400 font-bold">Network</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Drones</span>
              <span className="text-white font-mono">{(counts?.drones ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hospitals</span>
              <span className="text-white font-mono">{(counts?.hospitals ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cities Covered</span>
              <span className="text-white font-mono">{cities.length.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ambulances</span>
              <span className="text-white font-mono">{(counts?.ambulances ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiAward className="text-green-400 text-xl" />
            <span className="text-green-400 font-bold">Service Quality</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Appointment Confirmations</span>
              <span className="text-green-400 font-mono">{rates?.appointmentConfirmation ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Doctors Available</span>
              <span className="text-green-400 font-mono">{rates?.doctorAvailability ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verified Hospitals</span>
              <span className="text-green-400 font-mono">{rates?.verifiedHospitals ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Alert Resolution</span>
              <span className="text-green-400 font-mono">{rates?.alertResolution ?? 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiServer className="text-amber-400 text-xl" />
            <span className="text-amber-400 font-bold">Bed Availability</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Beds</span>
              <span className="text-white font-mono">{beds?.total.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Available</span>
              <span className="text-green-400 font-mono">{beds?.available.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Occupancy</span>
              <span className="text-white font-mono">{beds?.occupancy ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">ICU Available</span>
              <span className="text-white font-mono">{beds?.availableIcu.toLocaleString() ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-purple-400 text-xl" />
            <span className="text-purple-400 font-bold">Last 24 Hours</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">New Users</span>
              <span className="text-white font-mono">{overview?.today.users.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">New Appointments</span>
              <span className="text-white font-mono">{overview?.today.appointments.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">New Alerts</span>
              <span className="text-white font-mono">{overview?.today.emergencyAlerts.toLocaleString() ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">New Health Records</span>
              <span className="text-white font-mono">{overview?.today.healthRecords.toLocaleString() ?? 0}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-black/40 border border-white/10 rounded-xl"
      >
        <p className="text-center text-slate-500 text-xs">
          ZyntraCare Real-Time Dashboard | {(counts?.users ?? 0).toLocaleString()} registered users | {(counts?.hospitals ?? 0).toLocaleString()} hospitals | {(counts?.emergencyAlerts ?? 0).toLocaleString()} emergency alerts |
          <span className="text-green-400"> Data from live database </span> |
          Last synced {overview ? new Date(overview.timestamp || Date.now()).toLocaleTimeString('en-IN') : '…'}
        </p>
      </motion.div>
    </div>
    </RoleGuard>
  );
}