'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, FiHeart, FiWind, FiCoffee, FiZap, FiTrendingUp, FiTrendingDown,
  FiPlay, FiPause, FiRefreshCw, FiShield, FiAlertTriangle, FiCheckCircle,
  FiNavigation, FiTarget, FiClock, FiSmile, FiFrown
} from 'react-icons/fi';

interface OrganHealth {
  name: string;
  health: number;
  color: string;
  position: { x: number; y: number };
  description: string;
}

interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const INITIAL_ORGANS: OrganHealth[] = [
  { name: 'Heart', health: 85, color: '#ef4444', position: { x: 50, y: 25 }, description: 'Pumping life through your body' },
  { name: 'Lungs', health: 78, color: '#3b82f6', position: { x: 35, y: 30 }, description: 'Breathing the breath of life' },
  { name: 'Liver', health: 92, color: '#22c55e', position: { x: 65, y: 40 }, description: 'Detoxifying your blood' },
  { name: 'Kidneys', health: 88, color: '#8b5cf6', position: { x: 55, y: 45 }, description: 'Filtering waste from body' },
  { name: 'Brain', health: 95, color: '#f59e0b', position: { x: 50, y: 12 }, description: 'Processing thoughts and memories' },
  { name: 'Stomach', health: 72, color: '#ec4899', position: { x: 50, y: 42 }, description: 'Digesting your energy' },
];

const HABITS = [
  { id: 'smoking', label: 'Smoking', icon: '🚬', impact: { heart: -25, lungs: -35, liver: -15, kidneys: -10, brain: -15, stomach: -10 } },
  { id: 'alcohol', label: 'Alcohol', icon: '🍺', impact: { heart: -15, lungs: -5, liver: -40, kidneys: -20, brain: -15, stomach: -25 } },
  { id: 'exercise', label: 'Exercise', icon: '🏃', impact: { heart: 20, lungs: 25, liver: 15, kidneys: 10, brain: 20, stomach: 10 } },
  { id: 'sleep', label: 'Sleep 8hrs', icon: '😴', impact: { heart: 10, lungs: 5, liver: 15, kidneys: 10, brain: 30, stomach: 5 } },
  { id: 'water', label: 'Water 2L+', icon: '💧', impact: { heart: 5, lungs: 10, liver: 15, kidneys: 25, brain: 10, stomach: 15 } },
  { id: 'junkfood', label: 'Junk Food', icon: '🍔', impact: { heart: -15, lungs: -5, liver: -20, kidneys: -10, brain: -5, stomach: -30 } },
  { id: 'stress', label: 'Stress', icon: '😰', impact: { heart: -20, lungs: -10, liver: -15, kidneys: -10, brain: -25, stomach: -20 } },
  { id: 'meditation', label: 'Meditation', icon: '🧘', impact: { heart: 15, lungs: 10, liver: 10, kidneys: 5, brain: 25, stomach: 10 } },
];

