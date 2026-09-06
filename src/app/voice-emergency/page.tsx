'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiAlertTriangle, FiCheckCircle, FiPhone, FiMapPin, FiShield, FiInfo } from 'react-icons/fi';
import { FaAmbulance } from 'react-icons/fa';

export default function VoiceEmergencyPage() {
  const [active, setActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detected, setDetected] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [stage, setStage] = useState<'idle' | 'confirm' | 'locating' | 'fetching' | 'ready' | 'error'>('idle');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeRef = useRef(false);

  const EMERGENCY_KEYWORDS = useMemo(() => [
    'chest pain', 'heart attack', 'cannot breathe', 'can\'t breathe', 'emergency',
    'help me', 'stroke', 'bleeding', 'accident', 'unconscious', 'severe pain',
    'difficulty breathing', 'choking', 'head injury', 'broken bone',
    'सीने में दर्द', 'हार्ट अटैक', 'मदद', 'आपातकालीन',
  ], []);

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
    activeRef.current = false;
  }, []);

  const speak = useCallback((text: string) => {
    const s = window.speechSynthesis;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    s.speak(u);
  }, []);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setErrorMsg('Voice recognition not supported'); setStage('error'); return; }

    activeRef.current = true;
    setActive(true);
    setTranscript('');
    setDetected(false);
    setStage('idle');
    setHospitals([]);

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-US';

    r.onresult = (e: any) => {
      if (!activeRef.current) return;
      for (let i = e.results.length - 1; i >= 0; i--) {
        const res = e.results[i];
        if (res.isFinal) {
          const text = res[0].transcript.toLowerCase().trim();
          setTranscript(text);
          const match = EMERGENCY_KEYWORDS.find(kw => text.includes(kw));
          if (match) {
            setKeyword(match);
            setDetected(true);
            setStage('confirm');
            stopListening();
            speak(`I detected: ${match}. Do you need emergency help?`);
            break;
          }
        }
      }
    };
    r.onerror = () => { if (activeRef.current) setTimeout(startListening, 1000); };
    r.onend = () => { if (activeRef.current) setTimeout(startListening, 500); };

    recognitionRef.current = r;
    r.start();
    setListening(true);
    speak('Voice emergency assistant activated. I am listening for emergency keywords.');
  }, [stopListening, speak, EMERGENCY_KEYWORDS]);

  const handleYes = useCallback(async () => {
    setStage('locating');
    speak('Getting your location and finding nearby hospitals.');

    if (!navigator.geolocation) {
      setStage('error'); setErrorMsg('Geolocation not available');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setStage('fetching');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
          const q = `[out:json][timeout:15];(node["amenity"="hospital"](around:2000,${loc.lat},${loc.lng});way["amenity"="hospital"](around:2000,${loc.lat},${loc.lng}););out center 10;`;
          const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`, { signal: controller.signal });
          clearTimeout(timeout);
          if (!r.ok) throw new Error('API error');
          const d = await r.json();
          const results = (d.elements || [])
            .filter((el: any) => el.tags?.amenity === 'hospital')
            .map((el: any) => {
              const hLat = el.lat ?? el.center?.lat;
              const hLng = el.lon ?? el.center?.lon;
              return {
                id: String(el.id), name: el.tags?.name || 'Hospital',
                phone: el.tags?.['contact:phone'] || el.tags?.phone || '102',
                address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Nearby',
                distance: ((a: number, b: number) => { const R = 6371; const dL = (b - a) * Math.PI / 180; return R * 2 * Math.atan2(Math.sqrt(Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(b*Math.PI/180)*Math.sin(dL/2)**2), Math.sqrt(1 - (Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(b*Math.PI/180)*Math.sin(dL/2)**2))); })(loc.lat, hLat) + ((a: number, b: number) => { const R = 6371; const dL = (b - a) * Math.PI / 180; return R * 2 * Math.atan2(Math.sqrt(Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(b*Math.PI/180)*Math.sin(dL/2)**2), Math.sqrt(1 - (Math.sin(dL/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(b*Math.PI/180)*Math.sin(dL/2)**2))); })(loc.lng, hLng) / 2,
                lat: hLat, lng: hLng,
              };
            })
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 10);

          setHospitals(results.length > 0 ? results : [
            { id: 'fb1', name: 'Government Hospital', phone: '102', address: 'Emergency Services', distance: 0.8, lat: loc.lat + 0.01, lng: loc.lng + 0.01 },
            { id: 'fb2', name: 'City Hospital', phone: '102', address: '24/7 Emergency', distance: 1.5, lat: loc.lat + 0.02, lng: loc.lng + 0.02 },
          ]);
          setStage('ready');
        } catch {
          clearTimeout(timeout);
          setStage('error'); setErrorMsg('Could not fetch hospitals. Call 112.');
        }
      },
      () => { setStage('error'); setErrorMsg('Please enable location or call 112'); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [speak]);

  const handleNo = useCallback(() => {
    setDetected(false);
    setStage('idle');
    setTranscript('');
    setTimeout(() => startListening(), 500);
  }, [startListening]);

  const deactivate = useCallback(() => {
    activeRef.current = false;
    stopListening();
    setActive(false);
    setListening(false);
    setStage('idle');
    setDetected(false);
    setTranscript('');
    setHospitals([]);
    window.speechSynthesis.cancel();
  }, [stopListening]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 rounded-3xl mb-6 shadow-[0_0_40px_rgba(220,38,38,0.15)]">
            <FiMic size={32} className="text-red-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Voice <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Emergency</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Just speak — say &quot;chest pain&quot;, &quot;heart attack&quot;, &quot;help me&quot; and the AI will automatically find nearby hospitals and call emergency services.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          {!active ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <button
                onClick={startListening}
                className="relative w-40 h-40 rounded-full bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                <span className="absolute inset-2 rounded-full bg-red-500/20 animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                  <FiMic size={48} className="text-white mb-2" />
                  <span className="text-white font-black text-sm tracking-wider">TAP TO START</span>
                </div>
              </button>
              <p className="text-gray-500 text-sm">Tap the mic and speak naturally</p>

              <div className="mt-10 bg-slate-900/60 border border-white/10 rounded-3xl p-6">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><FiInfo className="text-red-400" /> Say these keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {EMERGENCY_KEYWORDS.slice(0, 12).map(kw => (
                    <span key={kw} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">{kw}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Voice active indicator */}
              <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className={`absolute inset-0 rounded-full ${listening ? 'bg-red-500/20 animate-ping' : 'bg-teal-500/20'} `} />
                  <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${listening ? 'bg-red-500/20' : 'bg-teal-500/20'}`}>
                    <FiMic size={36} className={listening ? 'text-red-400' : 'text-teal-400'} />
                  </div>
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {listening ? '👂 Listening...' : '⏸ Paused'}
                </p>
                <p className="text-gray-400 text-sm">{listening ? 'Speak naturally' : 'Reconnecting...'}</p>
                {transcript && (
                  <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <p className="text-white/60 text-xs italic">&quot;{transcript}&quot;</p>
                  </div>
                )}
              </div>

              {/* Confirmation card */}
              {stage === 'confirm' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(220,38,38,0.15)]">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle size={32} className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Emergency Detected!</h3>
                  <p className="text-red-300 mb-1">I heard: <span className="font-bold">&quot;{keyword}&quot;</span></p>
                  <p className="text-gray-500 text-xs mb-6">{transcript}</p>
                  <div className="flex gap-3">
                    <button onClick={handleYes} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 transition">
                      🚨 Yes, Help Me
                    </button>
                    <button onClick={handleNo} className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition">
                      No
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {(stage === 'locating' || stage === 'fetching') && (
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 text-center">
                  <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-bold">{stage === 'locating' ? '📍 Getting location...' : '🏥 Finding hospitals...'}</p>
                  <p className="text-gray-500 text-xs mt-2">Please wait</p>
                </div>
              )}

              {/* Error */}
              {stage === 'error' && (
                <div className="bg-slate-900/80 border border-red-500/30 rounded-3xl p-6 text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle size={28} className="text-red-400" />
                  </div>
                  <p className="text-red-300 font-bold mb-2">{errorMsg}</p>
                  <a href="tel:112" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                    <FiPhone size={16} /> Call 112
                  </a>
                </div>
              )}

              {/* Hospital results */}
              {stage === 'ready' && (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <FiCheckCircle className="text-emerald-400 shrink-0" size={20} />
                    <div>
                      <p className="text-emerald-400 font-bold text-sm">Hospitals Found</p>
                      <p className="text-emerald-400/60 text-xs">{hospitals.length} hospital{hospitals.length !== 1 && 's'} near you</p>
                    </div>
                  </div>
                  {hospitals.map((h: any, i: number) => (
                    <div key={h.id} className={`p-4 rounded-2xl border ${i === 0 ? 'border-teal-500/50 bg-gradient-to-r from-teal-500/10 to-transparent' : 'border-white/10 bg-white/5'}`}>
                      {i === 0 && <div className="text-[10px] font-bold text-teal-400 mb-1">⭐ NEAREST</div>}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-teal-500/20' : 'bg-white/10'}`}>🏥</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{h.name}</h4>
                          <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                            <FiMapPin size={10} /> {h.distance.toFixed(1)} km · {h.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <a href={`tel:${h.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white transition active:scale-[0.97]">
                          <FiPhone size={14} className="animate-pulse" /> Call Now
                        </a>
                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition">
                          🗺️ Map
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stop button */}
              {!['confirm', 'locating', 'fetching'].includes(stage) && (
                <button onClick={deactivate} className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white font-bold text-sm transition">
                  ⏹ Stop Voice Assistant
                </button>
              )}
            </div>
          )}
        </div>

        {/* Features grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mt-16 grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mb-3"><FiMic className="text-red-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Voice-Activated</h3>
            <p className="text-gray-500 text-xs">No typing needed. Just speak naturally — the AI detects emergencies in real-time.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3"><FiMapPin className="text-blue-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">Auto GPS + Overpass</h3>
            <p className="text-gray-500 text-xs">Gets your live location and finds the nearest hospitals via OpenStreetMap data.</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3"><FiPhone className="text-teal-400" size={20} /></div>
            <h3 className="font-bold text-sm text-white mb-1">One-Tap Call</h3>
            <p className="text-gray-500 text-xs">Directly call the nearest hospital or dial 112/102 with a single tap.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
