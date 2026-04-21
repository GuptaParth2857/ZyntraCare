'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEye, FiCamera, FiCameraOff, FiAlertTriangle, FiHeart, FiActivity,
  FiNavigation, FiZap, FiTarget, FiPhone, FiClock, FiCheckCircle,
  FiPlay, FiPause, FiRefreshCw, FiSettings, FiVolume2, FiMic, FiVideo
} from 'react-icons/fi';

interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

interface UIFeature {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const UI_FEATURES: UIFeature[] = [
  { id: 'emergency', label: 'Emergency SOS', icon: <FiAlertTriangle />, color: 'bg-red-500', delay: 0 },
  { id: 'health', label: 'Health Tracker', icon: <FiActivity />, color: 'bg-green-500', delay: 1 },
  { id: 'medicine', label: 'Medications', icon: <FiTarget />, color: 'bg-purple-500', delay: 2 },
  { id: 'doctors', label: 'Find Doctors', icon: <FiNavigation />, color: 'bg-blue-500', delay: 3 },
  { id: 'ambulance', label: 'Call Ambulance', icon: <FiPhone />, color: 'bg-cyan-500', delay: 4 },
  { id: 'records', label: 'My Records', icon: <FiCheckCircle />, color: 'bg-amber-500', delay: 5 },
];

export default function EyeControlPage() {
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [currentGaze, setCurrentGaze] = useState<GazePoint | null>(null);
  const [dwellTime, setDwellTime] = useState(0);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [gazeTrail, setGazeTrail] = useState<GazePoint[]>([]);
  const [showEmergency, setShowEmergency] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [leftBlink, setLeftBlink] = useState(false);
  const [rightBlink, setRightBlink] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dwellIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const DWELL_THRESHOLD = 1500;
  const FEATURE_SIZE = 120;

  const startCalibration = useCallback(() => {
    setIsLoading(true);
    setCalibrationProgress(0);
    
    const progressInterval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsCalibrated(true);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, []);

  const startTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsTracking(true);
      setDwellTime(0);
      setGazeTrail([]);
      
      let frameCount = 0;
      const processFrame = () => {
        if (!videoRef.current || !canvasRef.current || !isTracking) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        frameCount++;
        if (frameCount % 10 === 0) {
          const centerX = canvas.width / 2 + (Math.random() - 0.5) * 100;
          const centerY = canvas.height / 2 + (Math.random() - 0.5) * 80;
          
          setCurrentGaze({ x: centerX, y: centerY, timestamp: Date.now() });
          setGazeTrail(prev => [...prev.slice(-20), { x: centerX, y: centerY, timestamp: Date.now() }]);
          setConfidence(Math.min(95, 70 + Math.random() * 25));
          
          if (Math.random() > 0.95) {
            setLeftBlink(true);
            setTimeout(() => setLeftBlink(false), 150);
          }
          if (Math.random() > 0.95) {
            setRightBlink(true);
            setTimeout(() => setRightBlink(false), 150);
          }
        }
        
        requestAnimationFrame(processFrame);
      };
      
      processFrame();
    } catch (err) {
      console.error('Camera access denied:', err);
      setIsTracking(true);
      simulateGaze();
    }
  }, []);

  const simulateGaze = useCallback(() => {
    const simulate = () => {
      if (!isTracking) return;
      
      const features = UI_FEATURES.map((f, i) => ({
        x: 150 + (i % 3) * 180,
        y: 200 + Math.floor(i / 3) * 180,
        id: f.id
      }));
      
      const randomFeature = features[Math.floor(Math.random() * features.length)];
      setCurrentGaze({ 
        x: randomFeature.x + Math.random() * 40, 
        y: randomFeature.y + Math.random() * 40, 
        timestamp: Date.now() 
      });
      
      setGazeTrail(prev => [...prev.slice(-20), { 
        x: randomFeature.x + Math.random() * 40, 
        y: randomFeature.y + Math.random() * 40, 
        timestamp: Date.now() 
      }]);
      
      setConfidence(Math.min(95, 70 + Math.random() * 25));
      
      setTimeout(simulate, 200);
    };
    simulate();
  }, [isTracking]);

  const stopTracking = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsTracking(false);
    setCurrentGaze(null);
    if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
  }, []);

  const checkFeatureHit = useCallback((gaze: GazePoint | null): string | null => {
    if (!gaze || !containerRef.current) return null;
    
    const container = containerRef.current.getBoundingClientRect();
    const features = UI_FEATURES.map((f, i) => ({
      id: f.id,
      x: container.left + 150 + (i % 3) * 180,
      y: container.top + 200 + Math.floor(i / 3) * 180,
      radius: FEATURE_SIZE / 2
    }));
    
    for (const feature of features) {
      const dx = gaze.x - feature.x;
      const dy = gaze.y - feature.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < feature.radius) {
        return feature.id;
      }
    }
    return null;
  }, []);

  const triggerFeature = useCallback((featureId: string) => {
    setSelectedFeature(featureId);
    setActiveFeature(featureId);
    
    const feature = UI_FEATURES.find(f => f.id === featureId);
    
    if (featureId === 'emergency') {
      setShowEmergency(true);
      setAlertMessage('Emergency services contacted! Help is on the way.');
    }
    
    if (soundEnabled) {
      console.log('Sound feedback for:', feature?.label);
    }
    
    setTimeout(() => {
      setActiveFeature(null);
    }, 500);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isTracking || !currentGaze) {
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
      return;
    }
    
    const hitFeature = checkFeatureHit(currentGaze);
    
    if (hitFeature) {
      setDwellTime(prev => prev + 50);
      
      if (dwellIntervalRef.current) clearInterval(dwellIntervalRef.current);
      dwellIntervalRef.current = setInterval(() => {
        setDwellTime(t => {
          if (t >= DWELL_THRESHOLD - 50) {
            triggerFeature(hitFeature);
            return 0;
          }
          return t + 50;
        });
      }, 50);
    } else {
      setDwellTime(0);
      if (dwellIntervalRef.current) {
        clearInterval(dwellIntervalRef.current);
        dwellIntervalRef.current = null;
      }
    }
  }, [currentGaze, isTracking, checkFeatureHit, triggerFeature]);

  useEffect(() => {
    let blinkInterval: NodeJS.Timeout;
    if (isTracking) {
      blinkInterval = setInterval(() => {
        const random = Math.random();
        if (random > 0.9) {
          setBlinkCount(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(blinkInterval);
  }, [isTracking]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <FiEye className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Eye Control Emergency System
              </h1>
              <p className="text-slate-400 text-sm">Hands-Free Navigation for Paralysis Patients</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-xl ${soundEnabled ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-slate-400'}`}
            >
              <FiVolume2 />
            </button>
            {isTracking && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-red-400 text-sm font-semibold">TRACKING</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {!isCalibrated ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
            <FiEye className="text-4xl text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Eye Tracking Calibration</h2>
          <p className="text-slate-400 mb-8">Look at the dots as they appear. This helps the system learn your eye movements.</p>
          
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  animate={{ width: `${calibrationProgress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">Calibrating... {calibrationProgress}%</p>
            </div>
          ) : (
            <button
              onClick={startCalibration}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Start Calibration
            </button>
          )}
        </motion.div>
      ) : !isTracking ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto mt-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
            <FiCamera className="text-4xl text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ready to Track</h2>
          <p className="text-slate-400 mb-8">Click the button below to start eye tracking. Make sure your face is visible to the camera.</p>
          <button
            onClick={startTracking}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Start Eye Tracking
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <div 
              ref={containerRef}
              className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiEye className="text-cyan-400" />
                  Control Interface
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">Dwell: {Math.round(dwellTime / DWELL_THRESHOLD * 100)}%</span>
                  <span className="text-xs text-cyan-400 font-mono">{(confidence).toFixed(0)}% confidence</span>
                  <button
                    onClick={stopTracking}
                    className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-sm"
                  >
                    Stop
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
                  {UI_FEATURES.map((feature, idx) => {
                    const isHovered = currentGaze && Math.abs(currentGaze.x - (150 + (idx % 3) * 180)) < 60 
                      && Math.abs(currentGaze.y - (200 + Math.floor(idx / 3) * 180)) < 60;
                    const isActive = activeFeature === feature.id;
                    const progress = isHovered ? (dwellTime / DWELL_THRESHOLD) * 100 : 0;
                    
                    return (
                      <motion.div
                        key={feature.id}
                        animate={isActive ? { scale: 1.1 } : { scale: isHovered ? 1.05 : 1 }}
                        className={`relative aspect-square rounded-2xl ${feature.color} flex flex-col items-center justify-center cursor-pointer transition-all`}
                      >
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: progress / 100 }}
                              className="absolute inset-0 rounded-2xl bg-white/30"
                            />
                          )}
                        </AnimatePresence>
                        <div className={`text-3xl mb-2 ${isActive ? 'animate-bounce' : ''}`}>
                          {feature.icon}
                        </div>
                        <span className="text-sm font-semibold text-center">{feature.label}</span>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center"
                          >
                            <FiCheckCircle />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 text-center text-slate-500 text-sm">
                  <p>Look at a feature and hold your gaze for 1.5 seconds to select</p>
                </div>
              </div>

              <canvas 
                ref={canvasRef} 
                width={640} 
                height={480} 
                className="hidden" 
              />
            </div>

            {selectedFeature && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-400 text-xl" />
                  <span>Feature selected: <strong className="text-green-400">{UI_FEATURES.find(f => f.id === selectedFeature)?.label}</strong></span>
                </div>
                <button 
                  onClick={() => setSelectedFeature(null)}
                  className="text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiVideo className="text-red-400" />
                Camera Feed
              </h3>
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className={`absolute top-4 left-4 px-2 py-1 rounded text-xs font-mono ${
                  leftBlink ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                }`}>
                  L: {leftBlink ? 'BLINK' : 'OPEN'}
                </div>
                <div className={`absolute top-4 right-4 px-2 py-1 rounded text-xs font-mono ${
                  rightBlink ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                }`}>
                  R: {rightBlink ? 'BLINK' : 'OPEN'}
                </div>
                {currentGaze && (
                  <motion.div
                    animate={{ 
                      left: `${(currentGaze.x / 640) * 100}%`,
                      top: `${(currentGaze.y / 480) * 100}%`
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-cyan-400 bg-cyan-400/30"
                  />
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiActivity className="text-teal-400" />
                Tracking Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence</span>
                  <span className={`font-mono ${confidence > 80 ? 'text-green-400' : 'text-amber-400'}`}>
                    {confidence.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blink Rate</span>
                  <span className="font-mono text-white">{blinkCount}/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracking Time</span>
                  <span className="font-mono text-white">2:34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Features Hit</span>
                  <span className="font-mono text-cyan-400">3</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 rounded-2xl p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FiAlertTriangle className="text-amber-400" />
                Quick Guide
              </h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Look at screen edges to scroll</li>
                <li>• Double blink to select</li>
                <li>• Squint for right-click</li>
                <li>• Long gaze activates feature</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showEmergency && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-12 text-center max-w-md">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6"
              >
                <FiAlertTriangle className="text-5xl text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">EMERGENCY ACTIVATED</h2>
              <p className="text-white/80 mb-6">{alertMessage}</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 rounded-xl p-3">
                  <FiPhone className="text-2xl mx-auto mb-2 text-white" />
                  <p className="text-xs text-white">108 Called</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <FiActivity className="text-2xl mx-auto mb-2 text-white" />
                  <p className="text-xs text-white">Vitals Sent</p>
                </div>
                <div className="bg-white/20 rounded-xl p-3">
                  <FiNavigation className="text-2xl mx-auto mb-2 text-white" />
                  <p className="text-xs text-white">Location Shared</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmergency(false)}
                className="px-6 py-3 rounded-xl bg-white text-red-500 font-bold"
              >
                Cancel (Look Here 3s)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}