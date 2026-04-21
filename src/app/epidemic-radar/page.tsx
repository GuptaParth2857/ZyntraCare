'use client';

import { useState, useEffect } from 'react';
import { FiActivity, FiAlertTriangle, FiMapPin, FiTrendingUp, FiShield, FiUsers, FiClock, FiCheckCircle, FiX, FiBell } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface OutbreakData {
  area: string;
  city: string;
  cases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  predictedSurge: number;
  daysUntilPeak: number;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  disease: string;
}

const outbreakData: OutbreakData[] = [
  { area: 'Dwarka', city: 'Delhi', cases: 156, severity: 'high', symptoms: ['Fever', 'Joint Pain', 'Rash'], trend: 'increasing', predictedSurge: 45, daysUntilPeak: 5 },
  { area: 'Rohini', city: 'Delhi', cases: 89, severity: 'medium', symptoms: ['Fever', 'Headache'], trend: 'stable', predictedSurge: 12, daysUntilPeak: 0 },
  { area: 'Saket', city: 'Delhi', cases: 234, severity: 'critical', symptoms: ['Fever', 'Bleeding', 'Shock'], trend: 'increasing', predictedSurge: 78, daysUntilPeak: 3 },
  { area: 'Karol Bagh', city: 'Delhi', cases: 67, severity: 'low', symptoms: ['Fever'], trend: 'decreasing', predictedSurge: -15, daysUntilPeak: 0 },
  { area: 'Connaught Place', city: 'Delhi', cases: 45, severity: 'low', symptoms: ['Mild Fever'], trend: 'stable', predictedSurge: 5, daysUntilPeak: 0 },
  { area: 'Lajpat Nagar', city: 'Delhi', cases: 178, severity: 'high', symptoms: ['Fever', 'Muscle Pain', 'Fatigue'], trend: 'increasing', predictedSurge: 56, daysUntilPeak: 4 },
  { area: 'Vasant Kunj', city: 'Delhi', cases: 123, severity: 'medium', symptoms: ['Fever', 'Cough'], trend: 'increasing', predictedSurge: 23, daysUntilPeak: 7 },
  { area: 'Chandni Chowk', city: 'Delhi', cases: 234, severity: 'critical', symptoms: ['High Fever', 'Vomiting'], trend: 'increasing', predictedSurge: 89, daysUntilPeak: 2 },
];

const heatmapPoints: HeatmapPoint[] = [
  { lat: 28.6139, lng: 77.2090, intensity: 0.95, disease: 'Dengue' },
  { lat: 28.6288, lng: 77.2094, intensity: 0.75, disease: 'Viral Fever' },
  { lat: 28.5892, lng: 77.2298, intensity: 0.85, disease: 'Dengue' },
  { lat: 28.6544, lng: 77.2412, intensity: 0.45, disease: 'Seasonal Flu' },
  { lat: 28.5661, lng: 77.2434, intensity: 0.65, disease: 'Food Poisoning' },
  { lat: 28.5921, lng: 77.2187, intensity: 0.55, disease: 'Malaria' },
  { lat: 28.5352, lng: 77.2101, intensity: 0.35, disease: 'Seasonal Flu' },
  { lat: 28.5741, lng: 77.1891, intensity: 0.72, disease: 'Dengue' },
];

const symptomTrends = [
  { symptom: 'Fever', trend: '+45%', status: 'rising' },
  { symptom: 'Joint Pain', trend: '+38%', status: 'rising' },
  { symptom: 'Headache', trend: '+22%', status: 'rising' },
  { symptom: 'Rash', trend: '+15%', status: 'rising' },
  { symptom: 'Cough', trend: '+8%', status: 'stable' },
  { symptom: 'Fatigue', trend: '+32%', status: 'rising' },
];

