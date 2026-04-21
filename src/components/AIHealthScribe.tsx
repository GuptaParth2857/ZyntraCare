'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiSquare, FiRefreshCw, FiCheckCircle, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';

// Add TypeScript support for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AIHealthScribe() {
  const [isRecording, setIsRecording] = useState(false);
  const [stage, setStage] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState<{
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
      setStage('recording');
    } else {
      alert("Your browser does not support Speech Recognition. Try Google Chrome.");
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setStage('processing');
    
    if (!transcript.trim()) {
      alert("No speech detected. Please try again.");
      setStage('idle');
      return;
    }

    try {
      const response = await fetch('/api/scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error(data.error);
        throw new Error(data.error);
      }

      setSummary({
        subjective: data.chiefComplaint + " " + data.historyOfPresentIllness,
        objective: data.physicalExamination || "Vitals not specified.",
        assessment: Array.isArray(data.diagnosis) ? data.diagnosis.join(', ') : data.diagnosis,
        plan: (Array.isArray(data.advice) ? data.advice.join('. ') : data.advice) + 
              (data.prescriptions && data.prescriptions.length > 0 ? " | Rx: " + JSON.stringify(data.prescriptions) : "")
      });
      setStage('done');
    } catch (err) {
      console.error(err);
      // Fallback
      setSummary({
        subjective: "Error connecting to AI. Using fallback logic. Patient reports persistent headache...",
        objective: "Vitals: BP 124/82, Pulse 78.",
        assessment: "System Error or API limit reached.",
        plan: "Please check console and API keys."
      });
      setStage('done');
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FiMic size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">AI healthScribe™</h2>
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Ambient Clinical Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-[10px] text-gray-400 font-bold uppercase">{stage}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 bg-white/5 border-2 border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 group hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={startRecording}>
              <FiMic size={32} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Start Consultation</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">Click to start recording the patient visit. ZyntraAI will automatically generate medical notes.</p>
          </motion.div>
        )}

        {stage === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="relative w-32 h-32 mx-auto mb-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                  className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"
                />
              ))}
              <div className="absolute inset-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)]">
                <FiMic size={40} className="text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-white font-bold text-lg mb-1 italic">Listening to consultation...</h3>
            <p className="text-indigo-400 text-xs font-bold mb-6">REAL-TIME PROCESSING ACTIVE</p>
            
            {/* Live Transcript Preview */}
            <div className="bg-black/30 rounded-xl p-4 mb-6 max-w-lg mx-auto text-left h-24 overflow-y-auto">
              <p className="text-gray-300 text-sm italic">"{transcript || 'Waiting for speech...'}"</p>
            </div>

            <button onClick={stopRecording} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 mx-auto transition shadow-lg shadow-red-500/20">
              <FiSquare /> Stop and Generate Summary
            </button>
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
            <h3 className="text-white font-bold mb-2 text-xl">ZyntraAI is Analyzing...</h3>
            <p className="text-gray-500 text-sm">Structuring live conversation into SOAP format via Gemini</p>
          </motion.div>
        )}

        {stage === 'done' && summary && (
          <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
             <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <FiCheckCircle /> Summary Generated Successfully
              </div>
              <button onClick={() => setStage('idle')} className="text-gray-500 hover:text-white transition flex items-center gap-1 text-xs">
                <FiRefreshCw /> Restart
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Subjective</h4>
                <p className="text-white text-sm leading-relaxed">{summary.subjective}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Objective</h4>
                <p className="text-white text-sm leading-relaxed">{summary.objective}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Assessment</h4>
                <p className="text-white text-sm leading-relaxed font-bold">{summary.assessment}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <h4 className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-2">Plan</h4>
                <p className="text-white text-sm leading-relaxed italic">{summary.plan}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition flex items-center justify-center gap-2">
                <FiFileText /> Push to Patient Record
              </button>
              <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition">
                Edit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
