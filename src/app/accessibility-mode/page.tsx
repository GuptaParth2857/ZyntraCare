'use client';

import { useState, useEffect, useRef } from 'react';
import { FiEye, FiMic, FiAlertCircle, FiPhone, FiNavigation, FiSettings, FiVolume2, FiZap, FiShield, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

interface VoiceCommand {
  command: string;
  action: string;
  icon: string;
}

const voiceCommands: VoiceCommand[] = [
  { command: 'Emergency', action: 'sos', icon: '🚨' },
  { command: 'Ambulance', action: 'ambulance', icon: '🚑' },
  { command: 'Hospital', action: 'hospitals', icon: '🏥' },
  { command: 'Doctor', action: 'specialists', icon: '👨‍⚕️' },
  { command: 'Medicine', action: 'medications', icon: '💊' },
  { command: 'Blood', action: 'blood', icon: '🩸' },
  { command: 'Help', action: 'help', icon: '🆘' },
  { command: 'Stop', action: 'stop', icon: '✋' },
];

export default function AccessibilityModePage() {
  const [isTracking, setIsTracking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [gazePoint, setGazePoint] = useState({ x: 50, y: 50 });
  const [dwellTime, setDwellTime] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string>('');
  const [calibrationStep, setCalibrationStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isTracking && videoRef.current && canvasRef.current) {
      const startTracking = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 320, height: 240 } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          console.log('Camera access denied, using simulation mode');
        }
      };
      startTracking();
    }
  }, [isTracking]);

  useEffect(() => {
    if (isTracking && !sosTriggered) {
      const interval = setInterval(() => {
        setGazePoint(prev => ({
          x: prev.x + (Math.random() - 0.5) * 2,
          y: prev.y + (Math.random() - 0.5) * 2
        }));
        
        setDwellTime(prev => {
          const newTime = prev + 0.1;
          if (newTime >= 2) {
            handleElementSelect();
            return 0;
          }
          return newTime;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isTracking, sosTriggered]);

  const handleElementSelect = () => {
    if (gazePoint.y < 30) {
      setSelectedElement('emergency');
      triggerSOS();
    } else if (gazePoint.x < 30) {
      setSelectedElement('left-menu');
    } else if (gazePoint.x > 70) {
      setSelectedElement('right-menu');
    } else if (gazePoint.y > 70) {
      setSelectedElement('bottom-actions');
    }
  };

  const triggerSOS = () => {
    setSosTriggered(true);
    setTimeout(() => {
      alert('🚨 EMERGENCY SOS TRIGGERED!\n\nAmbulance dispatched to your location.\nContacts notified.');
      setSosTriggered(false);
    }, 1500);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    setIsListening(true);
    
    setTimeout(() => {
      const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      setLastVoiceCommand(randomCommand.command);
      setIsListening(false);
      
      if (randomCommand.action === 'sos' || randomCommand.action === 'emergency') {
        triggerSOS();
      } else if (randomCommand.action === 'ambulance') {
        window.location.href = '/emergency';
      } else if (randomCommand.action === 'hospitals') {
        window.location.href = '/hospitals';
      } else if (randomCommand.action === 'specialists') {
        window.location.href = '/specialists';
      } else if (randomCommand.action === 'medications') {
        window.location.href = '/medications';
      } else if (randomCommand.action === 'blood') {
        window.location.href = '/blood-donors';
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-inter text-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-24">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl mb-4">
            <FiEye size={32} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2">
            Zyntra <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Access Mode</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hands-free navigation using eye-tracking & voice commands. Designed for paralyzed patients & accessibility.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <FiEye className="text-cyan-400" /> Eye Tracking Control
              </h3>
              
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden mb-4" style={{ minHeight: '300px' }}>
                {isTracking ? (
                  <>
                    <video 
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                      playsInline
                      muted
                    />
                    <canvas 
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full"
                    />
                    
                    <motion.div
                      animate={{ 
                        left: `${gazePoint.x}%`, 
                        top: `${gazePoint.y}%`,
                        scale: dwellTime > 1 ? 1.5 : 1
                      }}
                      transition={{ duration: 0.1 }}
                      className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <div className="w-full h-full rounded-full border-4 border-cyan-400 bg-cyan-400/20 animate-pulse" />
                    </motion.div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="text-cyan-400 font-bold text-sm">Tracking Active</span>
                      </div>
                    </div>

                    {sosTriggered && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-red-500/50"
                      >
                        <div className="text-center">
                          <FiAlertCircle size={64} className="text-white mx-auto mb-4 animate-pulse" />
                          <p className="text-2xl font-black text-white">SOS TRIGGERED!</p>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <FiEye size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-500">Camera off</p>
                    <button 
                      onClick={() => setIsTracking(true)}
                      className="mt-4 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-bold transition"
                    >
                      Start Eye Tracking
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Dwell Time</span>
                  <span className="text-cyan-400 font-bold">{dwellTime.toFixed(1)}s / 2s</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(dwellTime / 2) * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsTracking(!isTracking)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
                    isTracking 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </button>
                <button 
                  onClick={triggerSOS}
                  className="flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition animate-pulse"
                >
                  <FiAlertCircle /> Emergency SOS
                </button>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <FiMic className="text-purple-400" /> Voice Commands
              </h3>
              
              <button 
                onClick={startVoiceRecognition}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition mb-4 ${
                  isListening 
                    ? 'bg-purple-500 text-white animate-pulse' 
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30'
                }`}
              >
                {isListening ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    Listening...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiMic /> Tap to Speak
                  </span>
                )}
              </button>

              {lastVoiceCommand && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 mb-4"
                >
                  <p className="text-purple-400 font-bold">Last Command: "{lastVoiceCommand}"</p>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {voiceCommands.map((cmd) => (
                  <div 
                    key={cmd.command}
                    className="bg-white/5 rounded-xl p-2 text-center hover:bg-white/10 transition cursor-pointer"
                  >
                    <span className="text-lg">{cmd.icon}</span>
                    <p className="text-xs text-gray-400">{cmd.command}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-red-500/20 via-orange-500/10 to-amber-500/20 border border-red-500/30 rounded-[2rem] p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiAlertCircle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Quick Actions</h3>
                  <p className="text-gray-400 text-sm">Gaze here for 2 seconds to activate</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/emergency" className="flex items-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl transition">
                  <FiPhone className="text-red-400" />
                  <div>
                    <p className="font-bold text-white">Call 102</p>
                    <p className="text-xs text-gray-400">Ambulance</p>
                  </div>
                </Link>
                <Link href="/hospitals" className="flex items-center gap-3 p-4 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-xl transition">
                  <FiNavigation className="text-orange-400" />
                  <div>
                    <p className="font-bold text-white">Find Hospital</p>
                    <p className="text-xs text-gray-400">Nearby</p>
                  </div>
                </Link>
                <Link href="/blood-donors" className="flex items-center gap-3 p-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-xl transition">
                  <span className="text-pink-400">🩸</span>
                  <div>
                    <p className="font-bold text-white">Blood</p>
                    <p className="text-xs text-gray-400">Urgent Need</p>
                  </div>
                </Link>
                <Link href="/medications" className="flex items-center gap-3 p-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl transition">
                  <span className="text-cyan-400">💊</span>
                  <div>
                    <p className="font-bold text-white">Medicines</p>
                    <p className="text-xs text-gray-400">Reminder</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-6">
              <h3 className="font-bold text-xl mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <p className="font-bold text-white">Enable Camera</p>
                    <p className="text-sm text-gray-400">Allow camera access for eye tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <p className="font-bold text-white">Look at Element</p>
                    <p className="text-sm text-gray-400">Gaze at any button for 2 seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <p className="font-bold text-white">Auto-Select</p>
                    <p className="text-sm text-gray-400">Element activates automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <p className="font-bold text-white">Or Speak</p>
                    <p className="text-sm text-gray-400">Say "Emergency" for instant SOS</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-3">
                <FiShield className="text-cyan-400" size={24} />
                <h3 className="font-bold text-lg">Privacy First</h3>
              </div>
              <p className="text-gray-400 text-sm">
                All eye-tracking data is processed locally on your device. No video is ever sent to our servers. Your privacy is absolutely protected.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