export default function EpidemicRadarPage() {
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <FiTrendingUp className="text-red-400" />;
      case 'decreasing': return <FiTrendingUp className="text-green-400 rotate-180" />;
      default: return <FiActivity className="text-gray-400" />;
    }
  };

  const totalCases = outbreakData.reduce((acc, curr) => acc + curr.cases, 0);
  const criticalAreas = outbreakData.filter(d => d.severity === 'critical' || d.severity === 'high');

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-inter text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40 rounded-2xl mb-4">
            <FiActivity size={32} className="text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Epidemic Radar</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered predictive heatmap.实时追踪症状集群,提前预测疫情爆发. Solving outbreaks before they happen.
          </p>
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold text-sm">Live Prediction Engine</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-full text-gray-400 text-sm">
              <FiClock size={14} />
              <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              autoRefresh ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-gray-400'
            }`}
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gradient-to-br from-red-500/20 via-orange-500/10 to-yellow-500/20 border border-red-500/30 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl">Alert Level</h3>
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                  {criticalAreas.length} Critical
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-white">{totalCases}</p>
                  <p className="text-xs text-gray-400">Total Cases</p>
                </div>
                <div className="bg-slate-900/70 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-orange-400">+{outbreakData.filter(d => d.trend === 'increasing').length}</p>
                  <p className="text-xs text-gray-400">Rising Areas</p>
                </div>
              </div>

              <h4 className="font-bold mb-3">Severity Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Critical</span>
                  </div>
                  <span className="font-bold">{outbreakData.filter(d => d.severity === 'critical').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm">High</span>
                  </div>
                  <span className="font-bold">{outbreakData.filter(d => d.severity === 'high').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Medium</span>
                  </div>
                  <span className="font-bold">{outbreakData.filter(d => d.severity === 'medium').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Low</span>
                  </div>
                  <span className="font-bold">{outbreakData.filter(d => d.severity === 'low').length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <FiMapPin className="text-red-400" /> Live Outbreak Heatmap
                </h3>
                <div className="flex gap-2">
                  {['all', 'Dengue', 'Viral', 'Malaria'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDisease(d)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        selectedDisease === d 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {d === 'all' ? 'All' : d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                
                {heatmapPoints.filter(p => selectedDisease === 'all' || p.disease.includes(selectedDisease)).map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="absolute"
                    style={{
                      left: `${((point.lng - 77.18) / 0.1) * 100}%`,
                      top: `${((point.lat - 28.52) / 0.12) * 100}%`,
                    }}
                  >
                    <div 
                      className="rounded-full"
                      style={{
                        width: `${point.intensity * 40}px`,
                        height: `${point.intensity * 40}px`,
                        background: `radial-gradient(circle, rgba(239, 68, 68, ${point.intensity}) 0%, rgba(239, 68, 68, 0) 70%)`,
                      }}
                    />
                  </motion.div>
                ))}

                <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>High Risk</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Low</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Avg. Response Time</p>
                  <p className="text-lg font-bold text-white">12 min</p>
                </div>
                <div className="flex-1 bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Hospitals Notified</p>
                  <p className="text-lg font-bold text-white">24</p>
                </div>
                <div className="flex-1 bg-slate-800/50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Prediction Accuracy</p>
                  <p className="text-lg font-bold text-emerald-400">94%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-orange-400" /> Area Alerts
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {outbreakData.sort((a, b) => b.cases - a.cases).map((area) => (
                  <motion.div
                    key={area.area}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveAlert(area.area === activeAlert ? null : area.area)}
                    className={`p-4 rounded-xl cursor-pointer transition ${
                      activeAlert === area.area 
                        ? 'bg-red-500/20 border-2 border-red-500/50' 
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-white">{area.area}</h4>
                        <p className="text-xs text-gray-400">{area.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(area.trend)}
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getSeverityColor(area.severity)}`}>
                          {area.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {area.symptoms.map((sym) => (
                          <span key={sym} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                            {sym}
                          </span>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-white">{area.cases}</span>
                    </div>
                    {activeAlert === area.area && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-400">Predicted Surge</p>
                            <p className={`font-bold ${area.predictedSurge > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {area.predictedSurge > 0 ? '+' : ''}{area.predictedSurge}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Days Until Peak</p>
                            <p className="font-bold text-white">{area.daysUntilPeak} days</p>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-red-500 hover:bg-red-400 text-white py-2 rounded-xl font-bold text-sm transition">
                          Alert Hospital & Reserve Beds
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-cyan-400" /> Symptom Trends
              </h3>
              <div className="space-y-3">
                {symptomTrends.map((sym) => (
                  <div key={sym.symptom} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="font-medium text-white">{sym.symptom}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${sym.status === 'rising' ? 'text-red-400' : 'text-gray-400'}`}>
                        {sym.trend}
                      </span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${sym.status === 'rising' ? 'bg-red-500' : 'bg-gray-500'}`}
                          style={{ width: sym.trend.replace('%', '').replace('+', '') + '%' }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FiShield className="text-cyan-400" size={24} />
                  <h4 className="font-bold">Government Integration</h4>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Alert data is automatically sent to local health authorities when threshold exceeds 50 cases.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white py-2 rounded-xl font-bold text-sm transition">
                    Send Report
                  </button>
                  <Link href="/emergency" className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl font-bold text-sm transition">
                    View Resources
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}