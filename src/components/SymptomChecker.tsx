'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiActivity, FiSearch, FiAlertCircle, FiCheck, FiArrowRight, FiX, FiThermometer, FiHeart, FiWind, FiEye } from 'react-icons/fi';

interface Symptom {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

interface SymptomResult {
  severity: 'low' | 'medium' | 'high' | 'emergency';
  possible: string[];
  recommendations: string[];
  shouldSeeDoctor: boolean;
  urgencyLevel: number;
}

const SYMPTOMS: Symptom[] = [
  { id: 'fever', name: 'Fever', icon: <FiThermometer />, category: 'General' },
  { id: 'headache', name: 'Headache', icon: <FiActivity />, category: 'Pain' },
  { id: 'cough', name: 'Cough', icon: <FiWind />, category: 'Respiratory' },
  { id: 'chest_pain', name: 'Chest Pain', icon: <FiHeart />, category: 'Emergency' },
  { id: 'fatigue', name: 'Fatigue', icon: <FiActivity />, category: 'General' },
  { id: 'nausea', name: 'Nausea', icon: <FiActivity />, category: 'Digestive' },
  { id: 'breathing', name: 'Shortness of Breath', icon: <FiWind />, category: 'Emergency' },
  { id: 'dizziness', name: 'Dizziness', icon: <FiActivity />, category: 'Neurological' },
  { id: 'sore_throat', name: 'Sore Throat', icon: <FiActivity />, category: 'Throat' },
  { id: 'body_pain', name: 'Body Pain', icon: <FiActivity />, category: 'Pain' },
  { id: 'vomiting', name: 'Vomiting', icon: <FiActivity />, category: 'Digestive' },
  { id: 'diarrhea', name: 'Diarrhea', icon: <FiActivity />, category: 'Digestive' },
  { id: 'rash', name: 'Skin Rash', icon: <FiActivity />, category: 'Skin' },
  { id: 'eye_pain', name: 'Eye Pain', icon: <FiEye />, category: 'Emergency' },
  { id: 'abdominal', name: 'Abdominal Pain', icon: <FiActivity />, category: 'Emergency' },
  { id: 'swelling', name: 'Swelling', icon: <FiActivity />, category: 'General' },
  { id: 'loss_taste', name: 'Loss of Taste/Smell', icon: <FiWind />, category: 'General' },
  { id: 'confusion', name: 'Confusion', icon: <FiActivity />, category: 'Emergency' },
];

const SYMPTOM_MAP: Record<string, SymptomResult> = {
  fever: { severity: 'medium', possible: ['Common Flu', 'Viral Infection', 'COVID-19', 'Typhoid'], recommendations: ['Rest and hydrate', 'Monitor temperature', 'Take paracetamol if needed'], shouldSeeDoctor: false, urgencyLevel: 3 },
  headache: { severity: 'low', possible: ['Tension Headache', 'Migraine', 'Dehydration', 'Lack of Sleep'], recommendations: ['Rest in dark room', 'Stay hydrated', 'Take pain reliever'], shouldSeeDoctor: false, urgencyLevel: 2 },
  cough: { severity: 'low', possible: ['Common Cold', 'Allergies', 'COVID-19', 'Asthma'], recommendations: ['Stay hydrated', 'Use honey for relief', 'Avoid irritants'], shouldSeeDoctor: false, urgencyLevel: 2 },
  chest_pain: { severity: 'high', possible: ['Heart Attack', 'Anxiety', 'Muscle Strain', 'Acid Reflux'], recommendations: ['Call emergency immediately if severe', 'Sit upright', 'Loosen tight clothing'], shouldSeeDoctor: true, urgencyLevel: 9 },
  fatigue: { severity: 'low', possible: ['Lack of Sleep', 'Anemia', 'Depression', 'Thyroid'], recommendations: ['Get adequate sleep', 'Eat iron-rich foods', 'Exercise moderately'], shouldSeeDoctor: false, urgencyLevel: 2 },
  nausea: { severity: 'low', possible: ['Food Poisoning', 'Motion Sickness', 'Pregnancy', 'Migraine'], recommendations: ['Sip clear fluids', 'Eat bland foods', 'Rest'], shouldSeeDoctor: false, urgencyLevel: 2 },
  breathing: { severity: 'emergency', possible: ['Asthma Attack', 'Heart Attack', 'Pulmonary Embolism', 'COVID-19'], recommendations: ['Call emergency immediately', 'Sit upright', 'Use rescue inhaler if available'], shouldSeeDoctor: true, urgencyLevel: 10 },
  dizziness: { severity: 'medium', possible: ['Low Blood Pressure', 'Dehydration', 'Inner Ear Issue', 'Medication Side Effect'], recommendations: ['Sit or lie down', 'Avoid sudden movements', 'Stay hydrated'], shouldSeeDoctor: true, urgencyLevel: 4 },
  sore_throat: { severity: 'low', possible: ['Viral Infection', 'Strep Throat', 'Allergies', 'GERD'], recommendations: ['Gargle warm salt water', 'Stay hydrated', 'Use throat lozenges'], shouldSeeDoctor: false, urgencyLevel: 2 },
  body_pain: { severity: 'low', possible: ['Viral Infection', 'Flu', 'Muscle Strain', 'Fibromyalgia'], recommendations: ['Rest', 'Take pain reliever', 'Apply heat/cold'], shouldSeeDoctor: false, urgencyLevel: 2 },
  vomiting: { severity: 'medium', possible: ['Food Poisoning', 'Stomach Flu', 'Migraine', 'Pregnancy'], recommendations: ['Sip fluids slowly', 'Eat bland diet', 'Rest'], shouldSeeDoctor: true, urgencyLevel: 4 },
  diarrhea: { severity: 'low', possible: ['Food Poisoning', 'Viral Infection', 'IBS', 'Medication'], recommendations: ['Stay hydrated', 'BRAT diet', 'Avoid dairy'], shouldSeeDoctor: true, urgencyLevel: 3 },
  rash: { severity: 'medium', possible: ['Allergic Reaction', 'Eczema', 'Infection', 'Heat Rash'], recommendations: ['Avoid scratching', 'Apply calamine', 'Identify trigger'], shouldSeeDoctor: true, urgencyLevel: 4 },
  eye_pain: { severity: 'high', possible: ['Glaucoma', 'Corneal Abrasion', 'Infection', 'Foreign Body'], recommendations: ['Do not rub eye', 'Avoid touching', 'See doctor immediately'], shouldSeeDoctor: true, urgencyLevel: 8 },
  abdominal: { severity: 'high', possible: ['Appendicitis', 'Gallstones', 'Kidney Stone', 'Gas'], recommendations: ['Avoid food if severe', 'Note location of pain', 'See doctor if persistent'], shouldSeeDoctor: true, urgencyLevel: 8 },
  swelling: { severity: 'medium', possible: ['Allergic Reaction', 'Injury', 'Infection', 'Heart/Kidney Disease'], recommendations: ['Elevate affected area', 'Apply cold compress', 'Monitor'], shouldSeeDoctor: true, urgencyLevel: 5 },
  loss_taste: { severity: 'medium', possible: ['COVID-19', 'Sinus Infection', 'Nasal Polyp', 'Medication'], recommendations: ['Monitor for other symptoms', 'Practice oral hygiene', 'Use saline spray'], shouldSeeDoctor: true, urgencyLevel: 4 },
  confusion: { severity: 'emergency', possible: ['Stroke', 'Low Blood Sugar', 'Severe Infection', 'Head Injury'], recommendations: ['Call emergency immediately', 'Check blood sugar if diabetic', 'Note time of onset'], shouldSeeDoctor: true, urgencyLevel: 10 },
};

const EMERGENCY_KEYWORDS = ['chest_pain', 'breathing', 'confusion', 'eye_pain', 'abdominal'];

export default function SymptomChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const filteredSymptoms = SYMPTOMS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return;

