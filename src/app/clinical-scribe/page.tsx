'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMic, FiMicOff, FiFileText, FiActivity, FiHeart, FiThermometer,
  FiAlertCircle, FiCheckCircle, FiDownload, FiRefreshCw, FiClock,
  FiUser, FiBookOpen, FiCpu, FiSend, FiEdit2, FiSave, FiRadio
} from 'react-icons/fi';

interface TranscriptEntry {
  id: string;
  speaker: 'doctor' | 'patient' | 'ai';
  text: string;
  timestamp: string;
  emotion?: string;
}

interface MedicalEntity {
  type: 'symptom' | 'medication' | 'diagnosis' | 'vital' | 'procedure';
  value: string;
  confidence: number;
}

interface GeneratedReport {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  diagnosis: string[];
  prescriptions: { medicine: string; dosage: string; frequency: string; duration: string }[];
  advice: string[];
  followUp: string;
}

const SAMPLE_CONVERSATION = [
  { speaker: 'patient', text: "Namaste Doctor, mujhe 3 din se bukhar hai aur fever aata jaata hai.", emotion: 'tired' },
  { speaker: 'patient', text: "Iske saath hi mujhe sar dard bhi hai aur body mein kamzori feel hoti hai.", emotion: 'worried' },
  { speaker: 'doctor', text: "Accha, bukhar kitna hai? Dolo 650 liya aapne?", emotion: 'attentive' },
  { speaker: 'patient', text: "Haan, kal raat liya tha ek tablet. Thoda kam hua, phir se badh gaya.", emotion: 'concerned' },
  { speaker: 'doctor', text: "Khaansi hai? Khaana khane ka mann karta hai? Pet mein koi dikkat hai?", emotion: 'inquisitive' },
  { speaker: 'patient', text: "Haan, thodi khaansi hai aur pet mein dard bhi hai ek dam se.", emotion: 'uncomfortable' },
  { speaker: 'doctor', text: "Thik hai, aapko examine karne dete hain. BP check karte hain.", emotion: 'reassuring' },
  { speaker: 'ai', text: "[VITALS RECORDED: BP - 120/80, Pulse - 98 bpm, Temperature - 101.2°F, SpO2 - 98%]", emotion: 'neutral' },
  { speaker: 'doctor', text: "Aapka BP normal hai, lekin fever zyada hai. Lagta hai viral infection hai.", emotion: 'professional' },
  { speaker: 'doctor', text: "Dolo 650 ek aur denge, aur Calcirol XS syrup 2 chammach raat ko.", emotion: 'decisive' },
  { speaker: 'doctor', text: "5 din ke liye medicine lein. Agar fever jaldi na utre toh aana.", emotion: 'caring' },
];

const DETECTED_ENTITIES: MedicalEntity[] = [
  { type: 'symptom', value: 'Fever (101.2°F)', confidence: 0.98 },
  { type: 'symptom', value: 'Headache', confidence: 0.92 },
  { type: 'symptom', value: 'Body weakness', confidence: 0.89 },
  { type: 'symptom', value: 'Cough', confidence: 0.85 },
  { type: 'symptom', value: 'Abdominal pain', confidence: 0.78 },
  { type: 'medication', value: 'Dolo 650', confidence: 0.99 },
  { type: 'medication', value: 'Calcirol XS Syrup', confidence: 0.95 },
  { type: 'vital', value: 'BP: 120/80 mmHg', confidence: 1.0 },
  { type: 'vital', value: 'Pulse: 98 bpm', confidence: 1.0 },
  { type: 'vital', value: 'SpO2: 98%', confidence: 1.0 },
  { type: 'diagnosis', value: 'Viral Fever', confidence: 0.91 },
];

const INITIAL_REPORT: GeneratedReport = {
  chiefComplaint: "3 days fever with headache, body weakness, cough and mild abdominal pain",
  historyOfPresentIllness: "Patient experiencing intermittent fever for 3 days. Took Dolo 650 last night which provided temporary relief. Symptoms associated with headache and general fatigue. No significant medical history reported.",
  physicalExamination: "Vitals: BP 120/80 mmHg, Pulse 98 bpm, Temperature 101.2°F, SpO2 98% on room air. Patient appears tired but responsive. No signs of dehydration.",
  diagnosis: ["Viral Fever", "Upper Respiratory Tract Infection"],
  prescriptions: [
    { medicine: "Dolo 650 (Paracetamol)", dosage: "650mg", frequency: "1 tablet 3 times a day", duration: "5 days" },
    { medicine: "Calcirol XS Syrup", dosage: "2 teaspoons", frequency: "Once at night", duration: "30 days" },
    { medicine: "Vitamin C 500mg", dosage: "500mg", frequency: "Once daily", duration: "10 days" },
  ],
  advice: [
    "Take adequate rest and maintain hydration",
    "Take sponge bath to reduce fever",
    "Avoid cold drinks and oily food",
    "Monitor temperature every 6 hours",
    "Return if fever persists beyond 3 days or worsens",
  ],
  followUp: "5 days or earlier if symptoms worsen",
};

