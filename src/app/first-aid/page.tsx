'use client';

import { useState } from 'react';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaFirstAid, FaHeartbeat, FaUserInjured, FaCarCrash, FaFire, FaBolt } from 'react-icons/fa';

interface FirstAidStep {
  step: number;
  title: string;
  description: string;
  warning?: string;
}

interface FirstAidGuide {
  id: string;
  title: string;
  category: string;
  icon: any;
  severity: 'emergency' | 'urgent' | 'general';
  steps: FirstAidStep[];
  whenToCallDoctor: string[];
}

const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'choking',
    title: 'Choking',
    category: 'Breathing',
    icon: <FaUserInjured />,
    severity: 'emergency',
    steps: [
      { step: 1, title: 'Assess the Situation', description: 'Ask "Are you choking?" If they cannot speak, cough, or breathe, act immediately.' },
      { step: 2, title: 'Call for Help', description: 'Call emergency services or ask someone to call while you assist.' },
      { step: 3, title: 'Back Blows', description: 'Stand behind the person, give 5 back blows between shoulder blades using heel of hand.' },
      { step: 4, title: 'Abdominal Thrusts', description: 'Place fist above navel, grasp with other hand, perform 5 upward thrusts (Heimlich maneuver).' },
      { step: 5, title: 'Repeat', description: 'Alternate between 5 back blows and 5 abdominal thrusts until object is expelled or person becomes unconscious.' },
    ],
    whenToCallDoctor: ['Person becomes unconscious', 'Object is not expelled', 'Difficulty breathing continues after']
  },
  {
    id: 'bleeding',
    title: 'Heavy Bleeding',
    category: 'Injury',
    icon: <FaFirstAid />,
    severity: 'emergency',
    steps: [
      { step: 1, title: 'Apply Direct Pressure', description: 'Use clean cloth or gauze, press firmly on the wound.' },
      { step: 2, title: 'Elevate', description: 'If possible, raise the injured area above the heart level.' },
      { step: 3, title: 'Do Not Remove', description: 'If blood soaks through, add more layers - do not remove the first layer.' },
      { step: 4, title: 'Apply Bandage', description: 'Once bleeding slows, wrap firmly but not too tight.' },
      { step: 5, title: 'Monitor for Shock', description: 'Watch for pale skin, rapid breathing, confusion - keep person warm and calm.' },
    ],
    whenToCallDoctor: ['Bleeding does not stop after 10 minutes', 'Deep wounds', 'Bleeding from arteries (spurting)']
  },
  {
    id: 'burns',
    title: 'Burns',
    category: 'Injury',
    icon: <FaFire />,
    severity: 'urgent',
    steps: [
      { step: 1, title: 'Cool the Burn', description: 'Run cool (not cold) water over burn for 10-20 minutes.' },
      { step: 2, title: 'Remove Constrictions', description: 'Remove rings, watches, or tight clothing before swelling.' },
      { step: 3, title: 'Cover', description: 'Cover with sterile, non-stick bandage or clean cloth.' },
      { step: 4, title: 'Pain Relief', description: 'Take over-the-counter pain medication if needed.' },
      { step: 5, title: 'Do NOT', description: 'Do not apply ice, butter, toothpaste, or any ointment.' },
    ],
    whenToCallDoctor: ['Burns on face, hands, feet, or joints', 'Burns larger than 3 inches', 'Chemical or electrical burns']
  },
  {
    id: 'cpr',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    category: 'Heart',
    icon: <FaHeartbeat />,
    severity: 'emergency',
    steps: [
      { step: 1, title: 'Check Response', description: 'Tap shoulders and shout "Are you okay?" Check for normal breathing.' },
      { step: 2, title: 'Call Emergency', description: 'Call 102 or ask someone to call. Get AED if available.' },
      { step: 3, title: 'Position', description: 'Place person on back on firm surface. Kneel beside chest.' },
      { step: 4, title: 'Chest Compressions', description: 'Place hands on center of chest, compress 2 inches deep, 100-120 per minute.' },
      { step: 5, title: 'Rescue Breaths (Optional)', description: 'For trained: Give 2 breaths after every 30 compressions. Continue until help arrives.' },
    ],
    whenToCallDoctor: ['Call immediately - CPR is emergency response']
  },
  {
    id: 'fracture',
    title: 'Broken Bone/Fracture',
    category: 'Injury',
    icon: <FaUserInjured />,
    severity: 'urgent',
    steps: [
      { step: 1, title: 'Do Not Move', description: 'Do not try to move or straighten the injured area.' },
      { step: 2, title: 'Immobilize', description: 'Use splint or padding to keep the injured area still.' },
      { step: 3, title: 'Apply Ice', description: 'Wrap ice in cloth, apply for 15-20 minutes to reduce swelling.' },
      { step: 4, title: 'Elevate', description: 'If possible, raise the injured area above heart level.' },
      { step: 5, title: 'Pain Management', description: 'Give over-the-counter pain relievers. Do not give alcohol.' },
    ],
    whenToCallDoctor: ['Bone is visibly broken through skin', 'Injured area is numb', 'Cannot move the limb']
  },
  {
    id: 'electric-shock',
    title: 'Electric Shock',
    category: 'Emergency',
    icon: <FaBolt />,
    severity: 'emergency',
    steps: [
      { step: 1, title: 'Do NOT Touch', description: 'Do not touch the person until the power source is turned off.' },
      { step: 2, title: 'Turn Off Power', description: 'Unplug the appliance or turn off the main power switch.' },
      { step: 3, title: 'Separate from Source', description: 'Use non-conductive object (wood, rubber) to separate person from source.' },
      { step: 4, title: 'Check Breathing', description: 'If not breathing, begin CPR immediately.' },
      { step: 5, title: 'Treat Burns', description: 'Cover any electrical burns with clean, non-stick bandage.' },
    ],
    whenToCallDoctor: ['Always call emergency - electric shock requires medical evaluation']
  },
  {
    id: 'nosebleed',
    title: 'Nosebleed',
    category: 'General',
    icon: <FaFirstAid />,
    severity: 'general',
    steps: [
      { step: 1, title: 'Sit Upright', description: 'Sit and lean slightly forward (not back).' },
      { step: 2, title: 'Pinch Nose', description: 'Use thumb and index finger to pinch soft part of nose firmly.' },
      { step: 3, title: 'Hold for 10 Minutes', description: 'Keep pinching continuously for 10 minutes without checking.' },
      { step: 4, title: 'Apply Cold', description: 'Place cold compress on bridge of nose.' },
      { step: 5, title: 'Avoid', description: 'Do not blow nose or lean back for several hours.' },
    ],
    whenToCallDoctor: ['Bleeding lasts more than 20 minutes', 'Nosebleed after head injury', 'Frequent nosebleeds']
  },
  {
    id: 'insect-bite',
    title: 'Insect Bites & Stings',
    category: 'General',
    icon: <FaBolt />,
    severity: 'general',
    steps: [
      { step: 1, title: 'Remove Stinger', description: 'Scrape out stinger with flat edge (bee). Do not squeeze.' },
      { step: 2, title: 'Clean', description: 'Wash area with soap and water.' },
      { step: 3, title: 'Apply Cold', description: 'Apply ice pack wrapped in cloth for 10 minutes.' },
      { step: 4, title: 'Elevate', description: 'If on limb, elevate to reduce swelling.' },
      { step: 5, title: 'Watch for Allergy', description: 'Watch for severe reaction: difficulty breathing, swelling of face/throat.' },
    ],
    whenToCallDoctor: ['Signs of severe allergic reaction (anaphylaxis)', 'Multiple stings', 'Symptoms worsen']
  },
];