    let highestSeverity: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    let highestUrgency = 0;
    const allPossible = new Set<string>();
    const allRecommendations = new Set<string>();
    let shouldSeeDoctor = false;

    selectedSymptoms.forEach(symptomId => {
      const symptomResult = SYMPTOM_MAP[symptomId];
      if (symptomResult) {
        if (symptomResult.urgencyLevel > highestUrgency) {
          highestUrgency = symptomResult.urgencyLevel;
          highestSeverity = symptomResult.severity;
        }
        symptomResult.possible.forEach(p => allPossible.add(p));
        symptomResult.recommendations.forEach(r => allRecommendations.add(r));
        if (symptomResult.shouldSeeDoctor) shouldSeeDoctor = true;
      }
    });

    setResult({
      severity: highestSeverity,
      possible: Array.from(allPossible).slice(0, 4),
      recommendations: Array.from(allRecommendations).slice(0, 5),
      shouldSeeDoctor,
      urgencyLevel: highestUrgency,
    });
    setShowResult(true);
  };

  const reset = () => {
    setSelectedSymptoms([]);
    setResult(null);
    setShowResult(false);
    setSearchQuery('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'text-red-500 bg-red-500/20 border-red-500';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500';
      default: return 'text-green-500 bg-green-500/20 border-green-500';
    }
  };

  return (
    <>
      {/* Symptom Checker Button — compact on mobile */}
      <motion.button
        initial={{ scale: 1, transform: 'none' }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[30px] left-2 md:left-6 z-[9997] flex flex-col items-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-lg opacity-50" />
          <div className="relative w-12 h-12 md:w-[70px] md:h-[70px] bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-xl border-2 md:border-4 border-white">
            <FiActivity className="text-white text-lg md:text-3xl" />
          </div>
        </div>
        <span className="text-[8px] md:text-[9px] font-bold text-white mt-1 drop-shadow-lg bg-teal-500/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">Check</span>
      </motion.button>

      {/* Symptom Checker Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && !showResult && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FiActivity className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">AI Symptom Checker</h2>
                      <p className="text-teal-100 text-xs">Select your symptoms for guidance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsOpen(false); reset(); }}
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {!showResult ? (
                <>
                  {/* Search */}
                  <div className="p-4 border-b border-white/10">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search symptoms..."
                        className="w-full bg-white/10 text-white border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  {/* Selected Symptoms */}
                  {selectedSymptoms.length > 0 && (
                    <div className="px-4 py-2 bg-teal-500/10 border-b border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-teal-400 text-xs font-semibold">{selectedSymptoms.length} selected</span>
                        <button onClick={() => setSelectedSymptoms([])} className="text-xs text-gray-400 hover:text-white">
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedSymptoms.map(id => {
                          const symptom = SYMPTOMS.find(s => s.id === id);
                          return (
                            <span
                              key={id}
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                EMERGENCY_KEYWORDS.includes(id) 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-teal-500/20 text-teal-400'
                              }`}
                            >
                              {symptom?.name}
                              <button onClick={() => toggleSymptom(id)}><FiX size={12} /></button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Symptom Grid */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {filteredSymptoms.map(symptom => (
                        <motion.button
                          key={symptom.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`p-3 rounded-xl border text-left transition ${
                            selectedSymptoms.includes(symptom.id)
                              ? 'bg-teal-500/20 border-teal-500 text-white'
                              : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                          } ${EMERGENCY_KEYWORDS.includes(symptom.id) && selectedSymptoms.includes(symptom.id) ? 'border-red-500 bg-red-500/20' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`${selectedSymptoms.includes(symptom.id) ? 'text-teal-400' : 'text-gray-400'}`}>
                              {symptom.icon}
                            </span>
                            <span className="text-sm font-medium">{symptom.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-500">{symptom.category}</span>
                          {EMERGENCY_KEYWORDS.includes(symptom.id) && (
                            <span className="text-[10px] text-red-400 font-semibold ml-2">⚠️ Critical</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <div className="p-4 border-t border-white/10">
                    <button
                      onClick={analyzeSymptoms}
                      disabled={selectedSymptoms.length === 0}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Analyze Symptoms <FiArrowRight />
                    </button>
                    <p className="text-gray-500 text-xs text-center mt-2">
                      This is for guidance only. Always consult a doctor.
                    </p>
                  </div>
                </>
              ) : (
                /* Results */
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {result && (
                    <>
                      {/* Severity Badge */}
                      <div className={`text-center py-4 rounded-2xl border ${getSeverityColor(result.severity)}`}>
                        <p className="text-4xl font-black mb-1">
                          {result.severity === 'emergency' ? '🚨' : 
                           result.severity === 'high' ? '⚠️' : 
                           result.severity === 'medium' ? '⚡' : '✅'}
                        </p>
                        <p className="font-bold text-lg capitalize">{result.severity} Severity</p>
                        <p className="text-sm opacity-70">Urgency: {result.urgencyLevel}/10</p>
                      </div>

                      {/* Emergency Warning */}
                      {(result.severity === 'emergency' || result.severity === 'high') && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                          <p className="text-red-400 font-bold flex items-center gap-2">
                            <FiAlertCircle /> {result.severity === 'emergency' ? 'Seek Emergency Care Now!' : 'Consult Doctor Soon'}
                          </p>
                          <p className="text-red-300/70 text-sm mt-1">
                            Based on your symptoms, we recommend seeing a doctor immediately.
                          </p>
                        </div>
                      )}

                      {/* Possible Conditions */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Possible Conditions</h4>
                        <div className="space-y-1">
                          {result.possible.map((condition, i) => (
                            <p key={i} className="text-gray-300 text-sm flex items-center gap-2">
                              <FiActivity size={14} className="text-teal-400" /> {condition}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-white font-bold mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {result.recommendations.map((rec, i) => (
                            <p key={i} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-teal-400 font-bold">{i + 1}.</span> {rec}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                        <p className="text-yellow-400/80 text-xs">
                          ⚠️ This is an AI-powered preliminary assessment only. It should not replace professional medical advice. In case of emergency, call emergency services immediately.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={reset}
                          className="flex-1 py-3 bg-white/10 text-white font-semibold rounded-xl"
                        >
                          Check Again
                        </button>
                        <a
                          href="tel:102"
                          className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-center"
                        >
                          Call Emergency
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
