'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiActivity, FiAlertTriangle, FiMapPin, FiTrendingUp, FiTrendingDown,
  FiShield, FiClock, FiUsers, FiTarget, FiZap, FiCheckCircle, FiRadio
} from 'react-icons/fi';

interface CityOutbreak {
  city: string;
  lat: number;
  lng: number;
  symptomScore: number;
  salesSpike: number;
  searchSpike: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  predictedDay: number;
}

interface Alert {
  id: string;
  city: string;
  disease: string;
  probability: number;
  timestamp: string;
}

const INDIAN_CITIES: CityOutbreak[] = [
  { city: 'Mumbai', lat: 19.076, lng: 72.877, symptomScore: 45, salesSpike: 120, searchSpike: 85, risk: 'critical', predictedDay: 2 },
  { city: 'Delhi', lat: 28.613, lng: 77.209, symptomScore: 38, salesSpike: 95, searchSpike: 72, risk: 'high', predictedDay: 3 },
  { city: 'Bangalore', lat: 12.971, lng: 77.594, symptomScore: 28, salesSpike: 65, searchSpike: 45, risk: 'medium', predictedDay: 5 },
  { city: 'Chennai', lat: 13.082, lng: 80.271, symptomScore: 22, salesSpike: 48, searchSpike: 35, risk: 'medium', predictedDay: 7 },
  { city: 'Kolkata', lat: 22.573, lng: 88.363, symptomScore: 35, salesSpike: 88, searchSpike: 62, risk: 'high', predictedDay: 4 },
  { city: 'Hyderabad', lat: 17.375, lng: 78.474, symptomScore: 18, salesSpike: 32, searchSpike: 28, risk: 'low', predictedDay: 10 },
  { city: 'Pune', lat: 18.520, lng: 73.856, symptomScore: 42, salesSpike: 110, searchSpike: 78, risk: 'critical', predictedDay: 2 },
  { city: 'Ahmedabad', lat: 23.030, lng: 72.580, symptomScore: 30, salesSpike: 72, searchSpike: 55, risk: 'high', predictedDay: 4 },
  { city: 'Jaipur', lat: 26.912, lng: 75.787, symptomScore: 15, salesSpike: 25, searchSpike: 18, risk: 'low', predictedDay: 12 },
  { city: 'Lucknow', lat: 26.846, lng: 80.946, symptomScore: 25, salesSpike: 55, searchSpike: 42, risk: 'medium', predictedDay: 6 },
  { city: 'Kanpur', lat: 26.449, lng: 80.332, symptomScore: 20, salesSpike: 38, searchSpike: 30, risk: 'low', predictedDay: 8 },
  { city: 'Nagpur', lat: 21.146, lng: 79.084, symptomScore: 12, salesSpike: 20, searchSpike: 15, risk: 'low', predictedDay: 14 },
  { city: 'Indore', lat: 22.719, lng: 75.858, symptomScore: 28, salesSpike: 62, searchSpike: 48, risk: 'medium', predictedDay: 5 },
  { city: 'Coimbatore', lat: 11.017, lng: 76.955, symptomScore: 10, salesSpike: 18, searchSpike: 12, risk: 'low', predictedDay: 15 },
];

const ACTIVE_ALERTS: Alert[] = [
  { id: 'ALT-001', city: 'Mumbai', disease: 'Dengue Outbreak', probability: 92, timestamp: '2 hours ago' },
  { id: 'ALT-002', city: 'Pune', disease: 'Viral Fever', probability: 85, timestamp: '5 hours ago' },
  { id: 'ALT-003', city: 'Delhi', disease: 'Covid-19 Variant', probability: 68, timestamp: '8 hours ago' },
  { id: 'ALT-004', city: 'Kolkata', disease: 'Cholera', probability: 45, timestamp: '12 hours ago' },
];