export default function FirstAidPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState<FirstAidGuide | null>(null);

  const categories = ['all', ...new Set(FIRST_AID_GUIDES.map(g => g.category))];

  const filteredGuides = FIRST_AID_GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'urgent': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden font-inter pb-24 text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-transparent to-orange-900/10" />
        <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 border border-red-500/30 rounded-2xl mb-6">
            <FaFirstAid size={32} className="text-red-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              First Aid
            </span>
            {' '}Guide
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Step-by-step emergency first aid instructions for common medical situations.
          </p>
        </motion.div>

        {!selectedGuide ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search first aid guides..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl"
                />
              </div>
              
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide, idx) => (
                <motion.div
                  key={guide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedGuide(guide)}
                  className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-red-500/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                      {guide.icon}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(guide.severity)}`}>
                      {guide.severity}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-red-400 transition-colors">{guide.title}</h3>
                  <p className="text-gray-400 text-sm">{guide.category}</p>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <button
              onClick={() => setSelectedGuide(null)}
              className="text-gray-400 hover:text-white transition"
            >
              ← Back to all guides
            </button>

            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-400">
                    {selectedGuide.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{selectedGuide.title}</h2>
                    <p className="text-gray-400">{selectedGuide.category}</p>
                  </div>
                </div>
                <span className={`text-sm px-3 py-1 rounded border ${getSeverityColor(selectedGuide.severity)}`}>
                  {selectedGuide.severity}
                </span>
              </div>

              <div className="space-y-6 mb-8">
                {selectedGuide.steps.map((step) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                      <p className="text-gray-300">{step.description}</p>
                      {step.warning && (
                        <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                          <FiAlertCircle /> {step.warning}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-yellow-400" /> When to Call Doctor
                </h4>
                <ul className="space-y-2">
                  {selectedGuide.whenToCallDoctor.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-yellow-300">
                      <FiCheckCircle className="mt-1" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}