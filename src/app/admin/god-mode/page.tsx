'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, FiAlertTriangle, FiHeart, FiZap, FiTarget, FiTrendingUp, 
  FiUsers, FiClock, FiMapPin, FiRadio, FiNavigation, FiAward, FiGlobe, FiPhone,
  FiTrendingDown, FiCheckCircle, FiRefreshCw, FiShield, FiDatabase
} from 'react-icons/fi';

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
  change: number;
  icon: React.ReactNode;
  color: string;
}

const INDIA_CITIES = [
  { name: 'Mumbai', lat: 19.076, lng: 72.877, size: 1.2 },
  { name: 'Delhi', lat: 28.613, lng: 77.209, size: 1.1 },
  { name: 'Bangalore', lat: 12.971, lng: 77.594, size: 1.0 },
  { name: 'Chennai', lat: 13.082, lng: 80.271, size: 0.9 },
  { name: 'Kolkata', lat: 22.573, lng: 88.363, size: 0.85 },
  { name: 'Hyderabad', lat: 17.375, lng: 78.474, size: 0.9 },
  { name: 'Pune', lat: 18.520, lng: 73.856, size: 0.8 },
  { name: 'Ahmedabad', lat: 23.030, lng: 72.580, size: 0.75 },
  { name: 'Jaipur', lat: 26.912, lng: 75.787, size: 0.7 },
  { name: 'Lucknow', lat: 26.846, lng: 80.946, size: 0.65 },
  { name: 'Kanpur', lat: 26.449, lng: 80.332, size: 0.6 },
  { name: 'Nagpur', lat: 21.146, lng: 79.084, size: 0.55 },
  { name: 'Indore', lat: 22.719, lng: 75.858, size: 0.5 },
  { name: 'Coimbatore', lat: 11.017, lng: 76.955, size: 0.5 },
];

const ALERT_TYPES = ['Heart Attack SOS', 'Stroke Alert', 'Dengue Outbreak', 'Blood Shortage', 'Drone Dispatch', 'Organ Match Found'];
const MESSAGES = [
  'Emergency SOS received - ETA 8 mins',
  'Critical condition detected - Drone dispatched',
  'Outbreak pattern identified - Alert sent',
  'Blood unit matched - Hospital notified',
  'Drone delivering medicine - Live tracking',
  'Organ match confirmed - All parties alerted'
];

function generateLiveAlert(): LiveAlert {
  const city = INDIA_CITIES[Math.floor(Math.random() * INDIA_CITIES.length)];
  const types: LiveAlert['type'][] = ['emergency', 'critical', 'warning', 'success'];
  return {
    id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type: types[Math.floor(Math.random() * types.length)],
    city: city.name,
    lat: city.lat + (Math.random() - 0.5) * 2,
    lng: city.lng + (Math.random() - 0.5) * 2,
    message: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    priority: Math.floor(Math.random() * 10) + 1
  };
}