export default function OutbreakRadarPage() {
  const [cities, setCities] = useState<CityOutbreak[]>(INDIAN_CITIES);
  const [alerts, setAlerts] = useState<Alert[]>(ACTIVE_ALERTS);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [systemPulse, setSystemPulse] = useState(0);
  const [totalRisk, setTotalRisk] = useState(0);
  const [activeDiseases, setActiveDiseases] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setSystemPulse(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(pulseInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCities(prev => prev.map(city => ({
        ...city,
        symptomScore: Math.max(0, Math.min(100, city.symptomScore + (Math.random() - 0.5) * 10)),
        salesSpike: Math.max(0, Math.min(200, city.salesSpike + (Math.random() - 0.5) * 15)),
        searchSpike: Math.max(0, Math.min(100, city.searchSpike + (Math.random() - 0.5) * 8)),
        risk: calculateRisk(city) as CityOutbreak['risk'],
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const risk = cities.reduce((acc, city) => acc + getRiskScore(city.risk), 0) / cities.length;
    setTotalRisk(Math.round(risk));
    setActiveDiseases(cities.filter(c => c.risk === 'critical' || c.risk === 'high').length);
  }, [cities]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawMap = () => {
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(20, 200, 180, 0.05)';
      ctx.lineWidth = 1;
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

      cities.forEach(city => {
        const x = centerX + (city.lng - 78) * scaleX;
        const y = centerY - (city.lat - 22) * scaleY;
        const size = 8 + (city.symptomScore / 100) * 15;

        const riskColors = {
          critical: 'rgba(239, 68, 68, 0.8)',
          high: 'rgba(245, 158, 11, 0.8)',
          medium: 'rgba(59, 130, 246, 0.8)',
          low: 'rgba(34, 197, 94, 0.8)',
        };

        const pulseSize = size + Math.sin(systemPulse / 10 + city.lat) * 4;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 2);
        gradient.addColorStop(0, riskColors[city.risk]);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = riskColors[city.risk];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (city.risk === 'critical' || city.risk === 'high') {
          ctx.strokeStyle = riskColors[city.risk];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, size + 8 + Math.sin(systemPulse / 5) * 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    drawMap();
  }, [cities, systemPulse]);

  const calculateRisk = (city: CityOutbreak): string => {
    const score = (city.symptomScore * 0.4) + (city.salesSpike / 200 * 30) + (city.searchSpike / 100 * 30);
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  };

  const getRiskScore = (risk: CityOutbreak['risk']): number => {
    switch (risk) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      case 'low': return 25;
    }
  };

  const getRiskColor = (risk: CityOutbreak['risk']) => {
    switch (risk) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-amber-400 bg-amber-500/20';
      case 'medium': return 'text-blue-400 bg-blue-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <FiTarget className="text-2xl text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Pandemic Outbreak Radar
              </h1>
              <p className="text-slate-400 text-sm">AI-Powered Disease Prediction for India</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl border border-red-500/50 bg-red-500/20">
              <FiRadio className="inline text-red-400 animate-pulse mr-2" />
              <span className="text-red-400 font-bold">LIVE MONITORING</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/50">
              <span className="text-orange-400 font-bold">Risk Index: {totalRisk}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="text-red-400" />
            <span className="text-slate-400 text-sm">Critical Zones</span>
          </div>
          <div className="text-3xl font-bold text-red-400">{cities.filter(c => c.risk === 'critical').length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiActivity className="text-amber-400" />
            <span className="text-slate-400 text-sm">High Risk</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">{cities.filter(c => c.risk === 'high').length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiShield className="text-green-400" />
            <span className="text-slate-400 text-sm">Cities Tracked</span>
          </div>
          <div className="text-3xl font-bold text-green-400">{cities.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiClock className="text-blue-400" />
            <span className="text-slate-400 text-sm">Predicted Outbreaks</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{alerts.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiMapPin className="text-red-400" />
                Live India Outbreak Heatmap
              </h2>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Low</span>
              </div>
            </div>
            <canvas 
              ref={canvasRef}
              width={800}
              height={450}
              className="w-full cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const centerX = rect.width / 2;
                const scaleX = rect.width / 40;
                
                const clickedCity = cities.find(city => {
                  const cityX = centerX + (city.lng - 78) * scaleX;
                  return Math.abs(cityX - x) < 30;
                });
                
                setSelectedCity(clickedCity?.city || null);
              }}
            />
            {selectedCity && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-red-500/10 border-t border-red-500/30"
              >
                {cities.filter(c => c.city === selectedCity).map(city => (
                  <div key={city.city}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                        <FiAlertTriangle />
                        {city.city} - {city.risk.toUpperCase()} RISK
                      </h3>
                      <span className="text-red-400 font-bold">Prediction: {city.predictedDay} days</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-sm text-slate-400 mb-1">Symptom Searches</div>
                        <div className="text-2xl font-bold text-red-400">{city.symptomScore.toFixed(0)}%</div>
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <FiTrendingUp /> +{Math.round(city.searchSpike)}%
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-sm text-slate-400 mb-1">Medicine Sales</div>
                        <div className="text-2xl font-bold text-amber-400">{city.salesSpike.toFixed(0)}%</div>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <FiTrendingUp /> Spike detected
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <div className="text-sm text-slate-400 mb-1">Disease Probability</div>
                        <div className="text-2xl font-bold text-blue-400">{Math.round((city.symptomScore * 0.4 + city.salesSpike / 200 * 30 + city.searchSpike / 100 * 30))}%</div>
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                          <FiTarget /> AI Confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiAlertTriangle className="text-red-400 animate-pulse" />
                Active Predictions
              </h2>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts.map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 border-b border-white/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{alert.city}</span>
                    <span className="text-xs text-slate-500">{alert.timestamp}</span>
                  </div>
                  <div className="text-sm">{alert.disease}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${alert.probability}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-red-400">{alert.probability}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FiShield className="text-red-400" />
              Government Alert Status
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                <span>Health Ministry</span>
                <span className="text-green-400 flex items-center gap-1"><FiCheckCircle /> Synced</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                <span>State Governments</span>
                <span className="text-green-400 flex items-center gap-1"><FiCheckCircle /> 14 States</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                <span>WHO India</span>
                <span className="text-amber-400 flex items-center gap-1"><FiClock /> Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}