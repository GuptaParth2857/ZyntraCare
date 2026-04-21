'use client';

import { useState, useEffect, useMemo } from 'react';
import { FiActivity, FiTrendingUp, FiTrendingDown, FiClock, FiAlertCircle, FiMapPin, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface BedStats {
  hospitalId: string;
  name: string;
  date: string;
  totalBeds: number;
  availableBeds: number;
  occupancyPercent: number;
  totalICU: number;
  availableICU: number;
  icuOccupancy: number;
  avgStay: number;
  admissions: number;
  discharges: number;
}

const MOCK_STATS: BedStats[] = [
  { hospitalId: 'H001', name: 'Apollo Hospital', date: new Date().toISOString().split('T')[0], totalBeds: 150, availableBeds: 12, occupancyPercent: 92, totalICU: 25, availableICU: 3, icuOccupancy: 88, avgStay: 5.2, admissions: 15, discharges: 8 },
  { hospitalId: 'H002', name: 'Fortis Memorial', date: new Date().toISOString().split('T')[0], totalBeds: 200, availableBeds: 45, occupancyPercent: 77, totalICU: 30, availableICU: 8, icuOccupancy: 73, avgStay: 4.8, admissions: 22, discharges: 18 },
  { hospitalId: 'H003', name: 'Max Super Specialty', date: new Date().toISOString().split('T')[0], totalBeds: 180, availableBeds: 30, occupancyPercent: 83, totalICU: 20, availableICU: 4, icuOccupancy: 80, avgStay: 5.5, admissions: 12, discharges: 10 },
  { hospitalId: 'H004', name: 'BLK Super Hospital', date: new Date().toISOString().split('T')[0], totalBeds: 120, availableBeds: 8, occupancyPercent: 93, totalICU: 15, availableICU: 1, icuOccupancy: 93, avgStay: 6.1, admissions: 8, discharges: 5 },
  { hospitalId: 'H005', name: 'Sir Ganga Ram', date: new Date().toISOString().split('T')[0], totalBeds: 100, availableBeds: 22, occupancyPercent: 78, totalICU: 12, availableICU: 5, icuOccupancy: 58, avgStay: 4.2, admissions: 10, discharges: 12 },
];

export default function BedAnalyticsPage() {
  const [stats, setStats] = useState<BedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    setTimeout(() => {
      setStats(MOCK_STATS);
      setLoading(false);
    }, 500);
  }, [timeRange]);

  const summary = useMemo(() => {
    if (stats.length === 0) return null;
    return {
      totalHospitals: stats.length,
      totalBeds: stats.reduce((sum, s) => sum + s.totalBeds, 0),
      avgAvailable: stats.reduce((sum, s) => sum + s.availableBeds, 0),
      avgOccupancy: Math.round(stats.reduce((sum, s) => sum + s.occupancyPercent, 0) / stats.length),
      totalICU: stats.reduce((sum, s) => sum + s.totalICU, 0),
      avgICUAvailable: stats.reduce((sum, s) => sum + s.availableICU, 0),
      avgICUUccupancy: Math.round(stats.reduce((sum, s) => sum + s.icuOccupancy, 0) / stats.length),
      avgStay: (stats.reduce((sum, s) => sum + s.avgStay, 0) / stats.length).toFixed(1),
      totalAdmissions: stats.reduce((sum, s) => sum + s.admissions, 0),
      totalDischarges: stats.reduce((sum, s) => sum + s.discharges, 0),
      critical: stats.filter(s => s.occupancyPercent >= 90).length,
    };
  }, [stats]);

  const getOccupancyColor = (percent: number) => {
    if (percent >= 90) return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Critical' };
    if (percent >= 70) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'High' };
    return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Normal' };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-4"
          >
            <FiActivity size={32} className="text-blue-400" />
          </motion.div>
          <h1 className="text-4xl font-black mb-2">
            Bed <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Analytics</span>
          </h1>
          <p className="text-gray-400">Real-time occupancy trends and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2 rounded-xl font-semibold capitalize transition ${
                timeRange === range 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                <FiActivity className="text-blue-400 mb-2" size={20} />
                <p className="text-2xl font-black">{summary.avgOccupancy}%</p>
                <p className="text-sm text-gray-400">Avg Occupancy</p>
                <div className={`mt-2 text-xs font-semibold ${summary.avgOccupancy >= 85 ? 'text-red-400' : 'text-green-400'}`}>
                  {summary.avgOccupancy >= 85 ? 'High Demand' : 'Normal'}
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                <FiTrendingUp className="text-purple-400 mb-2" size={20} />
                <p className="text-2xl font-black">{summary.totalBeds}</p>
                <p className="text-sm text-gray-400">Total Capacity</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                <FiTrendingDown className="text-green-400 mb-2" size={20} />
                <p className="text-2xl font-black text-green-400">{summary.avgAvailable}</p>
                <p className="text-sm text-gray-400">Beds Available</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5">
                <FiAlertCircle className={`mb-2 ${summary.critical > 0 ? 'text-red-400' : 'text-gray-400'}`} size={20} />
                <p className="text-2xl font-black text-red-400">{summary.critical}</p>
                <p className="text-sm text-gray-400">At Capacity</p>
              </div>
            </div>

            {/* Flow Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                <p className="text-xs text-blue-400 mb-1">Admissions Today</p>
                <p className="text-xl font-bold">{summary.totalAdmissions}</p>
              </div>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <p className="text-xs text-green-400 mb-1">Discharges Today</p>
                <p className="text-xl font-bold">{summary.totalDischarges}</p>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                <p className="text-xs text-purple-400 mb-1">Avg Stay</p>
                <p className="text-xl font-bold">{summary.avgStay} days</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">ICU Occupancy</p>
                <p className="text-xl font-bold">{summary.avgICUUccupancy}%</p>
              </div>
            </div>

            {/* Hospital Breakdown */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiMapPin className="text-teal-400" />
                Hospital Breakdown
              </h2>
              
              <div className="space-y-4">
                {stats.map(hospital => {
                  const colors = getOccupancyColor(hospital.occupancyPercent);
                  return (
                    <div key={hospital.hospitalId} className="bg-slate-900 rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏥</span>
                          <div>
                            <p className="font-semibold">{hospital.name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1"><FiClock size={12} /> {summary.avgStay} days avg stay</span>
                              <span>{hospital.admissions} admitted</span>
                              <span>{hospital.discharges} discharged</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="text-center">
                            <p className={`text-xl font-bold ${colors.text}`}>{hospital.occupancyPercent}%</p>
                            <p className="text-xs text-gray-500">General</p>
                          </div>
                          <div className="text-center">
                            <p className={`text-xl font-bold ${getOccupancyColor(hospital.icuOccupancy).text}`}>{hospital.icuOccupancy}%</p>
                            <p className="text-xs text-gray-500">ICU</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl font-bold text-gray-300">{hospital.availableBeds}</p>
                            <p className="text-xs text-gray-500">Free</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Occupancy Bar */}
                      <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${hospital.occupancyPercent}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full ${
                            hospital.occupancyPercent >= 90 ? 'bg-red-500' :
                            hospital.occupancyPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}