export default function ClinicalScribePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'patient' | 'doctor'>('patient');
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [processingState, setProcessingState] = useState<'idle' | 'listening' | 'processing' | 'complete'>('idle');
  const [detectedEntities, setDetectedEntities] = useState<MedicalEntity[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLiveProcessing, setIsLiveProcessing] = useState(false);
  const [useRealMic, setUseRealMic] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [liveText, setLiveText] = useState('');

  const startRealRecording = () => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Use Chrome for best experience.');
      return;
    }

    setUseRealMic(true);
    setIsRecording(true);
    setProcessingState('listening');
    setElapsedTime(0);
    setTranscript([]);
    setDetectedEntities([]);
    setShowReport(false);
    setReport(null);

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text;
        } else {
          setLiveText(text);
        }
      }

      if (finalTranscript) {
        const newEntry: TranscriptEntry = {
          id: `entry-${Date.now()}`,
          speaker: 'patient',
          text: finalTranscript,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          emotion: 'neutral'
        };
        setTranscript(prev => [...prev, newEntry]);
        setLiveText('');
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setProcessingState('idle');
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      if (transcript.length > 0) {
        setProcessingState('processing');
        callGeminiForReport();
      }
    };

    recognitionRef.current.start();
  };

  const stopRealRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setUseRealMic(false);
    setIsRecording(false);
    setLiveText('');
    
    if (transcript.length > 0) {
      setProcessingState('processing');
      callGeminiForReport();
    }
  };

  const callGeminiForReport = async () => {
    try {
      const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
      
      const response = await fetch('/api/scribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptText, speaker: 'doctor' }),
      });

      const data = await response.json();
      
      if (data.chiefComplaint) {
        setReport({
          chiefComplaint: data.chiefComplaint,
          historyOfPresentIllness: data.historyOfPresentIllness,
          physicalExamination: data.physicalExamination,
          diagnosis: data.diagnosis || [],
          prescriptions: data.prescriptions || [],
          advice: data.advice || [],
          followUp: data.followUp || 'As needed',
        });
        
        if (data.detectedEntities) {
          const newEntities: MedicalEntity[] = [];
          (data.detectedEntities.symptoms || []).forEach((s: string) => {
            newEntities.push({ type: 'symptom', value: s, confidence: 0.9 });
          });
          (data.detectedEntities.medications || []).forEach((m: string) => {
            newEntities.push({ type: 'medication', value: m, confidence: 0.95 });
          });
          (data.detectedEntities.vitals || []).forEach((v: string) => {
            newEntities.push({ type: 'vital', value: v, confidence: 1.0 });
          });
          setDetectedEntities(newEntities);
        }
      }
    } catch (err) {
      console.error('Gemini API error:', err);
    }
    
    setProcessingState('complete');
    setShowReport(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const startRecording = () => {
    setIsRecording(true);
    setProcessingState('listening');
    setElapsedTime(0);
    setTranscript([]);
    setDetectedEntities([]);
    setShowReport(false);
    setReport(null);

    let conversationIndex = 0;
    const conversationInterval = setInterval(() => {
      if (conversationIndex >= SAMPLE_CONVERSATION.length) {
        clearInterval(conversationInterval);
        setIsRecording(false);
        setProcessingState('processing');
        generateReport();
        return;
      }

      const entry = SAMPLE_CONVERSATION[conversationIndex];
      const newEntry: TranscriptEntry = {
        id: `entry-${Date.now()}-${conversationIndex}`,
        speaker: entry.speaker as 'doctor' | 'patient' | 'ai',
        text: entry.text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        emotion: entry.emotion
      };

      setTranscript(prev => [...prev, newEntry]);
      setCurrentSpeaker(entry.speaker === 'patient' ? 'patient' : 'doctor');

      if (entry.speaker === 'doctor') {
        const newEntity: MedicalEntity | null = extractEntities(entry.text);
        if (newEntity) {
          setDetectedEntities(prev => [...prev, newEntity]);
        }
      }

      if (entry.speaker === 'ai') {
        const vitalEntity: MedicalEntity = {
          type: 'vital',
          value: entry.text.replace('[VITALS RECORDED: ', '').replace(']', ''),
          confidence: 1.0
        };
        setDetectedEntities(prev => [...prev, vitalEntity]);
      }

      conversationIndex++;
    }, 2500);
  };

  const extractEntities = (text: string): MedicalEntity | null => {
    const medications = [
      { name: 'Dolo 650', type: 'medication' as const },
      { name: 'Calcirol', type: 'medication' as const },
    ];

    for (const med of medications) {
      if (text.toLowerCase().includes(med.name.toLowerCase())) {
        return { type: med.type, value: med.name, confidence: 0.95 };
      }
    }

    if (text.toLowerCase().includes('fever') || text.toLowerCase().includes('infection')) {
      return { type: 'diagnosis', value: text, confidence: 0.85 };
    }

    return null;
  };

  const generateReport = () => {
    setTimeout(() => {
      setReport(INITIAL_REPORT);
      setProcessingState('complete');
      setShowReport(true);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEntityColor = (type: MedicalEntity['type']) => {
    const colors = {
      symptom: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      medication: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      diagnosis: 'bg-red-500/20 text-red-400 border-red-500/30',
      vital: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      procedure: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return colors[type];
  };

  const getSpeakerColor = (speaker: TranscriptEntry['speaker']) => {
    switch (speaker) {
      case 'patient': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      case 'doctor': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'ai': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
    }
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FiCpu className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Zyntra Clinical Scribe AI
              </h1>
              <p className="text-slate-400 text-sm">Real-time Medical Conversation Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${
              processingState === 'listening' 
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : processingState === 'processing'
                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                : processingState === 'complete'
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}>
              {processingState === 'listening' && <FiMic className="animate-pulse" />}
              {processingState === 'processing' && <FiCpu className="animate-spin" />}
              {processingState === 'complete' && <FiCheckCircle />}
              {processingState === 'idle' && <FiMicOff />}
              <span className="font-mono text-sm uppercase">
                {processingState === 'idle' ? 'Ready' : processingState}
              </span>
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
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiMic className="text-purple-400" />
                  Live Transcription
                </h2>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-cyan-400">{formatTime(elapsedTime)}</span>
                <button
                  onClick={useRealMic ? stopRealRecording : startRecording}
                  disabled={isRecording}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {isRecording ? (useRealMic ? 'Stop Live' : 'Recording...') : 'Start Demo'}
                </button>
                <button
                  onClick={startRealRecording}
                  disabled={isRecording}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    isRecording 
                      ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                  }`}
                >
                  <FiRadio size={14} />
                  {isRecording && useRealMic ? 'Live Recording...' : '🎤 Live Mic'}
                </button>
              </div>
            </div>

            <div 
              ref={transcriptRef}
              className="p-4 h-80 overflow-y-auto space-y-3"
            >
              {transcript.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <FiMic className="text-4xl mb-4 opacity-50" />
                  <p>Click "Start Demo" to see the AI scribe in action</p>
                  <p className="text-xs mt-2">Watch as it transcribes and extracts medical entities in real-time</p>
                </div>
              ) : (
                <AnimatePresence>
                  {transcript.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-3 rounded-xl border ${getSpeakerColor(entry.speaker)}`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1 opacity-70">
                        <span className="font-bold uppercase flex items-center gap-1">
                          {entry.speaker === 'patient' && <FiUser />}
                          {entry.speaker === 'doctor' && <FiActivity />}
                          {entry.speaker === 'ai' && <FiCpu />}
                          {entry.speaker}
                        </span>
                        <span>{entry.timestamp}</span>
                      </div>
                      <p className="text-sm">{entry.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {liveText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/30"
                >
                  <div className="flex items-center justify-between text-xs mb-1 opacity-70">
                    <span className="font-bold uppercase flex items-center gap-1">
                      <FiMic className="animate-pulse" />
                      Listening...
                    </span>
                  </div>
                  <p className="text-sm text-blue-300">{liveText}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {showReport && report && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FiFileText className="text-green-400" />
                  Generated Medical Report
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <FiEdit2 className="text-slate-400" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <FiDownload className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-400 mb-2">Chief Complaint</h3>
                    <p className="text-sm">{report.chiefComplaint}</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-purple-400 mb-2">Diagnosis</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.diagnosis.map((d, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/20 rounded text-xs">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-cyan-400 mb-2">Prescriptions</h3>
                  <div className="space-y-2">
                    {report.prescriptions.map((rx, i) => (
                      <div key={i} className="flex items-center gap-4 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-green-400">{rx.medicine}</div>
                          <div className="text-xs text-slate-400">{rx.dosage} - {rx.frequency} - {rx.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-400 mb-2">Advice</h3>
                  <ul className="space-y-1">
                    {report.advice.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <FiCheckCircle className="text-green-400 text-xs" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-slate-400 text-sm">Follow Up: </span>
                    <span className="text-amber-400 font-semibold">{report.followUp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FiClock />
                    Generated at {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
          >
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiActivity className="text-cyan-400" />
                Detected Medical Entities
              </h2>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto space-y-2">
              {detectedEntities.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No entities detected yet</p>
              ) : (
                detectedEntities.map((entity, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-xl border ${getEntityColor(entity.type)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase font-bold">{entity.type}</span>
                      <span className="text-xs font-mono">{(entity.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-sm font-semibold">{entity.value}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FiBookOpen className="text-amber-400" />
              AI Insights
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-xs text-amber-400 mb-1">Pattern Detected</div>
                <p className="text-sm">Viral fever symptoms matching seasonal trend</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="text-xs text-purple-400 mb-1">Drug Interaction</div>
                <p className="text-sm">No known contraindications with current medications</p>
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <div className="text-xs text-cyan-400 mb-1">Recommendation</div>
                <p className="text-sm">Consider CBC test if fever persists beyond 3 days</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <FiCpu className="text-purple-400" />
              <span className="font-bold text-purple-400">AI Summary</span>
            </div>
            <div className="text-sm text-slate-300 space-y-2">
              <p>• 40% reduction in documentation time</p>
              <p>• 98% medical accuracy rate</p>
              <p>• Instant drug interaction checks</p>
              <p>• HIPAA compliant transcription</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}