'use client';

import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FiActivity, FiHeart, FiDroplet, FiThermometer, FiMoon, FiSmartphone, FiWatch, FiRefreshCw, FiBell, FiCheckCircle, FiAlertTriangle, FiBluetooth, FiPlus, FiLoader, FiLogIn, FiZap } from 'react-icons/fi';

interface Vitals {
  heartRate: number | null;
  bloodOxygen: number | null;
  temperature: number | null;
  sleepHours: number | null;
  steps: number | null;
  calories: number | null;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
}

const EMPTY_VITALS: Vitals = { heartRate: null, bloodOxygen: null, temperature: null, sleepHours: null, steps: null, calories: null };

function buildInsights(v: Vitals, now: Date): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (v.heartRate != null) {
    if (v.heartRate < 60) alerts.push({ id: 'hr-low', type: 'warning', message: `Low resting heart rate (${v.heartRate} bpm).`, time });
    else if (v.heartRate > 100) alerts.push({ id: 'hr-high', type: 'warning', message: `Elevated heart rate (${v.heartRate} bpm).`, time });
    else alerts.push({ id: 'hr-ok', type: 'success', message: `Heart rate ${v.heartRate} bpm is within normal range.`, time });
  }
  if (v.bloodOxygen != null) {
    if (v.bloodOxygen < 95) alerts.push({ id: 'spo2', type: 'warning', message: `Blood oxygen ${v.bloodOxygen}% is below 95%.`, time });
    else alerts.push({ id: 'spo2-ok', type: 'success', message: `Blood oxygen ${v.bloodOxygen}% is normal.`, time });
  }
  if (v.temperature != null) {
    if (v.temperature >= 37.5) alerts.push({ id: 'temp', type: 'warning', message: `Temperature ${v.temperature}°C could indicate fever.`, time });
    else alerts.push({ id: 'temp-ok', type: 'info', message: `Temperature ${v.temperature}°C is within normal range.`, time });
  }
  if (v.sleepHours != null) {
    if (v.sleepHours < 7) alerts.push({ id: 'sleep', type: 'info', message: `Sleep ${v.sleepHours}h is below the recommended 7h.`, time });
    else alerts.push({ id: 'sleep-ok', type: 'success', message: `Sleep ${v.sleepHours}h is good.`, time });
  }
  return alerts;
}

function recommendations(alerts: HealthAlert[]): string[] {
  const recs: string[] = [];
  for (const a of alerts) {
    if (a.id === 'hr-low') recs.push('Low heart rate: if you feel dizzy or faint, consult a doctor.');
    if (a.id === 'hr-high') recs.push('Elevated heart rate: rest, hydrate, and recheck. Consult a doctor if it persists.');
    if (a.id === 'spo2') recs.push('Low SpO2: recheck while relaxed. Below 95% consistently needs medical attention.');
    if (a.id === 'temp') recs.push('Possible fever: monitor temperature, hydrate, and rest.');
    if (a.id === 'sleep') recs.push('Try to reach 7-8 hours of sleep consistently.');
  }
  return recs;
}

