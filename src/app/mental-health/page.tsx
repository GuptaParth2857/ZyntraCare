'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiAlertTriangle, FiBookOpen, FiCheck, FiClock, FiEdit3, FiHeart, FiPhone, FiRefreshCw, FiStar, FiTrendingUp, FiX, FiZap } from 'react-icons/fi';

interface MoodEntry {
  date: string;
  mood: number;
  label: string;
  energy: number;
  anxiety: number;
  sleep: string;
  journal: string;
}

interface ScreeningQuestion {
  id: number;
  text: string;
  options: string[];
  scores: number[];
}

interface BreathingPhase {
  label: string;
  duration: number;
  instruction: string;
}

const MOOD_OPTIONS = [
  { emoji: '😢', label: 'Terrible', value: 1, color: 'text-red-400 bg-red-500/20 border-red-500/30' },
  { emoji: '😟', label: 'Bad', value: 2, color: 'text-orange-400 bg-orange-500/20 border-orange-500/30' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' },
  { emoji: '😊', label: 'Great', value: 5, color: 'text-green-400 bg-green-500/20 border-green-500/30' },
];

const SLEEP_QUALITIES = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

const PHQ9_QUESTIONS: ScreeningQuestion[] = [
  { id: 1, text: 'Little interest or pleasure in doing things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 2, text: 'Feeling down, depressed, or hopeless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 3, text: 'Trouble falling or staying asleep, or sleeping too much', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 4, text: 'Feeling tired or having little energy', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 5, text: 'Poor appetite or overeating', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 6, text: 'Feeling bad about yourself or that you\'re a failure', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 7, text: 'Trouble concentrating on things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 8, text: 'Moving or speaking slowly / being fidgety or restless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 9, text: 'Thoughts that you would be better off dead', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
];

const GAD7_QUESTIONS: ScreeningQuestion[] = [
  { id: 1, text: 'Feeling nervous, anxious, or on edge', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 2, text: 'Not being able to stop or control worrying', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 3, text: 'Worrying too much about different things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 4, text: 'Trouble relaxing', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 5, text: 'Being so restless that it\'s hard to sit still', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 6, text: 'Becoming easily annoyed or irritable', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
  { id: 7, text: 'Feeling afraid as if something awful might happen', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'], scores: [0, 1, 2, 3] },
];

const STRESS_QUESTIONS: ScreeningQuestion[] = [
  { id: 1, text: 'Felt unable to control the important things in your life', options: ['Never', 'Sometimes', 'Often', 'Very Often'], scores: [0, 1, 2, 3] },
  { id: 2, text: 'Felt confident about your ability to handle personal problems', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
  { id: 3, text: 'Felt that things were going your way', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
  { id: 4, text: 'Found that you could not cope with all the things you had to do', options: ['Never', 'Sometimes', 'Often', 'Very Often'], scores: [0, 1, 2, 3] },
  { id: 5, text: 'Been able to control irritations in your life', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
  { id: 6, text: 'Felt that you were on top of things', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
  { id: 7, text: 'Been angered because of things that were outside of your control', options: ['Never', 'Sometimes', 'Often', 'Very Often'], scores: [0, 1, 2, 3] },
  { id: 8, text: 'Felt difficulties were piling up so high that you could not overcome them', options: ['Never', 'Sometimes', 'Often', 'Very Often'], scores: [0, 1, 2, 3] },
  { id: 9, text: 'Been able to control the way you spend your time', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
  { id: 10, text: 'Felt that you were effectively dealing with important life changes', options: ['Very Often', 'Often', 'Sometimes', 'Never'], scores: [0, 1, 2, 3] },
];

const AFFIRMATIONS = [
  'I am worthy of love and respect, just as I am.',
  'Every day is a fresh start and a new opportunity.',
  'I choose to let go of what I cannot control.',
  'I am stronger than I think and braver than I feel.',
  'My feelings are valid and I honor them.',
  'I deserve peace, happiness, and rest.',
  'I am doing my best and that is enough.',
  'This moment is temporary and I will get through it.',
  'I am surrounded by people who care about me.',
  'I have the power to create positive change in my life.',
  'I am grateful for the small things that bring me joy.',
  'My mental health is a priority and I choose to take care of it.',
  'I am allowed to take breaks and rest without guilt.',
  'I release perfectionism and embrace progress.',
  'I am worthy of the good things life has to offer.',
];

const BREATHING_CYCLE: BreathingPhase[] = [
  { label: 'Breathe In', duration: 4, instruction: 'Inhale slowly through your nose' },
  { label: 'Hold', duration: 7, instruction: 'Hold your breath gently' },
  { label: 'Breathe Out', duration: 8, instruction: 'Exhale slowly through your mouth' },
];

const GROUNDING_STEPS = [
  { count: 5, instruction: 'Name 5 things you can SEE', example: 'A tree, a book, the sky...' },
  { count: 4, instruction: 'Name 4 things you can TOUCH', example: 'The fabric of your chair, your skin...' },
  { count: 3, instruction: 'Name 3 things you can HEAR', example: 'Birds, traffic, your breath...' },
  { count: 2, instruction: 'Name 2 things you can SMELL', example: 'Coffee, fresh air...' },
  { count: 1, instruction: 'Name 1 thing you can TASTE', example: 'Mint, water...' },
];

function generateMoodHistory(): MoodEntry[] {
  return [];
}

function getSeverity(score: number, max: number, levels: { label: string; color: string }[]): { label: string; color: string } {
  const pct = score / max;
  if (pct < 0.25) return levels[0];
  if (pct < 0.5) return levels[1];
  if (pct < 0.75) return levels[2];
  return levels[3];
}

export default function MentalHealthPage() {
  const [activeTab, setActiveTab] = useState<'mood' | 'screening' | 'history' | 'tools' | 'crisis'>('mood');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>(() => generateMoodHistory());
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [sleep, setSleep] = useState('Good');
  const [journal, setJournal] = useState('');
  const [moodSubmitted, setMoodSubmitted] = useState(false);

  // Screening
  const [activeScreening, setActiveScreening] = useState<'phq9' | 'gad7' | 'stress' | null>(null);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<number, number>>({});
  const [screeningResult, setScreeningResult] = useState<{ score: number; max: number; severity: string; color: string; recommendation: string } | null>(null);

  // Breathing
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingTimer, setBreathingTimer] = useState(0);
  const breathingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Grounding
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingComplete, setGroundingComplete] = useState(false);

  // Affirmations
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mental-health?userId=demo-user');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      if (data.moodHistory) setMoodHistory(data.moodHistory);
    } catch {
      // Use empty defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = moodHistory.find(e => e.date === todayStr);
  const streak = useMemo(() => {
    let count = 0;
    const sorted = [...moodHistory].sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      const expected = new Date();
      expected.setDate(expected.getDate() - count);
      if (entry.date === expected.toISOString().split('T')[0]) {
        count++;
      } else break;
    }
    return count;
  }, [moodHistory]);

  const avgMoodThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = moodHistory.filter(e => new Date(e.date) >= weekAgo);
    return thisWeek.length ? thisWeek.reduce((s, e) => s + e.mood, 0) / thisWeek.length : 0;
  }, [moodHistory]);

  const avgMoodLastWeek = useMemo(() => {
    const now = new Date();
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const lastWeek = moodHistory.filter(e => {
      const d = new Date(e.date);
      return d >= twoWeeksAgo && d < weekAgo;
    });
    return lastWeek.length ? lastWeek.reduce((s, e) => s + e.mood, 0) / lastWeek.length : 0;
  }, [moodHistory]);

  const submitMood = async () => {
    if (selectedMood === null) return;
    const moodOption = MOOD_OPTIONS[selectedMood - 1];
    const newEntry: MoodEntry = {
      date: todayStr,
      mood: selectedMood,
      label: moodOption.label,
      energy,
      anxiety,
      sleep,
      journal,
    };
    setMoodHistory(prev => {
      const filtered = prev.filter(e => e.date !== todayStr);
      return [...filtered, newEntry];
    });
    setMoodSubmitted(true);
    try {
      await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user', action: 'saveMood', entry: newEntry }),
      });
    } catch { /* optimistically saved */ }
    setTimeout(() => setMoodSubmitted(false), 3000);
  };

  const startScreening = (type: 'phq9' | 'gad7' | 'stress') => {
    setActiveScreening(type);
    setScreeningAnswers({});
    setScreeningResult(null);
  };

  const submitScreening = async () => {
    if (!activeScreening) return;
    const questions = activeScreening === 'phq9' ? PHQ9_QUESTIONS : activeScreening === 'gad7' ? GAD7_QUESTIONS : STRESS_QUESTIONS;
    const maxScore = questions.length * 3;
    let totalScore = 0;
    questions.forEach(q => {
      totalScore += screeningAnswers[q.id] ?? 0;
    });

    let severity = '', color = '', recommendation = '';
    if (activeScreening === 'phq9') {
      if (totalScore <= 4) { severity = 'Minimal Depression'; color = 'text-green-400'; recommendation = 'Your mood seems stable. Keep up your current wellness habits and continue monitoring.'; }
      else if (totalScore <= 9) { severity = 'Mild Depression'; color = 'text-yellow-400'; recommendation = 'Consider talking to a counselor or therapist. Regular exercise and social connection can help.'; }
      else if (totalScore <= 14) { severity = 'Moderate Depression'; color = 'text-orange-400'; recommendation = 'We recommend consulting a mental health professional. You don\'t have to go through this alone.'; }
      else { severity = 'Severe Depression'; color = 'text-red-400'; recommendation = 'Please reach out to a mental health professional or crisis helpline immediately. Help is available 24/7.'; }
    } else if (activeScreening === 'gad7') {
      if (totalScore <= 4) { severity = 'Minimal Anxiety'; color = 'text-green-400'; recommendation = 'Your anxiety levels seem manageable. Practice mindfulness and continue self-care.'; }
      else if (totalScore <= 9) { severity = 'Mild Anxiety'; color = 'text-yellow-400'; recommendation = 'Try breathing exercises and relaxation techniques. If it persists, consider professional support.'; }
      else if (totalScore <= 14) { severity = 'Moderate Anxiety'; color = 'text-orange-400'; recommendation = 'Consider speaking with a therapist who can help you develop coping strategies.'; }
      else { severity = 'Severe Anxiety'; color = 'text-red-400'; recommendation = 'Please seek professional help. Severe anxiety is treatable and you deserve support.'; }
    } else {
      if (totalScore <= 10) { severity = 'Low Stress'; color = 'text-green-400'; recommendation = 'Your stress levels are well managed. Continue your current coping strategies.'; }
      else if (totalScore <= 18) { severity = 'Moderate Stress'; color = 'text-yellow-400'; recommendation = 'Consider adding more relaxation time. Try our breathing exercises and grounding techniques.'; }
      else if (totalScore <= 25) { severity = 'High Stress'; color = 'text-orange-400'; recommendation = 'Your stress levels are concerning. Prioritize self-care and consider professional support.'; }
      else { severity = 'Very High Stress'; color = 'text-red-400'; recommendation = 'Your stress is very high. Please reach out to a counselor or helpline for support.'; }
    }

    setScreeningResult({ score: totalScore, max: maxScore, severity, color, recommendation });

    try {
      await fetch('/api/mental-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'saveScreening',
          screening: { type: activeScreening, score: totalScore, max: maxScore, severity, answers: screeningAnswers },
        }),
      });
    } catch { /* result displayed locally regardless */ }
  };

  // Breathing exercise
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingPhase(0);
    setBreathingTimer(BREATHING_CYCLE[0].duration);
  };

  useEffect(() => {
    if (!breathingActive) {
      if (breathingInterval.current) clearInterval(breathingInterval.current);
      return;
    }
    breathingInterval.current = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          setBreathingPhase(p => {
            const next = (p + 1) % BREATHING_CYCLE.length;
            setBreathingTimer(BREATHING_CYCLE[next].duration);
            return next;
          });
          return prev;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (breathingInterval.current) clearInterval(breathingInterval.current); };
  }, [breathingActive, breathingPhase]);

  const stopBreathing = () => {
    setBreathingActive(false);
    if (breathingInterval.current) clearInterval(breathingInterval.current);
  };

  const getDayColor = (mood: number) => {
    if (mood <= 1) return 'bg-red-500';
    if (mood <= 2) return 'bg-orange-400';
    if (mood <= 3) return 'bg-yellow-400';
    if (mood <= 4) return 'bg-blue-400';
    return 'bg-green-400';
  };

  const getMoodEmoji = (mood: number) => {
    return MOOD_OPTIONS[mood - 1]?.emoji || '😐';
  };

  const calendarDays = useMemo(() => {
    const days: { date: string; mood?: number; dayNum: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entry = moodHistory.find(e => e.date === dateStr);
      days.push({ date: dateStr, mood: entry?.mood, dayNum: d.getDate() });
    }
    return days;
  }, [moodHistory]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-700/90 backdrop-blur-xl p-6 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
                <FiHeart className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Mental Health</h1>
                <p className="text-purple-200 text-sm">Check-in & Wellness</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/15 px-3 py-1.5 rounded-xl text-center">
                <p className="text-lg font-black">🔥 {streak}</p>
                <p className="text-[10px] text-purple-200">Streak</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black">{todayMood ? getMoodEmoji(todayMood.mood) : '—'}</p>
              <p className="text-xs text-purple-200">Today</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black">{avgMoodThisWeek.toFixed(1)}</p>
              <p className="text-xs text-purple-200">Week Avg</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className={`text-lg font-black ${avgMoodThisWeek >= avgMoodLastWeek ? 'text-green-300' : 'text-red-300'}`}>
                {avgMoodThisWeek >= avgMoodLastWeek ? '↑' : '↓'} {Math.abs(avgMoodThisWeek - avgMoodLastWeek).toFixed(1)}
              </p>
              <p className="text-xs text-purple-200">vs Last Week</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 mb-6 overflow-x-auto">
          {[
            { key: 'mood', label: 'Check-in', icon: FiEdit3 },
            { key: 'screening', label: 'Screenings', icon: FiActivity },
            { key: 'history', label: 'History', icon: FiTrendingUp },
            { key: 'tools', label: 'Tools', icon: FiZap },
            { key: 'crisis', label: 'Crisis Help', icon: FiPhone },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <tab.icon className="text-sm" />
              <span className="hidden sm:inline whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-white/50">Loading your mental health data...</p>
          </div>
        )}

        {!loading && (
        <>

        {/* Mood Check-in Tab */}
        {activeTab === 'mood' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Mood Selector */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-1">How are you feeling today?</h3>
              <p className="text-sm text-white/50 mb-4">Select the emoji that best describes your mood</p>
              <div className="flex justify-center gap-3 mb-2">
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedMood(opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all border ${
                      selectedMood === opt.value
                        ? opt.color
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <span className="text-[10px] font-medium text-white/60">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Energy */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FiZap className="text-yellow-400" /> Energy Level
                  </h4>
                  <span className="text-lg font-black text-yellow-300">{energy}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={energy}
                  onChange={e => setEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Anxiety */}
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FiActivity className="text-blue-400" /> Anxiety Level
                  </h4>
                  <span className="text-lg font-black text-blue-300">{anxiety}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={anxiety}
                  onChange={e => setAnxiety(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-400"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Calm</span>
                  <span>Very Anxious</span>
                </div>
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FiClock className="text-purple-400" /> Sleep Quality Last Night
              </h4>
              <div className="flex gap-2 flex-wrap">
                {SLEEP_QUALITIES.map(sq => (
                  <button
                    key={sq}
                    onClick={() => setSleep(sq)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      sleep === sq
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <FiEdit3 className="text-indigo-400" /> Journal Entry
              </h4>
              <textarea
                value={journal}
                onChange={e => setJournal(e.target.value)}
                placeholder="What's on your mind? (optional)"
                className="w-full h-28 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Submit */}
            <button
              onClick={submitMood}
              disabled={selectedMood === null}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                selectedMood === null
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
              }`}
            >
              {moodSubmitted ? (
                <>
                  <FiCheck /> Check-in Saved!
                </>
              ) : (
                <>
                  <FiCheck /> Save Check-in
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Screening Tab */}
        {activeTab === 'screening' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {!activeScreening ? (
              <>
                <h3 className="font-bold text-lg">Screening Tools</h3>
                <p className="text-sm text-white/50 -mt-2">Validated assessments to understand your mental health better</p>

                {[
                  { key: 'phq9', title: 'PHQ-9 Depression', desc: '9 questions about mood and depression symptoms', icon: '💙', time: '3-5 min' },
                  { key: 'gad7', title: 'GAD-7 Anxiety', desc: '7 questions about anxiety symptoms', icon: '💜', time: '2-3 min' },
                  { key: 'stress', title: 'PSS Stress Assessment', desc: '10 questions about stress levels', icon: '🧡', time: '3-4 min' },
                ].map(tool => (
                  <motion.button
                    key={tool.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => startScreening(tool.key as 'phq9' | 'gad7' | 'stress')}
                    className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-left hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{tool.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold">{tool.title}</h4>
                        <p className="text-sm text-white/50">{tool.desc}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-white/30 flex items-center gap-1"><FiClock /> {tool.time}</span>
                      </div>
                    </div>
                  </motion.button>
                ))}

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <p className="text-sm text-purple-300">
                    <strong>Note:</strong> These screenings are informational only and do not replace professional diagnosis.
                    If you&apos;re in crisis, please call the helpline numbers in the Crisis tab.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Screening Questions */}
                {!screeningResult ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">
                        {activeScreening === 'phq9' ? 'PHQ-9 Depression' : activeScreening === 'gad7' ? 'GAD-7 Anxiety' : 'PSS Stress'} Screening
                      </h3>
                      <button
                        onClick={() => { setActiveScreening(null); setScreeningResult(null); }}
                        className="text-white/50 hover:text-white"
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(Object.keys(screeningAnswers).length / (activeScreening === 'stress' ? 10 : activeScreening === 'gad7' ? 7 : 9)) * 100}%` }}
                      />
                    </div>
                    <div className="space-y-3">
                      {(activeScreening === 'phq9' ? PHQ9_QUESTIONS : activeScreening === 'gad7' ? GAD7_QUESTIONS : STRESS_QUESTIONS).map((q, qi) => (
                        <div key={q.id} className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                          <p className="font-medium text-sm mb-3">
                            <span className="text-purple-400 mr-2">{qi + 1}.</span>
                            {q.text}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oi) => (
                              <button
                                key={oi}
                                onClick={() => setScreeningAnswers(prev => ({ ...prev, [q.id]: q.scores[oi] }))}
                                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                                  screeningAnswers[q.id] === q.scores[oi]
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={submitScreening}
                      disabled={Object.keys(screeningAnswers).length < (activeScreening === 'stress' ? 10 : activeScreening === 'gad7' ? 7 : 9)}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        Object.keys(screeningAnswers).length < (activeScreening === 'stress' ? 10 : activeScreening === 'gad7' ? 7 : 9)
                          ? 'bg-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
                      }`}
                    >
                      Get Results
                    </button>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
                      <p className="text-sm text-white/50 mb-2">Your Score</p>
                      <p className="text-5xl font-black mb-1">{screeningResult.score}<span className="text-lg text-white/40">/{screeningResult.max}</span></p>
                      <p className={`text-xl font-bold mt-2 ${screeningResult.color}`}>{screeningResult.severity}</p>
                      <div className="mt-4 h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${screeningResult.color.replace('text-', 'bg-')}`}
                          style={{ width: `${(screeningResult.score / screeningResult.max) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                      <h4 className="font-bold text-sm mb-2">Recommendation</h4>
                      <p className="text-sm text-white/70 leading-relaxed">{screeningResult.recommendation}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setActiveScreening(null); setScreeningResult(null); setScreeningAnswers({}); }}
                        className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/10 transition-all"
                      >
                        Back to Screenings
                      </button>
                      <button
                        onClick={() => { setScreeningResult(null); setScreeningAnswers({}); }}
                        className="flex-1 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-sm text-purple-300 hover:bg-purple-500/30 transition-all"
                      >
                        Retake
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Weekly Mood Chart */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Mood Trend (Last 14 Days)</h3>
              <div className="flex items-end gap-1.5 h-32">
                {moodHistory.slice(-14).map((entry, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-white/30">{getMoodEmoji(entry.mood)}</span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${getDayColor(entry.mood)}`}
                      style={{ height: `${(entry.mood / 5) * 80}%`, opacity: 0.7 + (entry.mood / 5) * 0.3 }}
                    />
                    <span className="text-[8px] text-white/30">{new Date(entry.date).getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-white/30">
                <span>😢 1 - Terrible</span>
                <span>😊 5 - Great</span>
              </div>
            </div>

            {/* Monthly Calendar Heatmap */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Mood Calendar (Last 30 Days)</h3>
              <div className="grid grid-cols-7 gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                  <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
                ))}
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                      day.mood ? getDayColor(day.mood) : 'bg-white/5'
                    } ${!day.mood ? 'text-white/20' : 'text-white'}`}
                    style={{ opacity: day.mood ? 0.6 + (day.mood / 5) * 0.4 : 0.3 }}
                    title={day.mood ? `${day.date}: ${MOOD_OPTIONS[day.mood - 1]?.label}` : day.date}
                  >
                    <span className="text-[10px]">{day.dayNum}</span>
                    {day.mood && <span className="text-[8px]">{getMoodEmoji(day.mood)}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Week Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-sm text-white/50 mb-1">This Week</p>
                <p className="text-3xl font-black text-blue-300">{avgMoodThisWeek.toFixed(1)}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(avgMoodThisWeek) ? 'bg-blue-400' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center">
                <p className="text-sm text-white/50 mb-1">Last Week</p>
                <p className="text-3xl font-black text-purple-300">{avgMoodLastWeek.toFixed(1)}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= Math.round(avgMoodLastWeek) ? 'bg-purple-400' : 'bg-white/10'}`} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Breathing Exercise */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-1">4-7-8 Breathing</h3>
              <p className="text-sm text-white/50 mb-4">A calming technique to reduce anxiety</p>

              {!breathingActive ? (
                <button
                  onClick={startBreathing}
                  className="w-full py-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl text-purple-300 font-medium hover:from-purple-500/30 hover:to-blue-500/30 transition-all"
                >
                  Start Breathing Exercise
                </button>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <motion.div
                    animate={{
                      scale: breathingPhase === 0 ? 1.3 : breathingPhase === 1 ? 1.3 : 1,
                    }}
                    transition={{ duration: BREATHING_CYCLE[breathingPhase].duration, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400/40 flex flex-col items-center justify-center mb-4"
                  >
                    <p className="text-2xl font-black text-white">{breathingTimer}</p>
                    <p className="text-sm text-purple-200">{BREATHING_CYCLE[breathingPhase].label}</p>
                  </motion.div>
                  <p className="text-sm text-white/60 mb-4">{BREATHING_CYCLE[breathingPhase].instruction}</p>
                  <div className="flex gap-2 mb-3">
                    {BREATHING_CYCLE.map((phase, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          i === breathingPhase ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/30'
                        }`}
                      >
                        {phase.label} ({phase.duration}s)
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={stopBreathing}
                    className="px-6 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/15 transition-all"
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>

            {/* Grounding Technique */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-1">5-4-3-2-1 Grounding</h3>
              <p className="text-sm text-white/50 mb-4">Bring yourself back to the present moment</p>

              {!groundingComplete ? (
                <div className="space-y-3">
                  {GROUNDING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-all ${
                        i <= groundingStep
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-white/5 border-white/10 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-300">
                          {step.count}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{step.instruction}</p>
                          <p className="text-xs text-white/40">{step.example}</p>
                        </div>
                        {i < groundingStep && <FiCheck className="text-blue-400 ml-auto" />}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      if (groundingStep >= GROUNDING_STEPS.length - 1) {
                        setGroundingComplete(true);
                      } else {
                        setGroundingStep(prev => prev + 1);
                      }
                    }}
                    className="w-full py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 font-medium hover:bg-blue-500/30 transition-all"
                  >
                    {groundingStep >= GROUNDING_STEPS.length - 1 ? 'Complete' : 'Next Step'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl mb-3 block">🎉</span>
                  <p className="text-lg font-bold text-blue-300">Well Done!</p>
                  <p className="text-sm text-white/50 mt-1">You completed the grounding exercise.</p>
                  <button
                    onClick={() => { setGroundingStep(0); setGroundingComplete(false); }}
                    className="mt-4 px-6 py-2 bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:bg-white/15 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Affirmations */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <FiStar className="text-amber-400" /> Positive Affirmations
              </h3>
              <p className="text-sm text-white/50 mb-4">Take a moment to reflect on these words</p>
              <motion.div
                key={affirmationIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6 text-center"
              >
                <p className="text-lg font-medium text-amber-200 leading-relaxed italic">
                  &ldquo;{AFFIRMATIONS[affirmationIndex]}&rdquo;
                </p>
              </motion.div>
              <button
                onClick={() => setAffirmationIndex(prev => (prev + 1) % AFFIRMATIONS.length)}
                className="w-full mt-3 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="text-xs" /> New Affirmation
              </button>
            </div>

            {/* Meditation Links */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <FiBookOpen className="text-indigo-400" /> Guided Wellness
              </h3>
              <div className="space-y-2">
                {[
                  { title: 'Body Scan Meditation', duration: '10 min', icon: '🧘' },
                  { title: 'Progressive Muscle Relaxation', duration: '15 min', icon: '💪' },
                  { title: 'Gratitude Journaling Guide', duration: '5 min', icon: '📝' },
                  { title: 'Sleep Hygiene Checklist', duration: '3 min', icon: '😴' },
                  { title: 'Mindful Walking Guide', duration: '12 min', icon: '🚶' },
                ].map(item => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-white/40">{item.duration}</p>
                    </div>
                    <span className="text-xs text-white/30">Play →</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Crisis Tab */}
        {activeTab === 'crisis' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-8">
            {/* Urgent Banner */}
            <div className="bg-gradient-to-br from-red-600/30 to-pink-600/30 border border-red-500/30 rounded-2xl p-6 text-center">
              <FiAlertTriangle className="text-red-400 text-3xl mx-auto mb-3" />
              <h3 className="text-xl font-black text-red-300 mb-1">Need Help Now?</h3>
              <p className="text-sm text-white/60 mb-4">
                If you&apos;re in crisis or feeling unsafe, please reach out. You are not alone.
              </p>
              <a
                href="tel:9152987821"
                className="inline-flex items-center gap-2 px-8 py-4 bg-red-500/30 border border-red-500/50 rounded-2xl text-red-200 font-bold text-lg hover:bg-red-500/40 transition-all"
              >
                <FiPhone /> Talk to Someone Now
              </a>
            </div>

            {/* Helplines */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-4">Crisis Helplines (India)</h3>
              <div className="space-y-3">
                {[
                  { name: 'iCall', number: '9152987821', desc: 'Counseling & support service', hours: 'Mon-Sat, 8 AM - 10 PM', color: 'from-blue-500/20 to-blue-600/10' },
                  { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 mental health support', hours: '24/7', color: 'from-purple-500/20 to-purple-600/10' },
                  { name: 'NIMHANS Helpline', number: '080-46110007', desc: 'National Institute of Mental Health', hours: '24/7', color: 'from-green-500/20 to-green-600/10' },
                  { name: 'AASRA', number: '9820466726', desc: 'Suicide prevention helpline', hours: '24/7', color: 'from-amber-500/20 to-amber-600/10' },
                  { name: 'Sneha India', number: '044-24640050', desc: 'Emotional support', hours: '24/7', color: 'from-cyan-500/20 to-cyan-600/10' },
                ].map(h => (
                  <div key={h.name} className={`bg-gradient-to-r ${h.color} border border-white/10 rounded-xl p-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{h.name}</h4>
                        <p className="text-xs text-white/50">{h.desc}</p>
                        <p className="text-xs text-white/30 mt-1">{h.hours}</p>
                      </div>
                      <a
                        href={`tel:${h.number.replace(/-/g, '')}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-all whitespace-nowrap"
                      >
                        <FiPhone /> {h.number}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg mb-3">Safety Planning</h3>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">1️⃣</span>
                  <p><strong className="text-white">Recognize warning signs</strong> — Know what thoughts or feelings signal a crisis for you.</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">2️⃣</span>
                  <p><strong className="text-white">Use coping strategies</strong> — Try breathing exercises, grounding, or calling a friend.</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">3️⃣</span>
                  <p><strong className="text-white">Social contacts</strong> — List people you can reach out to when you need support.</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">4️⃣</span>
                  <p><strong className="text-white">Professional help</strong> — Keep therapist and helpline numbers handy.</p>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">5️⃣</span>
                  <p><strong className="text-white">Make environment safe</strong> — Remove or secure anything that could be harmful.</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-white/30 py-2">
              You matter. Your life matters. Help is always available.
            </p>
          </motion.div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
