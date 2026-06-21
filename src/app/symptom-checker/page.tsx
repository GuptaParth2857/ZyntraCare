'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiInfo, FiActivity } from 'react-icons/fi';
import { FaStethoscope, FaHeartbeat, FaBrain, FaThermometerHalf, FaUserMd } from 'react-icons/fa';

interface AnalysisResult {
  causes: string[];
  whenToSeeDoctor: string[];
  precautions: string[];
  severity: 'low' | 'moderate' | 'high';
  emergency: boolean;
}

const HINDI_MAP: Record<string, string> = {
  bukhar: 'fever',
  fever: 'fever',
  garmi: 'fever',
  sardard: 'headache',
  headache: 'headache',
  khansi: 'cough',
  cough: 'cough',
  jukham: 'cold',
  cold: 'cold',
  gala: 'sore throat',
  'gala mein dard': 'sore throat',
  'gala kharaab': 'sore throat',
  'sore throat': 'sore throat',
  pet: 'stomach pain',
  'pet mein dard': 'stomach pain',
  'pet dard': 'stomach pain',
  'stomach pain': 'stomach pain',
  dard: 'pain',
  pain: 'pain',
  kamzor: 'weakness',
  weakness: 'weakness',
  thakan: 'fatigue',
  fatigue: 'fatigue',
  chakkar: 'dizziness',
  dizziness: 'dizziness',
  jee: 'nausea',
  nausea: 'nausea',
  ulti: 'vomiting',
  vomiting: 'vomiting',
  diarrhoea: 'diarrhea',
  diarrhea: 'diarrhea',
  dast: 'diarrhea',
  saans: 'shortness of breath',
  'saans mein takleef': 'shortness of breath',
  'shortness of breath': 'shortness of breath',
  'chest pain': 'chest pain',
  'seene mein dard': 'chest pain',
  seena: 'chest pain',
  bukhaar: 'fever',
  kharish: 'rash',
  rash: 'rash',
  jor: 'joint pain',
  'jor dard': 'joint pain',
  'joint pain': 'joint pain',
  badan: 'body pain',
  'badan dard': 'body pain',
  'body pain': 'body pain',
  'body ache': 'body pain',
  aankh: 'eye strain',
  'aankh mein jalan': 'eye strain',
  'eye strain': 'eye strain',
  neend: 'insomnia',
  insomnia: 'insomnia',
  bhook: 'loss of appetite',
  'loss of appetite': 'loss of appetite',
  weight: 'weight loss',
  'weight loss': 'weight loss',
  sugar: 'high blood sugar',
  'high blood pressure': 'high blood pressure',
  'blood pressure': 'high blood pressure',
  bp: 'high blood pressure',
};

interface SymptomRule {
  keywords: string[];
  causes: string[];
  whenToSeeDoctor: string[];
  precautions: string[];
  severity: 'low' | 'moderate' | 'high';
  emergency: boolean;
}