export default function WearableSyncPage() {
  const { status } = useSession();
  const isLoggedIn = status === 'authenticated';

  const [vitals, setVitals] = useState<Vitals>(EMPTY_VITALS);
  const [lastSync, setLastSync] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Bluetooth live session
  const bleSupported = typeof navigator !== 'undefined' && Boolean((navigator as any).bluetooth);
  const [bleStatus, setBleStatus] = useState<'off' | 'requesting' | 'connected'>('off');
  const [bleError, setBleError] = useState('');
  const [bleDevice, setBleDevice] = useState('');
  const [liveHr, setLiveHr] = useState<number | null>(null);
  const bleDeviceRef = useRef<any>(null);
  const charRef = useRef<any>(null);

  // Manual entry modal
  const [showManual, setShowManual] = useState(false);
  const emptyForm = { heartRate: '', bloodPressure: '', oxygenLevel: '', temperature: '', steps: '', calories: '', sleepHours: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchLatest = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wearables');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      if (data.data?.length) {
        const r = data.data[0];
        setVitals({
          heartRate: r.heartRate ?? null,
          bloodOxygen: r.oxygenLevel ?? null,
          temperature: r.temperature ?? null,
          sleepHours: r.sleepHours ?? null,
          steps: r.steps ?? null,
          calories: r.calories ?? null,
        });
        setLastSync(new Date(r.recordedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
      } else {
        setVitals(EMPTY_VITALS);
        setLastSync('');
      }
    } catch {
      setVitals(EMPTY_VITALS);
    }
    setLoading(false);
  }, [isLoggedIn]);

  useEffect(() => {
    if (status !== 'loading') fetchLatest();
  }, [status, fetchLatest]);

  const onBleValue = useCallback((event: any) => {
    try {
      const value = event.target.value as DataView;
      const flags = value.getUint8(0);
      const is16Bit = (flags & 0x01) !== 0;
      const hr = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
      if (hr > 0 && hr < 220) setLiveHr(hr);
    } catch { /* ignore malformed frame */ }
  }, []);

  const onBleDisconnect = useCallback(() => {
    setBleStatus('off');
    setBleDevice('');
    setLiveHr(null);
  }, []);

  const connectBle = async () => {
    setBleError('');
    setBleStatus('requesting');
    try {
      const nav = navigator as any;
      if (!nav.bluetooth) throw new Error('Web Bluetooth is not supported in this browser');
      const device = await nav.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }], optionalServices: ['heart_rate'] });
      bleDeviceRef.current = device;
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      charRef.current = characteristic;
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', onBleValue);
      device.addEventListener('gattserverdisconnected', onBleDisconnect);
      setBleDevice(device.name || 'Bluetooth Device');
      setBleStatus('connected');
    } catch (err: any) {
      setBleStatus('off');
      setBleError(err?.message || 'Connection cancelled or failed.');
    }
  };

  const disconnectBle = async () => {
    try { await charRef.current?.stopNotifications(); } catch { /* noop */ }
    try { bleDeviceRef.current?.gatt?.disconnect(); } catch { /* noop */ }
    charRef.current = null;
    bleDeviceRef.current = null;
    setBleStatus('off');
    setBleDevice('');
    setLiveHr(null);
  };

  const saveLiveReading = async () => {
    if (!liveHr) return;
    setSaving(true);
    try {
      const res = await fetch('/api/wearables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: bleDevice || 'bluetooth', heartRate: liveHr }),
      });
      if (!res.ok) throw new Error('Failed to save');
      showToast(`Saved live heart rate: ${liveHr} bpm`);
      fetchLatest();
    } catch {
      showToast('Could not save reading. Please try again.');
    }
    setSaving(false);
  };

  const submitManual = async () => {
    const hr = form.heartRate ? Number(form.heartRate) : null;
    const spo2 = form.oxygenLevel ? Number(form.oxygenLevel) : null;
    const temp = form.temperature ? Number(form.temperature) : null;
    const steps = form.steps ? Number(form.steps) : null;
    const calories = form.calories ? Number(form.calories) : null;
    const sleep = form.sleepHours ? Number(form.sleepHours) : null;

    const hasAny = hr != null
      || (typeof form.bloodPressure === 'string' && form.bloodPressure.trim() !== '')
      || spo2 != null || temp != null || steps != null || calories != null || sleep != null;

    if (!hasAny) {
      setFormError('Enter at least one value.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch('/api/wearables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: 'manual',
          heartRate: hr,
          bloodPressure: form.bloodPressure || null,
          oxygenLevel: spo2,
          temperature: temp,
          steps,
          calories,
          sleepHours: sleep,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setShowManual(false);
      setForm(emptyForm);
      showToast('Reading saved to your wearable log.');
      fetchLatest();
    } catch {
      setFormError('Could not save. Please try again.');
    }
    setSaving(false);
  };
  const isEmpty = (!vitals.heartRate && !vitals.bloodOxygen && !vitals.temperature && !vitals.sleepHours && !vitals.steps && !vitals.calories);
  const alerts = buildInsights(vitals, new Date());
  const recs = recommendations(alerts);

  const set = (k: keyof typeof emptyForm) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-blue-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl mb-6">
            <FiWatch size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Wearable <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Sync</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Live health data from Bluetooth devices or manual readings, stored to your health log.
          </p>
        </motion.div>

        {toast && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
            <FiCheckCircle className="text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm font-medium">{toast}</p>
          </div>
        )}

        {!isLoggedIn ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-10 text-center">
            <FiHeart className="mx-auto text-cyan-400 mb-4" size={48} />
            <p className="text-gray-300 mb-2 font-bold">Sign in to sync your wearable data</p>
            <p className="text-gray-500 text-sm mb-6">Your vitals are private and linked only to your account.</p>
            <Link href="/auth/signin?callbackUrl=/wearables" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold">
              <FiLogIn /> Sign In
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Last sync + refresh */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <p className="text-sm text-gray-400">
                Last synced: {lastSync || 'Never — connect a device or add a manual reading'}
              </p>
              <button onClick={fetchLatest} disabled={loading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 text-sm transition">
                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {/* Data Sources */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-3">
                  <FiBluetooth className="text-blue-400 text-xl" />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${bleStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : bleSupported ? 'bg-white/10 text-gray-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {bleStatus === 'connected' ? 'Live' : bleStatus === 'requesting' ? 'Connecting' : bleSupported ? 'Available' : 'Unsupported'}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">Bluetooth (BLE)</h3>
                <p className="text-xs text-gray-400 mb-4">Connect any device exposing the standard heart-rate service.</p>
                {bleStatus === 'connected' ? (
                  <>
                    <div className="text-4xl font-black text-cyan-300 mb-2">{liveHr ?? '—'}<span className="text-sm text-gray-400 font-medium"> bpm</span></div>
                    <p className="text-xs text-gray-500 mb-4 truncate">{bleDevice}</p>
                    <div className="flex gap-2">
                      <button onClick={saveLiveReading} disabled={saving || !liveHr}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold disabled:opacity-50 transition">
                        {saving ? 'Saving...' : 'Save Reading'}
                      </button>
                      <button onClick={disconnectBle} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition">
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {bleError && <p className="text-xs text-amber-300 mb-3">{bleError}</p>}
                    <button onClick={connectBle} disabled={!bleSupported || bleStatus === 'requesting'}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 transition">
                      {bleStatus === 'requesting' ? <><FiLoader className="animate-spin" /> Connecting...</> : <>Connect Device</>}
                    </button>
                    <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                      Works on Android Chrome and desktop Chrome/Edge. Not all smartwatches expose this service, and iPhone Safari does not support Web Bluetooth.
                    </p>
                  </>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-3">
                  <FiPlus className="text-emerald-400 text-xl" />
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-white/10 text-gray-300">Always works</span>
                </div>
                <h3 className="font-bold text-sm mb-1">Manual Entry</h3>
                <p className="text-xs text-gray-400 mb-4">Type in values from any watch or device companion app directly.</p>
                <button onClick={() => setShowManual(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-bold transition">
                  Add a Reading
                </button>
                <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                  Great for Noise, Fire-Bolt and BoAt watches — read values from their companion app and log them here.
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
                <div className="flex items-center justify-between mb-3">
                  <FiSmartphone className="text-purple-400 text-xl" />
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-500/20 text-purple-300">Installable</span>
                </div>
                <h3 className="font-bold text-sm mb-1">ZyntraCare as an App</h3>
                <p className="text-xs text-gray-400 mb-4">Open this site on your phone, install it to the home screen.</p>
                <a href="/" className="block text-center py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold transition">
                  Install Instructions
                </a>
                <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                  Chrome/Edge: menu → "Add to Home screen". Quickly re-opens as a full-screen app.
                </p>
              </motion.div>
            </div>

            {/* Main Vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: <FiHeart className="text-red-400" />, label: 'Heart Rate', value: vitals.heartRate != null ? `${vitals.heartRate}` : '—', unit: 'bpm', note: vitals.heartRate != null ? (vitals.heartRate < 60 ? 'Low' : vitals.heartRate > 100 ? 'Elevated' : 'Normal') : 'No data', tone: vitals.heartRate != null ? (vitals.heartRate > 100 ? 'bg-red-500/15 text-red-300' : vitals.heartRate < 60 ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300') : 'bg-white/10 text-gray-400' },
                { icon: <FiDroplet className="text-cyan-400" />, label: 'Blood Oxygen', value: vitals.bloodOxygen != null ? `${vitals.bloodOxygen}` : '—', unit: '% SpO2', note: vitals.bloodOxygen != null ? (vitals.bloodOxygen >= 95 ? 'Normal' : 'Low') : 'No data', tone: vitals.bloodOxygen != null ? (vitals.bloodOxygen >= 95 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300') : 'bg-white/10 text-gray-400' },
                { icon: <FiThermometer className="text-orange-400" />, label: 'Temperature', value: vitals.temperature != null ? `${vitals.temperature}` : '—', unit: '°C', note: vitals.temperature != null ? (vitals.temperature >= 37.5 ? 'Fever?' : 'Normal') : 'No data', tone: vitals.temperature != null ? (vitals.temperature >= 37.5 ? 'bg-red-500/15 text-red-300' : 'bg-emerald-500/15 text-emerald-300') : 'bg-white/10 text-gray-400' },
                { icon: <FiMoon className="text-purple-400" />, label: 'Sleep', value: vitals.sleepHours != null ? `${vitals.sleepHours}` : '—', unit: 'hrs', note: vitals.sleepHours != null ? (vitals.sleepHours >= 7 ? 'Good' : 'Low') : 'No data', tone: vitals.sleepHours != null ? (vitals.sleepHours >= 7 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300') : 'bg-white/10 text-gray-400' },
              ].map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-slate-900/80 border border-white/10 rounded-[1.5rem] p-5">
                  <div className="flex items-center justify-between mb-2">
                    {c.icon}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.tone}`}>{c.note}</span>
                  </div>
                  <p className="text-4xl font-black">{c.value}<span className="text-sm text-gray-400 font-medium"> {c.unit}</span></p>
                  <p className="text-sm text-gray-400 mt-1">{c.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Activity Stats */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/80 border border-white/10 rounded-[1.5rem] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-semibold">Steps</span>
                  {vitals.steps != null && <span className="text-emerald-400 text-sm">{vitals.steps >= 10000 ? 'Goal met!' : `${(10000 - vitals.steps).toLocaleString('en-IN')} to go`}</span>}
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full transition-all" style={{ width: `${Math.min(100, ((vitals.steps ?? 0) / 10000) * 100)}%` }} />
                </div>
                <p className="text-2xl font-black">{(vitals.steps ?? 0).toLocaleString('en-IN')}<span className="text-sm text-gray-400 font-medium"> steps</span></p>
              </div>
              <div className="bg-slate-900/80 border border-white/10 rounded-[1.5rem] p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm font-semibold">Calories</span>
                  {vitals.calories != null && <FiZap className="text-amber-400" />}
                </div>
                <p className="text-2xl font-black">{(vitals.calories ?? 0).toLocaleString('en-IN')}<span className="text-sm text-gray-400 font-medium"> kcal</span></p>
                <p className="text-xs text-gray-500 mt-1">{vitals.calories != null ? 'Burned today' : 'No data — add a reading'}</p>
              </div>
            </div>

            {/* Health Insights */}
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiBell className="text-cyan-400" /> Health Insights
              </h3>
              {isEmpty || alerts.length === 0 ? (
                <p className="text-sm text-gray-500">No insights yet — sync a device or log a reading.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-xl flex items-start gap-3 ${
                      alert.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                      alert.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
                      'bg-blue-500/10 border border-blue-500/30'
                    }`}>
                      {alert.type === 'success' ? <FiCheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        : alert.type === 'warning' ? <FiAlertTriangle className="text-amber-400 mt-0.5 flex-shrink-0" />
                        : <FiActivity className="text-blue-400 mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 rounded-[2rem] p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FiSmartphone className="text-cyan-400" /> Recommendations
              </h3>
              {recs.length === 0 ? (
                <p className="text-sm text-gray-400">Add data to receive recommendations based on your own readings.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-300">
                  {recs.map(r => <li key={r} className="flex items-start gap-2"><FiActivity className="text-cyan-400 mt-0.5 flex-shrink-0" /><span>{r}</span></li>)}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManual && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => !saving && setShowManual(false)}>
          <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-[2rem] p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FiPlus className="text-emerald-400" /> Manual Reading
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { k: 'heartRate', label: 'Heart Rate (bpm)', ph: 'e.g. 72' },
                { k: 'bloodPressure', label: 'Blood Pressure', ph: 'e.g. 120/80' },
                { k: 'oxygenLevel', label: 'SpO2 (%)', ph: 'e.g. 98' },
                { k: 'temperature', label: 'Temp (°C)', ph: 'e.g. 36.6' },
                { k: 'steps', label: 'Steps', ph: 'e.g. 8200' },
                { k: 'calories', label: 'Calories (kcal)', ph: 'e.g. 450' },
                { k: 'sleepHours', label: 'Sleep (hrs)', ph: 'e.g. 7.5' },
              ].map(f => (
                <div key={f.k} className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">{f.label}</label>
                  <input
                    type="number" step="any" placeholder={f.ph}
                    value={(form as any)[f.k]}
                    onChange={set(f.k as keyof typeof emptyForm)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
            {formError && <p className="text-sm text-rose-400 mt-3">{formError}</p>}
            <button onClick={submitManual} disabled={saving}
              className="w-full mt-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><FiLoader className="animate-spin" /> Saving...</> : 'Save Reading'}
            </button>
            <button onClick={() => !saving && setShowManual(false)} className="w-full mt-2 text-gray-400 hover:text-white text-sm py-1">Cancel</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}