export default function GodModePage() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [activeConnections, setActiveConnections] = useState(12847);
  const [droneCount, setDroneCount] = useState(342);
  const [activeEmergencies, setActiveEmergencies] = useState(23);
  const [totalRecords, setTotalRecords] = useState(2847591);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [systemPulse, setSystemPulse] = useState(0);
  const [liveFeed, setLiveFeed] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const initialAlerts = Array.from({ length: 12 }, generateLiveAlert);
    setAlerts(initialAlerts);

    setHealthMetrics([
      { label: 'Active Users', value: activeConnections, change: 12.5, icon: <FiUsers />, color: 'text-blue-400' },
      { label: 'Drones Active', value: droneCount, change: 8.3, icon: <FiZap />, color: 'text-cyan-400' },
      { label: 'Emergencies', value: activeEmergencies, change: -15.2, icon: <FiAlertTriangle />, color: 'text-red-400' },
      { label: 'Health Records', value: totalRecords, change: 24.7, icon: <FiDatabase />, color: 'text-green-400' },
      { label: 'Response Time', value: 4.2, change: -22.1, icon: <FiClock />, color: 'text-amber-400' },
      { label: 'System Uptime', value: 99.97, change: 0.01, icon: <FiActivity />, color: 'text-emerald-400' },
    ]);

    const feedMessages = [
      '🔴 Mumbai: Emergency SOS detected - Heart rate 180bpm',
      '🚁 Drone #447 dispatched from Mumbai Hub',
      '🏥 Fortis Hospital bed availability confirmed',
      '📋 Medical records synced to blockchain',
      '✅ Patient vitals uploaded to dashboard',
      '💳 Insurance claim auto-processed - ₹45,000',
      '🧬 DNA profile matched with pharmacogenomic data',
      '🌍 Delhi: AI predicted dengue outbreak zone',
      '🔗 Organ match found - Blood Type O negative',
      '👁️ Accessibility mode activated via eye tracking',
    ];
    setLiveFeed(feedMessages.slice(0, 5));

    const alertInterval = setInterval(() => {
      const newAlert = generateLiveAlert();
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
      setActiveConnections(prev => prev + Math.floor(Math.random() * 5));
      setDroneCount(prev => prev + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0));
      setActiveEmergencies(prev => Math.max(0, prev + (Math.random() > 0.6 ? -1 : 1)));
      setTotalRecords(prev => prev + Math.floor(Math.random() * 100));

      if (Math.random() > 0.6) {
        setLiveFeed(prev => [
          `${feedMessages[Math.floor(Math.random() * feedMessages.length)]} [${new Date().toLocaleTimeString()}]`,
          ...prev.slice(0, 9)
        ]);
      }
    }, 3000);

    const pulseInterval = setInterval(() => {
      setSystemPulse(prev => (prev + 1) % 100);
    }, 100);

    return () => {
      clearInterval(alertInterval);
      clearInterval(pulseInterval);
    };
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

      INDIA_CITIES.forEach((city) => {
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

      alerts.forEach((alert) => {
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
  }, [systemPulse, selectedCity, alerts]);

  const getAlertColor = (type: LiveAlert['type']) => {
    const colors = {
      emergency: 'bg-red-500/20 border-red-500 text-red-400',
      critical: 'bg-orange-500/20 border-orange-500 text-orange-400',
      warning: 'bg-amber-500/20 border-amber-500 text-amber-400',
      success: 'bg-green-500/20 border-green-500 text-green-400'
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4">
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
              <p className="text-slate-400 text-sm">India's Real-Time Health Infrastructure Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-2">
              <FiActivity className="text-green-400 animate-pulse" />
              <span className="text-green-400 font-mono text-sm">
                {systemPulse.toString().padStart(2, '0')}% LOAD
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center gap-2">
              <FiGlobe className="text-cyan-400" />
              <span className="text-cyan-400 font-mono text-sm">LIVE</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        {healthMetrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <div className={`text-2xl mb-2 ${metric.color}`}>{metric.icon}</div>
            <div className="text-2xl font-bold text-white">
              {metric.value.toLocaleString()}
              {metric.label === 'Response Time' ? 'm' : metric.label === 'System Uptime' ? '%' : '+'}
            </div>
            <div className="text-xs text-slate-400">{metric.label}</div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metric.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {Math.abs(metric.change)}%
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FiMapPin className="text-cyan-400" />
              Live India Health Map
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Emergency</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Normal</span>
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
              
              const city = INDIA_CITIES.find((c) => {
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
                {selectedCity} - Critical Zone
              </h3>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-red-400">23</div>
                  <div className="text-xs text-slate-400">Active Emergencies</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-cyan-400">147</div>
                  <div className="text-xs text-slate-400">Drones Active</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-green-400">89%</div>
                  <div className="text-xs text-slate-400">Bed Availability</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-bold text-amber-400">4.2m</div>
                  <div className="text-xs text-slate-400">Avg Response</div>
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
                Live Emergency Feed
              </h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.slice(0, 10).map((alert, idx) => (
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
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiActivity className="text-green-400" />
                System Activity
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
              {liveFeed.map((feed, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-slate-300 font-mono py-1 border-b border-white/5"
                >
                  {feed}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 grid grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiTarget className="text-cyan-400 text-xl" />
            <span className="text-cyan-400 font-bold">Quick Stats</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Drones</span>
              <span className="text-white font-mono">{droneCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hospitals Connected</span>
              <span className="text-white font-mono">2,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cities Covered</span>
              <span className="text-white font-mono">547</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiAward className="text-green-400 text-xl" />
            <span className="text-green-400 font-bold">Success Rate</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Response</span>
              <span className="text-green-400 font-mono">97.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Organ Matching</span>
              <span className="text-green-400 font-mono">99.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Drone Delivery</span>
              <span className="text-green-400 font-mono">94.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiClock className="text-amber-400 text-xl" />
            <span className="text-amber-400 font-bold">Response Times</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Emergency</span>
              <span className="text-white font-mono">4.2m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Telehealth</span>
              <span className="text-white font-mono">2.1m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lab Results</span>
              <span className="text-white font-mono">48h</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <FiDatabase className="text-purple-400 text-xl" />
            <span className="text-purple-400 font-bold">Data Pipeline</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Records Processed</span>
              <span className="text-white font-mono">{totalRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blockchain Txs</span>
              <span className="text-white font-mono">847K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">API Calls Today</span>
              <span className="text-white font-mono">2.4M</span>
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
          ZyntraCare Nervous System v2.0 | Processing {activeConnections.toLocaleString()}+ concurrent health connections | 
          <span className="text-green-400"> System Healthy </span> | 
          <span className="text-cyan-400"> Real-time Sync Active </span>
        </p>
      </motion.div>
    </div>
  );
}