const SYMPTOM_RULES: SymptomRule[] = [
  {
    keywords: ['chest pain', 'shortness of breath', 'saans'],
    causes: ['Heart attack or angina', 'Pulmonary embolism', 'Severe anxiety or panic attack'],
    whenToSeeDoctor: ['IMMEDIATE EMERGENCY — Call 108 or go to the nearest hospital'],
    precautions: ['Do not wait. Call emergency services immediately.', 'Sit down and stay calm while waiting for help.', 'If prescribed, take aspirin or nitroglycerin as directed.'],
    severity: 'high',
    emergency: true,
  },
  {
    keywords: ['fever', 'headache', 'badan', 'body pain', 'thakan', 'fatigue'],
    causes: ['Viral fever / Common flu', 'Dengue fever', 'Malaria', 'COVID-19'],
    whenToSeeDoctor: ['Fever above 103°F (39.4°C)', 'Fever lasting more than 3 days', 'Severe headache with fever', 'Rash appearing with fever'],
    precautions: ['Take paracetamol for fever', 'Drink plenty of fluids (ORS, coconut water, soup)', 'Complete bed rest', 'Monitor temperature every 4-6 hours', 'Use a cold compress on forehead'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['headache', 'aankh', 'eye strain'],
    causes: ['Digital eye strain / Screen fatigue', 'Tension headache', 'Need for vision correction'],
    whenToSeeDoctor: ['Headache is severe or persistent', 'Vision changes or blurred vision', 'Headache accompanied by neck stiffness'],
    precautions: ['Follow the 20-20-20 rule: every 20 min, look 20 feet away for 20 sec', 'Reduce screen brightness and use blue light filters', 'Blink frequently and use lubricating eye drops', 'Ensure proper lighting while working'],
    severity: 'low',
    emergency: false,
  },
  {
    keywords: ['stomach pain', 'pet', 'nausea', 'jee', 'ulti', 'vomiting', 'diarrhea', 'dast'],
    causes: ['Food poisoning', 'Indigestion / Gastritis', 'Viral gastroenteritis (stomach flu)', 'Irritable bowel syndrome (IBS)'],
    whenToSeeDoctor: ['Severe abdominal pain', 'Blood in vomit or stool', 'Dehydration symptoms (dry mouth, no urine for 8 hours)', 'Symptoms lasting more than 2 days'],
    precautions: ['Sip ORS or clear fluids slowly throughout the day', 'Avoid solid food until vomiting stops', 'Follow BRAT diet (Banana, Rice, Apple sauce, Toast)', 'Avoid spicy, oily, or dairy foods', 'Rest your digestive system'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['body pain', 'badan dard', 'fatigue', 'thakan', 'kamzor', 'weakness'],
    causes: ['Viral infection (flu / cold)', 'Post-viral fatigue syndrome', 'Anemia', 'Vitamin D or B12 deficiency'],
    whenToSeeDoctor: ['Extreme fatigue lasting more than 2 weeks', 'Unexplained weight loss', 'Pale skin or shortness of breath on mild exertion'],
    precautions: ['Take adequate rest and sleep 7-8 hours', 'Eat iron-rich foods (spinach, lentils, red meat)', 'Stay hydrated with water and fresh juices', 'Gentle stretching or walking as tolerated'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['sore throat', 'gala', 'cough', 'khansi', 'cold', 'zukham', 'jukham'],
    causes: ['Common cold', 'Influenza (flu)', 'Tonsillitis / Pharyngitis', 'Allergic rhinitis'],
    whenToSeeDoctor: ['Sore throat lasting more than 1 week', 'Difficulty swallowing or breathing', 'High fever with sore throat', 'White patches on tonsils'],
    precautions: ['Gargle with warm salt water (1 tsp salt in 1 cup water)', 'Drink warm fluids (ginger tea, honey lemon water)', 'Steam inhalation 2-3 times a day', 'Take lozenges or honey for soothing', 'Rest your voice'],
    severity: 'low',
    emergency: false,
  },
  {
    keywords: ['dizziness', 'chakkar', 'weakness', 'kamzor', 'fatigue', 'thakan'],
    causes: ['Anemia (low hemoglobin)', 'Low blood pressure (hypotension)', 'Dehydration', 'Inner ear issues (vertigo)'],
    whenToSeeDoctor: ['Frequent fainting or near-fainting', 'Dizziness after head injury', 'Dizziness with chest pain or palpitations', 'Persistent vertigo'],
    precautions: ['Sit or lie down immediately when dizzy', 'Drink water or ORS slowly', 'Avoid sudden standing up', 'Eat regular meals to maintain blood sugar', 'Increase iron and salt intake (if BP is low, consult doctor first)'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['fever', 'cold', 'jukham', 'khansi', 'cough', 'gala', 'sore throat'],
    causes: ['Common cold with fever', 'Seasonal flu', 'Sinusitis'],
    whenToSeeDoctor: ['Fever over 101°F for more than 2 days', 'Yellow/green nasal discharge with facial pain', 'Difficulty breathing'],
    precautions: ['Steam inhalation 3 times daily', 'Drink warm turmeric milk at night', 'Use saline nasal spray for congestion', 'Take vitamin C supplements or eat citrus fruits', 'Keep your head elevated while sleeping'],
    severity: 'low',
    emergency: false,
  },
  {
    keywords: ['joint pain', 'jor dard', 'body pain', 'badan dard', 'fever', 'bukhar'],
    causes: ['Viral arthritis', 'Dengue fever', 'Chikungunya', 'Rheumatic fever'],
    whenToSeeDoctor: ['Joint swelling or redness', 'Joint pain with high fever', 'Pain makes it impossible to move joint'],
    precautions: ['Take anti-inflammatory medication (ibuprofen) after food', 'Apply ice packs to swollen joints for 15 min', 'Rest the affected joints', 'Keep joints elevated to reduce swelling', 'Drink plenty of fluids'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['rash', 'kharish', 'fever', 'bukhar', 'itching'],
    causes: ['Allergic reaction', 'Viral exanthem (measles, rubella)', 'Dengue fever', 'Chickenpox / Shingles'],
    whenToSeeDoctor: ['Rash is widespread or painful', 'Rash with high fever', 'Rash with difficulty breathing', 'Blisters or open sores'],
    precautions: ['Do NOT scratch — keep nails trimmed', 'Apply calamine lotion for itching', 'Take antihistamine if allergic reaction suspected', 'Keep the area clean and dry', 'Wear loose, cotton clothing'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['high blood pressure', 'bp', 'dizziness', 'chakkar', 'headache', 'sardard'],
    causes: ['Hypertension (high blood pressure)', 'Stress or anxiety', 'Kidney problems', 'Side effects of medication'],
    whenToSeeDoctor: ['BP reading above 180/120 mmHg', 'Severe headache with high BP', 'Chest pain or shortness of breath with high BP'],
    precautions: ['Reduce salt intake immediately', 'Practice deep breathing for 5 minutes', 'Avoid caffeine and alcohol', 'Monitor BP twice daily at same times', 'Maintain a healthy weight and exercise regularly'],
    severity: 'high',
    emergency: false,
  },
  {
    keywords: ['high blood sugar', 'sugar', 'weight loss', 'bhook', 'loss of appetite', 'weakness', 'kamzor', 'thirst'],
    causes: ['Uncontrolled diabetes', 'Prediabetes', 'Metabolic syndrome'],
    whenToSeeDoctor: ['Blood sugar above 300 mg/dL', 'Frequent urination with excessive thirst', 'Unexplained weight loss', 'Slow-healing wounds'],
    precautions: ['Monitor blood sugar levels regularly', 'Avoid sugary drinks and refined carbs', 'Eat small, frequent meals with fiber and protein', 'Stay hydrated with water only', 'Exercise for 30 minutes daily (walking is best)'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['insomnia', 'neend', 'headache', 'sardard', 'fatigue', 'thakan'],
    causes: ['Sleep disorders (insomnia)', 'Stress and anxiety', 'Depression', 'Poor sleep hygiene'],
    whenToSeeDoctor: ['Unable to sleep for more than 3 weeks', 'Sleep problems affecting daily function', 'Morning headaches or extreme daytime sleepiness'],
    precautions: ['Maintain a fixed sleep schedule (even on weekends)', 'Avoid screens 1 hour before bed', 'Reduce caffeine after 2 PM', 'Try relaxation techniques (deep breathing, meditation)', 'Keep bedroom dark, quiet, and cool'],
    severity: 'low',
    emergency: false,
  },
  {
    keywords: ['fever', 'bukhar', 'chest pain', 'seena', 'cough', 'khansi', 'shortness of breath', 'saans'],
    causes: ['Pneumonia', 'Bronchitis', 'COVID-19', 'Pleurisy'],
    whenToSeeDoctor: ['Difficulty breathing or rapid breathing', 'Chest pain when coughing or breathing deeply', 'Coughing up blood', 'High fever with chills and shaking'],
    precautions: ['Take prescribed antibiotics if bacterial', 'Use a humidifier or steam inhalation', 'Sleep in a semi-upright position for easier breathing', 'Stay hydrated — warm liquids help loosen mucus', 'Do NOT smoke or vape'],
    severity: 'high',
    emergency: false,
  },
  {
    keywords: ['fever', 'bukhar', 'chills', 'body pain', 'badan dard', 'headache', 'sardard', 'fatigue', 'thakan'],
    causes: ['Malaria', 'Dengue fever', 'Typhoid', 'Severe viral infection'],
    whenToSeeDoctor: ['High fever with chills (alternating fever/cold)', 'Fever with severe headache and body pain', 'Nosebleed or gum bleeding with fever', 'Fever not responding to medication'],
    precautions: ['Get tested for malaria/dengue immediately', 'Complete bed rest in a mosquito-free environment', 'Take acetaminophen for fever (avoid aspirin)', 'Drink ORS, coconut water, and soups', 'Monitor platelet count if dengue suspected'],
    severity: 'high',
    emergency: false,
  },
  {
    keywords: ['stomach pain', 'pet dard', 'pet', 'heartburn', 'acid'],
    causes: ['Acid reflux (GERD)', 'Gastritis', 'Peptic ulcer', 'Hiatal hernia'],
    whenToSeeDoctor: ['Frequent heartburn more than 2 times per week', 'Blood in stool or black/tarry stool', 'Unexplained weight loss with stomach pain'],
    precautions: ['Eat small meals — avoid overeating', 'Do not lie down for 2 hours after eating', 'Avoid spicy, fried, and acidic foods', 'Elevate head of bed by 6-8 inches', 'Chew food slowly and thoroughly'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['shortness of breath', 'saans', 'cough', 'khansi', 'wheezing', 'chest tightness'],
    causes: ['Asthma', 'Allergic reaction', 'COPD', 'Bronchitis'],
    whenToSeeDoctor: ['Sudden severe shortness of breath', 'Wheezing that does not respond to inhaler', 'Blue lips or fingertips', 'Unable to speak in full sentences'],
    precautions: ['Sit upright — do not lie down', 'Use rescue inhaler if prescribed', 'Practice pursed-lip breathing', 'Remove yourself from potential allergens', 'Stay calm — anxiety worsens breathlessness'],
    severity: 'high',
    emergency: true,
  },
  {
    keywords: ['fever', 'bukhar', 'body pain', 'badan dard', 'rash', 'kharish', 'headache', 'sardard', 'joint pain', 'jor dard'],
    causes: ['Dengue fever', 'Chikungunya', 'Zika virus', 'Viral hemorrhagic fever'],
    whenToSeeDoctor: ['Sudden high fever with severe body pain', 'Rash appearing after fever', 'Bleeding from nose or gums', 'Severe abdominal pain or persistent vomiting'],
    precautions: ['Do NOT take aspirin or ibuprofen (risk of bleeding)', 'Take paracetamol only for fever', 'Drink plenty of ORS and fluids', 'Get a CBC blood test for platelet count', 'Use mosquito repellent and nets'],
    severity: 'high',
    emergency: false,
  },
  {
    keywords: ['ear pain', 'kann dard', 'fever', 'bukhar'],
    causes: ['Ear infection (otitis media)', 'Swimmer\'s ear', 'Eustachian tube blockage', 'Foreign object in ear'],
    whenToSeeDoctor: ['Ear pain with fever', 'Fluid or pus draining from ear', 'Hearing loss', 'Pain lasting more than 2 days'],
    precautions: ['Apply a warm compress to the affected ear', 'Keep ear dry — avoid swimming', 'Do NOT insert anything into the ear', 'Sleep with affected ear facing up', 'Take pain reliever if needed'],
    severity: 'moderate',
    emergency: false,
  },
  {
    keywords: ['back pain', 'kamari dard', 'pain', 'dard'],
    causes: ['Muscle strain or sprain', 'Herniated disc', 'Sciatica', 'Poor posture'],
    whenToSeeDoctor: ['Back pain after a fall or injury', 'Pain radiating down leg with numbness', 'Loss of bladder or bowel control', 'Pain with fever or unexplained weight loss'],
    precautions: ['Apply ice for first 48 hours, then heat', 'Avoid heavy lifting and twisting', 'Sleep on a firm mattress with a pillow under knees', 'Gentle stretching (cat-cow, child\'s pose)', 'Maintain good posture while sitting'],
    severity: 'low',
    emergency: false,
  },
  {
    keywords: ['anxiety', 'tension', 'stress', 'heart palpitations', 'dizziness', 'chakkar', 'chest tightness'],
    causes: ['Generalized anxiety disorder', 'Panic attack', 'Stress-related physical symptoms'],
    whenToSeeDoctor: ['Panic attacks occurring frequently', 'Anxiety interfering with daily life', 'Chest pain or palpitations with anxiety', 'Thoughts of self-harm'],
    precautions: ['Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s', 'Ground yourself using 5-4-3-2-1 technique', 'Limit caffeine and alcohol', 'Exercise daily — even 15 min walk helps', 'Talk to a friend or mental health professional'],
    severity: 'moderate',
    emergency: false,
  },
];

function normalizeText(input: string): string {
  const lower = input.toLowerCase().trim();
  const words = lower.split(/\s+/);
  const normalized = words.map(w => HINDI_MAP[w] || w).join(' ');
  return normalized;
}

function analyzeSymptoms(input: string): AnalysisResult | null {
  const normalized = normalizeText(input);
  if (!normalized) return null;

  let matchedRule: SymptomRule | null = null;
  let bestMatchCount = 0;

  for (const rule of SYMPTOM_RULES) {
    const matchCount = rule.keywords.filter(kw => normalized.includes(kw)).length;
    if (matchCount > bestMatchCount) {
      bestMatchCount = matchCount;
      matchedRule = rule;
    }
  }

  if (!matchedRule || bestMatchCount === 0) {
    return null;
  }

  return {
    causes: matchedRule.causes,
    whenToSeeDoctor: matchedRule.whenToSeeDoctor,
    precautions: matchedRule.precautions,
    severity: matchedRule.severity,
    emergency: matchedRule.emergency,
  };
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-green-500/20 text-green-400 border-green-500/30';
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'high': return <FaHeartbeat className="text-red-400" />;
    case 'moderate': return <FiAlertCircle className="text-yellow-400" />;
    default: return <FiCheckCircle className="text-green-400" />;
  }
}

const QUICK_SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Cold', 'Sore throat', 'Body pain',
  'Fatigue', 'Stomach pain', 'Nausea', 'Dizziness', 'Chest pain',
  'Shortness of breath', 'Joint pain', 'Rash', 'Back pain', 'Ear pain',
];

export default function SymptomCheckerPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [noMatch, setNoMatch] = useState(false);

  const handleAnalyze = async (text?: string) => {
    const symptomText = (text || input).trim();
    if (!symptomText) return;

    setLoading(true);
    setResult(null);
    setNoMatch(false);

    await new Promise(resolve => setTimeout(resolve, 800));

    const analysis = analyzeSymptoms(symptomText);
    if (analysis) {
      setResult(analysis);
    } else {
      setNoMatch(true);
    }
    setLoading(false);
  };

  const handleQuickSymptom = (symptom: string) => {
    setInput(prev => (prev ? `${prev}, ${symptom}` : symptom));
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-teal-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl mb-6">
            <FaStethoscope size={32} className="text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              AI Symptom
            </span>
            {' '}Checker
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Describe your symptoms in English or Hindi, and get an instant AI-powered analysis.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4"
          >
            <div className="flex flex-wrap gap-2 mb-2">
              {QUICK_SYMPTOMS.map(s => (
                <button
                  key={s}
                  onClick={() => handleQuickSymptom(s)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="e.g. Mujhe fever aur headache hai / I have chest pain and shortness of breath"
                className="w-full pl-12 pr-4 py-4 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition text-sm"
              />
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={loading || !input.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-2xl font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed transition hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing your symptoms...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiActivity size={18} /> Check Symptoms
                </span>
              )}
            </button>
          </motion.div>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-700/50 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                      <div className="h-3 bg-slate-700/30 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {noMatch && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/60 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FiInfo className="text-yellow-400" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-yellow-300">Could Not Identify Symptoms</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Please try describing your symptoms more specifically. Include words like fever, headache, cough, pain, etc.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Mujhe bukhar hai', 'Pet mein dard hai', 'Chest pain and cough', 'Headache and eye strain'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => { setInput(ex); handleAnalyze(ex); }}
                        className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-blue-500/30 transition"
                      >
                        Try "{ex}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {result.emergency && (
                <div className="bg-red-500/10 border border-red-500/40 rounded-3xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaHeartbeat className="text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-red-400 mb-1">⚠️ Possible Emergency</h3>
                    <p className="text-red-300/80 text-sm">
                      Your symptoms may indicate a serious condition. Please seek immediate medical attention.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${getSeverityColor(result.severity)}`}>
                    {getSeverityIcon(result.severity)}
                    {result.severity.toUpperCase()} SEVERITY
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <FaBrain className="text-blue-400" /> Possible Causes
                    </h3>
                    <ul className="space-y-2">
                      {result.causes.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <FiAlertCircle className="text-yellow-400" /> When to See a Doctor
                    </h3>
                    <ul className="space-y-2">
                      {result.whenToSeeDoctor.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-yellow-200/80">
                          <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={16} />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <FaUserMd className="text-teal-400" /> Basic Precautions & Home Remedies
                    </h3>
                    <ul className="space-y-2">
                      {result.precautions.map((precaution, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <FiCheckCircle className="text-teal-400 mt-0.5 flex-shrink-0" size={16} />
                          {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                <FiInfo size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300 text-xs">
                  This is an AI-powered screening tool for informational purposes only and does NOT replace professional medical advice.
                  Always consult a qualified healthcare provider for proper diagnosis and treatment.
                  If you have a medical emergency, call 108 immediately.
                </p>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4 mt-8"
          >
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                <FaThermometerHalf className="text-blue-400" size={20} />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Hindi & English</h3>
              <p className="text-gray-500 text-xs">Type symptoms in Hindi or English — our system understands both.</p>
            </div>
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mb-3">
                <FaBrain className="text-teal-400" size={20} />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Smart Analysis</h3>
              <p className="text-gray-500 text-xs">20+ condition profiles matched against your symptom combination.</p>
            </div>
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mb-3">
                <FaUserMd className="text-green-400" size={20} />
              </div>
              <h3 className="font-bold text-sm text-white mb-1">Actionable Advice</h3>
              <p className="text-gray-500 text-xs">Get precautions, home remedies, and clear guidance on when to see a doctor.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
