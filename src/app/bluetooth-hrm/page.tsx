'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBluetooth, FiHeart, FiActivity, FiClock, FiMonitor, FiAlertTriangle, FiBarChart2, FiX } from 'react-icons/fi';

const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
const HR_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';
const BODY_SENSOR_LOCATION = '00002a38-0000-1000-8000-00805f9b34fb';

const SENSOR_LOCATIONS = [
  'Other', 'Chest', 'Wrist', 'Finger', 'Hand', 'Ear Lobe', 'Foot',
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export default function BluetoothHRMPage() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [location_, setLocation_] = useState<string>('Unknown');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [rrInterval, setRrInterval] = useState<number | null>(null);
  const [history, setHistory] = useState<{ hr: number; ts: number }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [supported, setSupported] = useState(true);
  const [energyExpended, setEnergyExpended] = useState<number | null>(null);
  const deviceRef = useRef<BluetoothDevice | null>(null);
  const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
  const hrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(!!(navigator as any).bluetooth);
  }, []);

  const disconnect = useCallback(() => {
    if (hrIntervalRef.current) clearInterval(hrIntervalRef.current);
    if (deviceRef.current?.gatt?.connected) {
      try { deviceRef.current.gatt.disconnect(); } catch {}
    }
    deviceRef.current = null;
    serverRef.current = null;
    setConnected(false);
    setHeartRate(null);
    setBatteryLevel(null);
    setRrInterval(null);
    setHistory([]);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const connect = useCallback(async () => {
    if (!(navigator as any).bluetooth) {
      setErrorMsg('Web Bluetooth not supported in this browser');
      return;
    }
    setConnecting(true);
    setErrorMsg('');
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information'],
      });

      setDeviceName(device.name || 'HR Monitor');
      deviceRef.current = device;

      device.addEventListener('gattserverdisconnected', () => {
        setConnected(false);
        setHeartRate(null);
        setErrorMsg('Device disconnected');
      });

      const server = await device.gatt.connect();
      serverRef.current = server;

      // Heart Rate Service
      const hrService = await server.getPrimaryService(HR_SERVICE);

      // Heart Rate Measurement
      const hrChar = await hrService.getCharacteristic(HR_MEASUREMENT);
      await hrChar.startNotifications();
      hrChar.addEventListener('characteristicvaluechanged', (e: any) => {
        const value = e.target.value;
        const flags = value.getUint8(0);
        const hr16Bit = !!(flags & 0x01);
        const hr = hr16Bit ? value.getUint16(1, true) : value.getUint8(1);
        setHeartRate(hr);
        setHistory(prev => [...prev.slice(-59), { hr, ts: Date.now() }]);

        // RR Interval
        let offset = hr16Bit ? 3 : 2;
        if (flags & 0x10) {
          const rr = value.getUint16(offset, true);
          setRrInterval(rr / 1024);
          offset += 2;
        }
        if (flags & 0x08) {
          const energy = value.getUint16(offset, true);
          setEnergyExpended(energy);
        }
      });

      // Body Sensor Location
      try {
        const locChar = await hrService.getCharacteristic(BODY_SENSOR_LOCATION);
        const locValue = await locChar.readValue();
        setLocation_(SENSOR_LOCATIONS[locValue.getUint8(0)] || 'Unknown');
      } catch {}

      // Battery Level
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryChar = await batteryService.getCharacteristic('battery_level');
        const batValue = await batteryChar.readValue();
        setBatteryLevel(batValue.getUint8(0));
        await batteryChar.startNotifications();
        batteryChar.addEventListener('characteristicvaluechanged', (e: any) => {
          setBatteryLevel(e.target.value.getUint8(0));
        });
      } catch {}

      setConnected(true);
      setConnecting(false);
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        setErrorMsg(err.message || 'Connection failed');
      }
      setConnecting(false);
    }
  }, []);

  const avgHR = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.hr, 0) / history.length)
    : 0;
  const minHR = history.length > 0 ? Math.min(...history.map(h => h.hr)) : 0;
  const maxHR = history.length > 0 ? Math.max(...history.map(h => h.hr)) : 0;

  const hrStatus = heartRate
    ? heartRate < 60 ? 'Low' : heartRate > 100 ? 'Elevated' : 'Normal'
    : '--';

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 rounded-3xl mb-6 shadow-[0_0_40px_rgba(20,184,166,0.15)]">
            <FiHeart size={32} className="text-teal-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Bluetooth <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">HR Monitor</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect to any Bluetooth Low Energy (BLE) heart rate monitor — Polar, Wahoo, smartwatch, or fitness band. Real-time vitals in your browser.
          </p>
          {!supported && (
            <div className="inline-flex items-center gap-2 mt-4 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-300 text-xs font-semibold">
              <FiAlertTriangle size={14} /> Web Bluetooth requires Chrome/Edge on desktop or Android
            </div>
          )}
        </motion.div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Connection */}
          {!connected ? (
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
                <FiBluetooth size={36} className="text-teal-400" />
              </div>
              <h3 className="text-white font-black text-lg mb-2">Connect a Heart Rate Monitor</h3>
              <p className="text-gray-400 text-sm mb-6">Pair with any BLE heart rate sensor (Polar H10, Wahoo TICKR, smartwatch, etc.)</p>
              <button onClick={connect} disabled={connecting || !supported}
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-bold text-sm disabled:opacity-40 transition hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] active:scale-[0.98]"
              >
                {connecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Scanning for devices...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiBluetooth size={18} /> Pair Heart Rate Monitor
                  </span>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Live HR Display */}
              <div className="bg-slate-900/60 border border-teal-500/30 rounded-3xl p-6 text-center">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-emerald-400 font-bold text-xs tracking-wider">LIVE</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiBluetooth size={12} /> {deviceName}
                  </div>
                </div>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <motion.circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={heartRate && heartRate > 100 ? '#ef4444' : '#14b8a6'}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={false}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - ((heartRate || 0) - 30) / 150) }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      key={heartRate}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-5xl font-black text-white"
                    >
                      {heartRate || '--'}
                    </motion.span>
                    <span className="text-xs text-gray-500 mt-1">BPM</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  hrStatus === 'Normal' ? 'bg-emerald-500/20 text-emerald-300' :
                  hrStatus === 'Elevated' ? 'bg-red-500/20 text-red-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  <FiHeart size={12} /> {hrStatus}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Avg BPM</p>
                  <p className="text-2xl font-black text-white">{avgHR}</p>
                </div>
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">RR Interval</p>
                  <p className="text-2xl font-black text-white">{rrInterval ? rrInterval.toFixed(1) : '--'}</p>
                  <p className="text-[10px] text-gray-600">sec</p>
                </div>
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Min / Max</p>
                  <p className="text-2xl font-black text-white font-mono">{minHR} <span className="text-gray-600">/</span> {maxHR}</p>
                </div>
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Battery</p>
                  <p className="text-2xl font-black text-white">{batteryLevel !== null ? `${batteryLevel}%` : '--'}</p>
                </div>
              </div>

              {/* Mini HR Chart */}
              {history.length > 1 && (
                <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Heart Rate Trend</p>
                    <p className="text-gray-600 text-[10px]">{history.length} samples</p>
                  </div>
                  <div className="h-20 flex items-end gap-[2px]">
                    {history.map((h, i) => {
                      const max = Math.max(...history.map(x => x.hr), 120);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(h.hr / max) * 100}%` }}
                            className={`w-full rounded-sm ${
                              h.hr > 100 ? 'bg-red-500/50' : 'bg-teal-500/50'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Disconnect */}
              <button onClick={disconnect}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white font-bold text-sm transition">
                <FiBluetooth size={16} className="inline mr-2" /> Disconnect
              </button>
            </>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
              <FiAlertTriangle className="text-red-400 shrink-0 mt-0.5" size={16} />
              <p className="text-red-300 text-xs">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3"><FiBluetooth className="text-teal-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Web Bluetooth API</h3>
            <p className="text-gray-500 text-xs">Connects to real BLE heart rate monitors via the Web Bluetooth API — no app needed.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3"><FiActivity className="text-emerald-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">BLE Heart Rate Service</h3>
            <p className="text-gray-500 text-xs">Uses standard 0x180D service — compatible with Polar H10, Wahoo TICKR, and all HR monitors.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3"><FiBarChart2 className="text-blue-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Real-Time Trending</h3>
            <p className="text-gray-500 text-xs">60-sample rolling history with min/max/avg stats and live bar chart visualization.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
