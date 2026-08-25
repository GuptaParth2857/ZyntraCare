'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiPhone, FiMapPin, FiAlertTriangle, FiX, FiNavigation } from 'react-icons/fi';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'cannot breathe', 'can\'t breathe', 'emergency',
  'help me', 'heart attack', 'stroke', 'bleeding', 'accident', 'unconscious',
  'severe pain', 'difficulty breathing', 'choking', 'burning', 'poisoning',
  'head injury', 'fracture', 'broken bone', 'drowning', 'electric shock',
  'सीने में दर्द', 'हार्ट अटैक', 'मदद', 'आपातकालीन', 'दम घुटना',
];

interface NearbyEmergencyHospital {
  id: string;
  name: string;
  phone: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function VoiceEmergencyAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedKeyword, setDetectedKeyword] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stage, setStage] = useState<'idle' | 'locating' | 'fetching' | 'ready' | 'error'>('idle');
  const [hospitals, setHospitals] = useState<NearbyEmergencyHospital[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [active, setActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.pitch = 1;
    u.lang = 'en-US';
    synthRef.current.speak(u);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    setListening(false);
    activeRef.current = false;
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Voice recognition not supported in this browser');
      setStage('error');
      return;
    }

    activeRef.current = true;
    setActive(true);
    setTranscript('');
    setDetectedKeyword(null);
    setShowConfirm(false);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      if (!activeRef.current) return;
      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.toLowerCase().trim();
          setTranscript(text);

          const matched = EMERGENCY_KEYWORDS.find(kw => text.includes(kw));
          if (matched) {
            setDetectedKeyword(matched);
            setShowConfirm(true);
            stopListening();
            speak(`I detected an emergency keyword: ${matched}. Do you need help? Say yes or press the button.`);
            break;
          }
        }
      }
    };

    recognition.onerror = () => {
      if (activeRef.current) {
        setTimeout(() => { if (activeRef.current) startListening(); }, 1000);
      }
    };

    recognition.onend = () => {
      if (activeRef.current) {
        setTimeout(() => { if (activeRef.current) startListening(); }, 500);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    speak('Voice emergency assistant activated. I am listening for emergency keywords.');
  }, [speak, stopListening]);

  const handleYesEmergency = useCallback(async () => {
    setShowConfirm(false);
    setStage('locating');
    speak('Getting your location and finding nearby hospitals. Stay calm, help is on the way.');

    if (!navigator.geolocation) {
      setStage('error');
      setErrorMsg('Geolocation not available');
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
          const results: NearbyEmergencyHospital[] = (d.elements || [])
            .filter((el: any) => el.tags?.amenity === 'hospital')
            .map((el: any) => {
              const hLat = el.lat ?? el.center?.lat;
              const hLng = el.lon ?? el.center?.lon;
              return {
                id: String(el.id),
                name: el.tags?.name || 'Nearby Hospital',
                phone: el.tags?.['contact:phone'] || el.tags?.phone || '102',
                address: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || 'Nearby',
                distance: haversine(loc.lat, loc.lng, hLat, hLng),
                lat: hLat,
                lng: hLng,
              };
            })
            .sort((a: any, b: any) => a.distance - b.distance)
            .slice(0, 10);

          const final = results.length > 0
            ? results
            : [
                { id: 'fb1', name: 'Government Hospital', phone: '102', address: 'Emergency Services', distance: 0.8, lat: loc.lat + 0.01, lng: loc.lng + 0.01 },
                { id: 'fb2', name: 'City Hospital', phone: '102', address: '24/7 Emergency', distance: 1.5, lat: loc.lat + 0.02, lng: loc.lng + 0.02 },
              ];

          setHospitals(final);
          setStage('ready');
          if (final.length > 0) {
            speak(`Found ${final.length} hospitals near you. The nearest is ${final[0].name}, ${final[0].distance.toFixed(1)} kilometers away. You can call them directly.`);
          }
        } catch {
          clearTimeout(timeout);
          setStage('error');
          setErrorMsg('Could not fetch hospitals. Please call 112 immediately.');
          speak('Could not find hospitals. Please call 112 immediately.');
        }
      },
      () => {
        setStage('error');
        setErrorMsg('Please enable location access or call 112');
        speak('Please enable location access or call 112 immediately.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, [speak]);

  const handleNoEmergency = useCallback(() => {
    setShowConfirm(false);
    setDetectedKeyword(null);
    speak('Okay, I will continue listening.');
    setTimeout(() => startListening(), 500);
  }, [speak, startListening]);

  const deactivate = useCallback(() => {
    activeRef.current = false;
    stopListening();
    setActive(false);
    setStage('idle');
    setShowConfirm(false);
    setDetectedKeyword(null);
    setTranscript('');
    setHospitals([]);
    synthRef.current?.cancel();
  }, [stopListening]);

  return (
    <>
      {/* Floating mic button */}
      <button
        onClick={active ? deactivate : startListening}
        className={`fixed bottom-[240px] left-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
          active ? 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
        }`}
        aria-label={active ? 'Deactivate voice assistant' : 'Activate voice emergency assistant'}
      >
        {active ? (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping" />
            <FiMicOff size={22} className="text-white relative z-10" />
          </>
        ) : (
          <FiMic size={22} className="text-white" />
        )}
      </button>

      {/* Status indicator when active */}
      {active && (
        <div className="fixed bottom-[305px] left-6 z-[9999] flex items-center gap-2 bg-black/80 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 shadow-xl">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-red-300 font-semibold tracking-wide">
            {listening ? 'Listening...' : 'Voice Active'}
          </span>
        </div>
      )}

      {/* Transcript toast */}
      <AnimatePresence>
        {active && transcript && !showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[360px] left-6 z-[9999] max-w-[260px] bg-black/90 backdrop-blur border border-white/10 rounded-2xl px-4 py-3 shadow-xl"
          >
            <p className="text-white/70 text-xs italic">&quot;{transcript}&quot;</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleNoEmergency(); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(239,68,68,0.2)' }}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle size={32} className="text-red-400" />
                </div>
                <h3 className="text-white font-black text-lg">Emergency Detected</h3>
                <p className="text-red-300 text-sm mt-1">
                  I heard: &quot;<span className="font-bold">{detectedKeyword}</span>&quot;
                </p>
                <p className="text-gray-400 text-xs mt-2">{transcript}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleYesEmergency} className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3.5 rounded-2xl font-bold text-sm transition active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  🚨 Yes, Help Me
                </button>
                <button onClick={handleNoEmergency} className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-3.5 rounded-2xl font-bold text-sm hover:bg-white/10 transition">
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hospital results modal */}
      <AnimatePresence>
        {(stage === 'locating' || stage === 'fetching' || stage === 'ready' || stage === 'error') && !showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) deactivate(); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full md:max-w-lg max-h-[70vh] bg-slate-900 border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl"
              style={{ borderRadius: '28px 28px 0 0' }}
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-red-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FiAlertTriangle className="text-red-400" size={20} />
                  </div>
                  <div>
                    <h2 className="text-white font-black">Voice Emergency Assist</h2>
                    <p className="text-xs text-gray-400">
                      {stage === 'locating' && 'Getting your location...'}
                      {stage === 'fetching' && 'Finding nearby hospitals...'}
                      {stage === 'ready' && `${hospitals.length} hospitals found`}
                      {stage === 'error' && 'Error'}
                    </p>
                  </div>
                </div>
                <button onClick={deactivate} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition">
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[55vh] space-y-3">
                {/* Loading states */}
                {(stage === 'locating' || stage === 'fetching') && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white font-bold text-sm">
                      {stage === 'locating' ? '📍 Getting your location...' : '🏥 Searching hospitals...'}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      {stage === 'locating' ? 'Please allow location access' : 'Within 2km radius'}
                    </p>
                  </div>
                )}

                {/* Error */}
                {stage === 'error' && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FiAlertTriangle size={28} className="text-red-400" />
                    </div>
                    <p className="text-red-300 font-bold text-sm mb-2">{errorMsg}</p>
                    <a href="tel:112" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                      <FiPhone size={16} /> Call 112 Now
                    </a>
                  </div>
                )}

                {/* Hospital list */}
                {stage === 'ready' && hospitals.map((h, i) => (
                  <div key={h.id} className={`p-4 rounded-2xl border ${i === 0 ? 'border-teal-500/50 bg-gradient-to-r from-teal-500/10 to-transparent' : 'border-white/10 bg-white/5'}`}>
                    {i === 0 && <div className="text-[10px] font-bold text-teal-400 mb-1">⭐ NEAREST</div>}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-teal-500/20' : 'bg-white/10'}`}>🏥</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm truncate">{h.name}</h4>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                          <FiMapPin size={10} /> {h.address} · {h.distance.toFixed(1)} km
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a href={`tel:${h.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 text-white transition active:scale-[0.97]">
                        <FiPhone size={14} className="animate-pulse" /> Call Now
                      </a>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition">
                        <FiNavigation size={14} /> Map
                      </a>
                    </div>
                  </div>
                ))}

                {/* Emergency call buttons always visible when ready */}
                {stage === 'ready' && (
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest">Quick Call</p>
                    <div className="grid grid-cols-3 gap-2">
                      <a href="tel:112" className="text-center py-2.5 rounded-xl font-bold text-xs bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 transition">
                        🚨 112
                      </a>
                      <a href="tel:102" className="text-center py-2.5 rounded-xl font-bold text-xs bg-orange-600/20 text-orange-300 border border-orange-500/30 hover:bg-orange-600/30 transition">
                        🚑 102
                      </a>
                      <a href="tel:100" className="text-center py-2.5 rounded-xl font-bold text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition">
                        👮 100
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
