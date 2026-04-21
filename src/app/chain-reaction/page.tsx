'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiPause, FiRefreshCw, FiZap, FiHeart, FiActivity, FiTrendingUp,
  FiNavigation, FiClock, FiShield, FiDollarSign, FiCheckCircle, FiAlertTriangle,
  FiDatabase, FiCloud, FiSmartphone, FiTarget, FiTrendingDown, FiPackage
} from 'react-icons/fi';

interface DemoStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  duration: number;
  description: string;
}

interface DemoEvent {
  step: string;
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const DEMO_STEPS: DemoStep[] = [
  { 
    id: 'wearable', 
    label: 'Wearables Sync', 
    icon: <FiActivity className="text-2xl" />, 
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'shadow-blue-500',
    duration: 2000,
    description: 'Apple Watch detects abnormal heart rate'
  },
  { 
    id: 'blockchain', 
    label: 'Blockchain Records', 
    icon: <FiDatabase className="text-2xl" />, 
    color: 'from-purple-500 to-pink-500',
    glowColor: 'shadow-purple-500',
    duration: 2500,
    description: 'Medical records unlocked & sent securely'
  },
  { 
    id: 'emergency', 
    label: 'Emergency Triage', 
    icon: <FiNavigation className="text-2xl" />, 
    color: 'from-red-500 to-orange-500',
    glowColor: 'shadow-red-500',
    duration: 3000,
    description: 'Drone dispatched with first-aid'
  },
  { 
    id: 'wallet', 
    label: 'Smart Wallet', 
    icon: <FiDollarSign className="text-2xl" />, 
    color: 'from-green-500 to-emerald-500',
    glowColor: 'shadow-green-500',
    duration: 2500,
    description: 'Insurance auto-claims payment'
  },
];

const DEMO_EVENTS: DemoEvent[] = [
  { step: 'wearable', message: 'Heart rate spike detected: 180 bpm', timestamp: '00:00', icon: <FiActivity />, color: 'text-red-400' },
  { step: 'wearable', message: 'Alert sent to emergency contacts', timestamp: '00:03', icon: <FiSmartphone />, color: 'text-blue-400' },
  { step: 'blockchain', message: 'Patient consent verified on blockchain', timestamp: '00:05', icon: <FiShield />, color: 'text-purple-400' },
  { step: 'blockchain', message: 'Records encrypted & transmitted', timestamp: '00:08', icon: <FiDatabase />, color: 'text-purple-400' },
  { step: 'blockchain', message: 'Fortis Hospital dashboard updated', timestamp: '00:10', icon: <FiCloud />, color: 'text-cyan-400' },
  { step: 'emergency', message: 'Triage AI: Critical - Dispatch drone', timestamp: '00:12', icon: <FiTarget />, color: 'text-red-400' },
  { step: 'emergency', message: 'Drone #447 launched from Mumbai Hub', timestamp: '00:15', icon: <FiNavigation />, color: 'text-orange-400' },
  { step: 'emergency', message: 'ETA to patient: 8 minutes', timestamp: '00:16', icon: <FiClock />, color: 'text-amber-400' },
  { step: 'wallet', message: 'Insurance policy verified', timestamp: '00:18', icon: <FiDollarSign />, color: 'text-green-400' },
  { step: 'wallet', message: 'Smart contract triggered', timestamp: '00:20', icon: <FiPackage />, color: 'text-green-400' },
  { step: 'wallet', message: '₹45,000 auto-approved', timestamp: '00:22', icon: <FiCheckCircle />, color: 'text-green-400' },
  { step: 'wallet', message: 'Treatment complete - Patient stable', timestamp: '00:25', icon: <FiCheckCircle />, color: 'text-emerald-400' },
];

export default function ChainReactionPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState(0);
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [heartRate, setHeartRate] = useState(72);
  const [droneETA, setDroneETA] = useState('--');
  const [claimAmount, setClaimAmount] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const runDemo = useCallback(() => {
    if (!isPlaying) return;

    setProgress(0);
    setTime(0);
    setEvents([]);
    setHeartRate(72);
    setDroneETA('--');
    setClaimAmount(0);
    setShowComplete(false);

    let stepIndex = 0;
    const totalDuration = DEMO_STEPS.reduce((sum, step) => sum + step.duration, 0);
    const startTime = Date.now();

    const stepInterval = setInterval(() => {
      if (stepIndex < DEMO_STEPS.length) {
        setCurrentStep(stepIndex);
        const stepEvents = DEMO_EVENTS.filter(e => e.step === DEMO_STEPS[stepIndex].id);
        
        let eventIndex = 0;
        const eventInterval = setInterval(() => {
          if (eventIndex < stepEvents.length) {
            setEvents(prev => [...prev, stepEvents[eventIndex]]);
            eventIndex++;
          }
        }, stepEvents.length * (DEMO_STEPS[stepIndex].duration / stepEvents.length));

        if (stepIndex === 0) {
          setHeartRate(180);
          setTimeout(() => setHeartRate(165), 2000);
        }
        
        if (stepIndex === 2) {
          setTimeout(() => setDroneETA('8m'), 3000);
          setTimeout(() => setDroneETA('5m'), 6000);
          setTimeout(() => setDroneETA('2m'), 9000);
          setTimeout(() => setDroneETA('Arrived'), 12000);
        }
        
        if (stepIndex === 3) {
          setTimeout(() => setClaimAmount(15000), 1000);
          setTimeout(() => setClaimAmount(30000), 2000);
          setTimeout(() => setClaimAmount(45000), 3000);
        }

        stepIndex++;

        setTimeout(() => {
          clearInterval(eventInterval);
          if (stepIndex >= DEMO_STEPS.length) {
            clearInterval(stepInterval);
            setShowComplete(true);
          }
        }, DEMO_STEPS[stepIndex - 1]?.duration || 0);
      }
    }, DEMO_STEPS[stepIndex]?.duration || 2500);

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min(100, (elapsed / totalDuration) * 100));
      setTime(Math.floor(elapsed / 1000));
    }, 100);

    setTimeout(() => {
      clearInterval(progressInterval);
      setIsPlaying(false);
    }, totalDuration + 1000);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      runDemo();
    }
  }, [isPlaying, runDemo]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <FiZap className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                The Chain Reaction Demo
              </h1>
              <p className="text-slate-400 text-sm">See How ZyntraCare Features Connect</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              setCurrentStep(0);
            }}
            disabled={isPlaying}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
              isPlaying 
                ? 'bg-orange-500/20 text-orange-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
            }`}
          >
            {isPlaying ? <><FiPause /> Playing...</> : <><FiPlay /> Start Demo</>}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiZap className="text-orange-400" />
                Chain Reaction Flow
              </h2>
              <div className="flex items-center gap-4">
                <span className="font-mono text-orange-400">{time.toString().padStart(2, '0')}:00</span>
                <span className="text-sm text-slate-400">{progress.toFixed(0)}%</span>
              </div>
            </div>

            <div className="p-8">
              <div className="relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/10 -translate-y-1/2 rounded-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                <div className="relative flex justify-between">
                  {DEMO_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    const isPending = idx > currentStep;
                    
                    return (
                      <motion.div
                        key={step.id}
                        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                        className="relative flex flex-col items-center"
                      >
                        <motion.div
                          animate={{
                            scale: isActive ? [1, 1.1, 1] : isCompleted ? 1 : 0.9,
                            opacity: isPending ? 0.5 : 1
                          }}
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center border-4 ${
                            isCompleted ? 'border-green-500' : isActive ? 'border-white' : 'border-white/20'
                          } ${isActive ? `shadow-xl ${step.glowColor}` : ''}`}
                        >
                          {isCompleted && !isActive ? (
                            <FiCheckCircle className="text-2xl text-white" />
                          ) : (
                            <span className="text-white">{step.icon}</span>
                          )}
                        </motion.div>
                        <span className={`mt-3 text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">{step.duration / 1000}s</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiActivity className="text-red-400 animate-pulse" />
                Live Event Feed
              </h2>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {events.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Click "Start Demo" to see the chain reaction in action</p>
              ) : (
                <AnimatePresence>
                  {events.map((event, idx) => (
                    <motion.div
                      key={`${event.step}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                    >
                      <span className={event.color}>{event.icon}</span>
                      <span className="flex-1 text-sm">{event.message}</span>
                      <span className="text-xs text-slate-500 font-mono">{event.timestamp}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {showComplete && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4"
              >
                <FiCheckCircle className="text-3xl text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Chain Reaction Complete!</h2>
              <p className="text-slate-300">Total time: 25 seconds | Steps: 4 | Events: 12</p>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiHeart className="text-red-400 animate-pulse" />
              Real-time Vitals
            </h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-red-500/10 rounded-xl">
                <div className="text-4xl font-bold text-red-400">{heartRate}</div>
                <div className="text-sm text-slate-400">Heart Rate (BPM)</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <div className="text-xl font-bold text-blue-400">98%</div>
                  <div className="text-xs text-slate-400">SpO2</div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <div className="text-xl font-bold text-purple-400">36.8°C</div>
                  <div className="text-xs text-slate-400">Temperature</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiNavigation className="text-orange-400" />
              Drone Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Drone ID</span>
                <span className="font-mono text-white">DRN-447</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="text-orange-400">En Route</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">ETA</span>
                <span className="font-mono text-white">{droneETA}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 rounded-full"
                  animate={{ width: droneETA === 'Arrived' ? '100%' : droneETA === '2m' ? '75%' : droneETA === '5m' ? '40%' : '20%' }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiDollarSign className="text-green-400" />
              Smart Wallet
            </h3>
            <div className="space-y-3">
              <div className="text-center p-4 bg-green-500/10 rounded-xl">
                <div className="text-3xl font-bold text-green-400">₹{claimAmount.toLocaleString()}</div>
                <div className="text-sm text-slate-400">Claimed</div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Policy</span>
                <span className="text-white">Zyntra Gold</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="text-green-400">Auto-Approved</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4">
            <h3 className="font-bold mb-2 text-orange-400">The Complete Story</h3>
            <p className="text-sm text-slate-300 mb-3">From detection to recovery in 25 seconds:</p>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Wearable detects heart anomaly</li>
              <li>Records synced to blockchain</li>
              <li>Drone dispatched automatically</li>
              <li>Insurance pays instantly</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}