export default function DigitalTwinPage() {
  const [organs, setOrgans] = useState<OrganHealth[]>(INITIAL_ORGANS);
  const [selectedYear, setSelectedYear] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const [futureYear, setFutureYear] = useState(0);
  const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState(85);
  const [activeHabits, setActiveHabits] = useState<string[]>(['exercise', 'sleep']);
  const [bodyRotation, setBodyRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setFutureYear(prev => {
          if (prev >= 10) {
            setIsPlaying(false);
            return 10;
          }
          return prev + 1;
        });
      }
    }, 800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const baseHealth = INITIAL_ORGANS.map(organ => {
      let health = 80;
      activeHabits.forEach(habitId => {
        const habit = HABITS.find(h => h.id === habitId);
        if (habit) {
          health += habit.impact[organ.name.toLowerCase() as keyof typeof habit.impact] || 0;
        }
      });
      return Math.min(100, Math.max(0, health + (futureYear * (Math.random() - 0.5) * 5)));
    });

    setOrgans(INITIAL_ORGANS.map((organ, idx) => ({
      ...organ,
      health: Math.round(baseHealth[idx])
    })));

    const avgHealth = baseHealth.reduce((a, b) => a + b, 0) / baseHealth.length;
    setHealthScore(Math.round(avgHealth));
  }, [activeHabits, futureYear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawBody = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      const bodyGradient = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 200);
      bodyGradient.addColorStop(0, 'rgba(20, 184, 166, 0.1)');
      bodyGradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
      ctx.fillStyle = bodyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(bodyRotation * Math.PI / 180);
      ctx.translate(-centerX, -centerY);

      ctx.strokeStyle = 'rgba(20, 184, 166, 0.5)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 50, 60, 120, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - 80, 35, 40, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - 70, centerY - 60);
      ctx.quadraticCurveTo(centerX - 90, centerY, centerX - 70, centerY + 80);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + 70, centerY - 60);
      ctx.quadraticCurveTo(centerX + 90, centerY, centerX + 70, centerY + 80);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX - 40, centerY + 120);
      ctx.lineTo(centerX - 50, centerY + 220);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(centerX + 40, centerY + 120);
      ctx.lineTo(centerX + 50, centerY + 220);
      ctx.stroke();

      ctx.restore();

      organs.forEach((organ, idx) => {
        const x = centerX + (organ.position.x - 50) * 3;
        const y = centerY + (organ.position.y - 30) * 3.5;
        const size = 20 + (organ.health / 100) * 15;
        
        const glowColor = organ.health > 70 ? 'rgba(34, 197, 94, 0.3)' : organ.health > 40 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)';
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = organ.color;
        ctx.globalAlpha = organ.health / 100;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (hoveredOrgan === organ.name) {
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(organ.name, x, y - size - 10);
          ctx.font = '12px sans-serif';
          ctx.fillText(`${organ.health}%`, x, y + size + 20);
        }
      });
    };

    drawBody();
    const rotationInterval = setInterval(() => {
      setBodyRotation(prev => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(rotationInterval);
  }, [organs, hoveredOrgan, bodyRotation]);

  const toggleHabit = (habitId: string) => {
    setActiveHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(h => h !== habitId)
        : [...prev, habitId]
    );
  };

  const resetSimulation = () => {
    setFutureYear(0);
    setIsPlaying(false);
    setActiveHabits(['exercise', 'sleep']);
  };

  const getScoreColor = () => {
    if (healthScore >= 80) return 'text-green-400';
    if (healthScore >= 60) return 'text-amber-400';
    return 'text-red-400';
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
              <FiActivity className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Your Digital Twin
              </h1>
              <p className="text-slate-400 text-sm">See your future self. Change your habits. Transform your health.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border ${
              healthScore >= 80 ? 'bg-green-500/20 border-green-500/50' :
              healthScore >= 60 ? 'bg-amber-500/20 border-amber-500/50' :
              'bg-red-500/20 border-red-500/50'
            }`}>
              <span className={`font-bold text-2xl ${getScoreColor()}`}>{healthScore}%</span>
              <span className="text-slate-400 ml-2">Health Score</span>
            </div>
          </div>
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
                <FiTarget className="text-cyan-400" />
                3D Digital Body
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">Year: {futureYear}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFutureYear(0); setIsPlaying(false); }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    <FiRefreshCw className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => { setIsPlaying(!isPlaying); if (!isPlaying && futureYear >= 10) setFutureYear(0); }}
                    className={`px-4 py-2 rounded-lg font-semibold ${isPlaying ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500 text-white'}`}
                  >
                    {isPlaying ? <><FiPause /> Pause</> : <><FiPlay /> Fast Forward</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="relative h-96">
              <canvas 
                ref={canvasRef}
                width={700}
                height={400}
                className="w-full h-full"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  
                  let found = null;
                  organs.forEach(organ => {
                    const organX = centerX + (organ.position.x - 50) * 3;
                    const organY = centerY + (organ.position.y - 30) * 3.5;
                    const dist = Math.sqrt((x - organX) ** 2 + (y - organY) ** 2);
                    if (dist < 30) found = organ.name;
                  });
                  setHoveredOrgan(found);
                }}
                onMouseLeave={() => setHoveredOrgan(null)}
              />
              
              <AnimatePresence>
                {hoveredOrgan && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 p-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl max-w-xs"
                  >
                    {organs.filter(o => o.name === hoveredOrgan).map(organ => (
                      <div key={organ.name}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: organ.color }} />
                          <span className="font-bold">{organ.name}</span>
                          <span className={`ml-auto font-mono ${organ.health > 70 ? 'text-green-400' : organ.health > 40 ? 'text-amber-400' : 'text-red-400'}`}>
                            {organ.health}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{organ.description}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                Hover over organs to see details
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiSmile className="text-green-400" />
                Good Habits
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {HABITS.filter(h => ['exercise', 'sleep', 'water', 'meditation'].includes(h.id)).map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeHabits.includes(habit.id)
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span className="ml-2 text-sm">{habit.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiFrown className="text-red-400" />
                Bad Habits
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {HABITS.filter(h => ['smoking', 'alcohol', 'junkfood', 'stress'].includes(h.id)).map(habit => (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeHabits.includes(habit.id)
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{habit.icon}</span>
                    <span className="ml-2 text-sm">{habit.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FiHeart className="text-red-400" />
              Organ Health
            </h3>
            <div className="space-y-3">
              {organs.map((organ, idx) => (
                <motion.div
                  key={organ.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: organ.color }} />
                      <span className="font-semibold text-sm">{organ.name}</span>
                    </div>
                    <span className={`text-sm font-mono ${
                      organ.health > 70 ? 'text-green-400' : organ.health > 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>{organ.health}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${organ.health}%` }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: organ.health > 70 ? '#22c55e' : organ.health > 40 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-2xl p-4">
            <h3 className="font-bold mb-2 text-cyan-400">Future Prediction</h3>
            <p className="text-sm text-slate-300 mb-3">
              {futureYear === 0 
                ? 'Select habits and click "Fast Forward" to see your future body!'
                : healthScore >= 80
                ? 'Great job! Your healthy habits will keep you strong in the future.'
                : healthScore >= 60
                ? 'Warning: Some organs show decline. Consider improving your habits.'
                : 'Critical: Your habits are causing serious damage. Change now!'
              }
            </p>
            {futureYear > 0 && (
              <div className="flex items-center gap-2">
                <FiAlertTriangle className={healthScore < 60 ? 'text-red-400' : 'text-amber-400'} />
                <span className="text-sm">{healthScore < 60 ? 'Immediate action needed!' : 'Room for improvement'}</span>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <FiShield className="text-green-400" />
              Recommendations
            </h3>
            <div className="space-y-2 text-sm">
              {healthScore < 70 && (
                <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-lg">
                  <FiAlertTriangle className="text-red-400 mt-0.5" />
                  <span className="text-slate-300">Quit smoking immediately</span>
                </div>
              )}
              {organs.find(o => o.name === 'Heart')?.health! < 70 && (
                <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg">
                  <FiActivity className="text-amber-400 mt-0.5" />
                  <span className="text-slate-300">Start cardio exercises</span>
                </div>
              )}
              {organs.find(o => o.name === 'Liver')?.health! < 70 && (
                <div className="flex items-start gap-2 p-2 bg-amber-500/10 rounded-lg">
                  <FiWind className="text-amber-400 mt-0.5" />
                  <span className="text-slate-300">Reduce alcohol consumption</span>
                </div>
              )}
              <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg">
                <FiCheckCircle className="text-green-400 mt-0.5" />
                <span className="text-slate-300">Continue regular exercise</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}