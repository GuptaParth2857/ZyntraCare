'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiPlay, FiPause, FiTrash2, FiCalendar, FiClock, FiBookOpen, FiActivity, FiPlus, FiSearch, FiEdit2, FiSave, FiX } from 'react-icons/fi';

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  transcript: string;
  audioUrl?: string;
  mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  symptoms: string[];
  tags: string[];
  duration: number;
}

const MOODS = [
  { value: 'great', emoji: '😊', label: 'Great', color: 'text-emerald-400 bg-emerald-500/20' },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'text-blue-400 bg-blue-500/20' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'text-amber-400 bg-amber-500/20' },
  { value: 'bad', emoji: '😔', label: 'Bad', color: 'text-orange-400 bg-orange-500/20' },
  { value: 'terrible', emoji: '😫', label: 'Terrible', color: 'text-red-400 bg-red-500/20' },
];

const SYMPTOMS = [
  'Headache', 'Fever', 'Fatigue', 'Nausea', 'Body Pain', 'Cough',
  'Cold', 'Dizziness', 'Anxiety', 'Insomnia', 'Appetite Loss',
  'Joint Pain', 'Back Pain', 'Throat Pain', 'Stomach Pain'
];

const TAGS = [
  'Medication', 'Exercise', 'Diet', 'Sleep', 'Stress', 'Work',
  'Travel', 'Doctor Visit', 'Lab Test', 'Vitals Check'
];

export default function VoiceJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('good');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('zyntracare_voice_journal');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      const sampleEntries: JournalEntry[] = [
        {
          id: '1',
          date: new Date(Date.now() - 86400000).toISOString(),
          title: 'Morning walk felt great',
          transcript: 'Went for a 30 minute walk this morning. Energy levels were high, felt refreshed after a good night sleep. Blood pressure was normal at 120/80. No pain or discomfort.',
          mood: 'great',
          symptoms: [],
          tags: ['Exercise', 'Vitals Check'],
          duration: 45,
        },
        {
          id: '2',
          date: new Date(Date.now() - 172800000).toISOString(),
          title: 'Mild headache after work',
          transcript: 'Developed a mild headache around 4 PM after long hours at the computer. Took paracetamol 500mg. Headache reduced by evening. Also noticed some neck stiffness.',
          mood: 'okay',
          symptoms: ['Headache', 'Body Pain'],
          tags: ['Medication', 'Work'],
          duration: 32,
        },
        {
          id: '3',
          date: new Date(Date.now() - 259200000).toISOString(),
          title: 'Doctor visit follow-up',
          transcript: 'Met Dr. Sharma for follow-up. Blood sugar levels are within range. HbA1c at 6.2. Continue current medication. Need to increase walking to 45 minutes daily.',
          mood: 'good',
          symptoms: [],
          tags: ['Doctor Visit', 'Lab Test'],
          duration: 60,
        },
      ];
      setEntries(sampleEntries);
      localStorage.setItem('zyntracare_voice_journal', JSON.stringify(sampleEntries));
    }
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('zyntracare_voice_journal', JSON.stringify(entries));
    }
  }, [entries]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const saveEntry = () => {
    if (!transcript.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: transcript.slice(0, 50) + (transcript.length > 50 ? '...' : ''),
      transcript,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      tags: selectedTags,
      duration: recordingTime,
    };

    setEntries(prev => [entry, ...prev]);
    setTranscript('');
    setSelectedSymptoms([]);
    setSelectedTags([]);
    setRecordingTime(0);
    setShowNewEntry(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry.id);
    setEditTitle(entry.title);
  };

  const saveEdit = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, title: editTitle } : e));
    setEditingEntry(null);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchTerm ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.transcript.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = filterMood === 'all' || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoodStats = () => {
    const stats: Record<string, number> = {};
    entries.forEach(e => {
      stats[e.mood] = (stats[e.mood] || 0) + 1;
    });
    return stats;
  };

  const moodStats = getMoodStats();

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-6">
            <FiBookOpen size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Voice <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Health Journal</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Record your health updates with voice. Track symptoms, moods, and health patterns over time.
          </p>
        </motion.div>

        {/* Mood Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/80 border border-white/10 rounded-[2rem] p-6 mb-8 backdrop-blur-xl"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FiActivity className="text-indigo-400" /> Mood Trends
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {MOODS.map(mood => (
              <div key={mood.value} className="text-center">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl mb-2 ${mood.color}`}>
                  {mood.emoji}
                </div>
                <p className="text-xs text-gray-400">{mood.label}</p>
                <p className="text-lg font-bold text-white">{moodStats[mood.value] || 0}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNewEntry(true)}
            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <FiMic size={20} /> New Voice Entry
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const entry: JournalEntry = {
                id: Date.now().toString(),
                date: new Date().toISOString(),
                title: 'Quick Note',
                transcript: '',
                mood: 'good',
                symptoms: [],
                tags: [],
                duration: 0,
              };
              setEntries(prev => [entry, ...prev]);
              setEditingEntry(entry.id);
              setEditTitle('Quick Note');
            }}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition"
          >
            <FiEdit2 size={20} /> Text Note
          </motion.button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search journal entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Moods</option>
            {MOODS.map(mood => (
              <option key={mood.value} value={mood.value}>{mood.emoji} {mood.label}</option>
            ))}
          </select>
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-slate-900/60 border border-white/10 rounded-[2rem]"
            >
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-400 mb-2">No journal entries yet</h2>
              <p className="text-gray-500">Start recording your health journey</p>
            </motion.div>
          ) : (
            filteredEntries.map((entry, idx) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${MOODS.find(m => m.value === entry.mood)?.color || ''}`}>
                      {MOODS.find(m => m.value === entry.mood)?.emoji}
                    </div>
                    <div>
                      {editingEntry === entry.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <button onClick={() => saveEdit(entry.id)} className="text-emerald-400 hover:text-emerald-300">
                            <FiSave size={16} />
                          </button>
                          <button onClick={() => setEditingEntry(null)} className="text-gray-400 hover:text-gray-300">
                            <FiX size={16} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-bold text-white">{entry.title}</h3>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FiCalendar size={12} />
                        {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <FiClock size={12} />
                        {formatDuration(entry.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(entry)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition flex items-center justify-center"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition flex items-center justify-center"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                {entry.transcript && (
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">{entry.transcript}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {entry.symptoms.map(s => (
                    <span key={s} className="px-2 py-1 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium">{s}</span>
                  ))}
                  {entry.tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* New Entry Modal */}
        <AnimatePresence>
          {showNewEntry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              onClick={() => { setShowNewEntry(false); stopRecording(); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">New Voice Entry</h2>
                  <button onClick={() => { setShowNewEntry(false); stopRecording(); }} className="text-gray-400 hover:text-white">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Recording Section */}
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500/20 animate-ping' : 'bg-indigo-500/10'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition ${
                          isRecording
                            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
                        }`}
                      >
                        {isRecording ? <FiMicOff size={32} /> : <FiMic size={32} />}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {isRecording ? (
                      <span className="text-red-400 font-bold">Recording... {formatDuration(recordingTime)}</span>
                    ) : 'Tap to start recording'}
                  </p>
                </div>

                {/* Transcript Preview */}
                {transcript && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm text-gray-300 leading-relaxed">{transcript}</p>
                  </div>
                )}

                {/* Mood Selection */}
                <div className="mb-6">
                  <label className="text-sm font-bold text-gray-300 mb-3 block">How are you feeling?</label>
                  <div className="flex gap-3 justify-center">
                    {MOODS.map(mood => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value as JournalEntry['mood'])}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${
                          selectedMood === mood.value
                            ? `${mood.color} border-2 border-current`
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mb-6">
                  <label className="text-sm font-bold text-gray-300 mb-3 block">Symptoms (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="text-sm font-bold text-gray-300 mb-3 block">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selectedTags.includes(tag)
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveEntry}
                  disabled={!transcript.trim()}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Save Journal Entry
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
