'use client';

import { useState } from 'react';
import { FiMessageSquare, FiSend, FiBook, FiActivity, FiCpu, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FaRobot, FaStethoscope, FaFileMedical } from 'react-icons/fa';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { title: string; relevance: number }[];
}

export default function ClinicalAISupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Hello! I\'m ZyntraCare\'s Clinical AI Assistant. I can help you with:\n\n• Symptom analysis and differential diagnosis\n• Treatment recommendations based on clinical guidelines\n• Drug interaction checks\n• Medical literature summaries\n• Patient case analysis\n\nHow can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response with clinical context
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // Clinical knowledge base simulation
    if (lowerQuery.includes('diabetes') || lowerQuery.includes('sugar')) {
      return {
        role: 'ai',
        content: '**Diabetes Management Guidelines:**\n\nBased on your query about diabetes:\n\n**Diagnostic Criteria:**\n• Fasting Blood Sugar ≥ 126 mg/dL\n• HbA1c ≥ 6.5%\n• Random Blood Sugar ≥ 200 mg/dL\n\n**Treatment Approach:**\n1. **Lifestyle Modification:**\n   - 150 min/week moderate exercise\n   - Low glycemic index diet\n   - Weight management (target BMI < 23)\n\n2. **First-line Medications:**\n   - Metformin 500mg BD (if no contraindications)\n   - Consider SGLT2 inhibitors for cardiovascular risk\n\n3. **Monitoring:**\n   - HbA1c every 3 months (target < 7%)\n   - Annual comprehensive eye exam\n   - Foot examination every visit\n\n⚠️ **Note:** This is for educational purposes. Consult an endocrinologist for personalized care.',
        sources: [
          { title: 'ADA Standards of Care 2024', relevance: 95 },
          { title: 'ICMR Diabetes Guidelines', relevance: 90 }
        ]
      };
    }
    
    if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
      return {
        role: 'ai',
        content: '**Hypertension Management:**\n\n**Classification:**\n• Normal: <120/80 mmHg\n• Elevated: 120-129/<80\n• Stage 1 HTN: 130-139/80-89\n• Stage 2 HTN: ≥140/≥90\n\n**Initial Management:**\n1. **Lifestyle:**\n   - DASH diet (low sodium, high potassium)\n   - 30 min exercise daily\n   - Limit alcohol\n   - Stress management\n\n2. **Pharmacotherapy (if needed):**\n   - ACE inhibitors (Enalapril 5-10mg)\n   - ARBs (Telmisartan 40-80mg)\n   - CCB (Amlodipine 5-10mg)\n\n**Target:**\n• General: <130/80 mmHg\n• High risk: <120/80 mmHg\n\n⚠️ **Important:** Consult cardiologist for personalized treatment.',
        sources: [
          { title: 'ACC/AHA Hypertension Guidelines', relevance: 95 },
          { title: 'WHO Global HEART Initiative', relevance: 85 }
        ]
      };
    }
    
    if (lowerQuery.includes('chest pain') || lowerQuery.includes('heart')) {
      return {
        role: 'ai',
        content: '**Chest Pain Assessment - RED FLAGS:**\n\n⚠️ **Seek Immediate Medical Attention If:**\n• Pressure/squeezing pain radiating to arm/jaw\n• Associated with sweating, nausea, shortness of breath\n• Pain > 20 minutes at rest\n• Syncope or near-syncope\n\n**Differential Diagnosis:**\n1. **Cardiac (High Priority):**\n   - Acute Coronary Syndrome\n   - Angina\n   - Myocarditis\n\n2. **Other Causes:**\n   - GERD/Pleural\n   - Musculoskeletal\n   - Panic disorder\n\n**Initial Workup:**\n• ECG within 10 minutes\n• Troponin levels\n• Chest X-ray\n• CBC, CMP\n\n🚨 **Disclaimer:** Chest pain requires immediate medical evaluation. Call emergency services.',
        sources: [
          { title: 'ACC Chest Pain Guidelines', relevance: 98 },
          { title: 'Emergency Cardiology Protocols', relevance: 95 }
        ]
      };
    }

    // Default clinical response
    return {
      role: 'ai',
      content: `Thank you for your query about "${query}".\n\nI can help analyze your medical question based on clinical guidelines and evidence-based medicine.\n\n**To provide the best assistance, please include:**\n• Specific symptoms you're experiencing\n• Duration of symptoms\n• Any relevant medical history\n• Current medications\n\nMy responses are based on:\n• International clinical guidelines (WHO, ADA, ACC, AHA)\n• Indian medical standards (ICMR, NCD guidelines)\n• Peer-reviewed medical literature\n\n**Note:** This is AI-assisted information and NOT a substitute for professional medical advice. Always consult qualified healthcare providers for diagnosis and treatment.`,
      sources: [
        { title: 'UpToDate Clinical Database', relevance: 80 },
        { title: 'PubMed Central', relevance: 75 }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden font-inter text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-purple-900/10" />
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl mb-6">
            <FaRobot size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4">
            Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Support
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Evidence-based AI assistant for clinical decision support and medical analysis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 bg-indigo-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaStethoscope className="text-indigo-400" />
              <span className="font-bold">ZyntraCare Clinical AI</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiCpu size={14} />
              Powered by Clinical Knowledge Graph
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-gray-100'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  {msg.sources && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400 mb-2">📚 Sources:</p>
                      {msg.sources.map((source, sidx) => (
                        <div key={sidx} className="flex items-center gap-2 text-xs text-gray-500">
                          <FiBook size={12} />
                          <span>{source.title}</span>
                          <span className="text-indigo-400">({source.relevance}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-4 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Ask about symptoms, conditions, treatments..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl font-bold transition flex items-center gap-2"
              >
                <FiSend size={18} />
                Send
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 grid md:grid-cols-3 gap-6"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiActivity className="text-green-400" />
              <h3 className="font-bold">Evidence-Based</h3>
            </div>
            <p className="text-gray-400 text-sm">Responses grounded in peer-reviewed clinical guidelines and medical literature.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FiAlertTriangle className="text-yellow-400" />
              <h3 className="font-bold">Safety Alerts</h3>
            </div>
            <p className="text-gray-400 text-sm">Red flag symptoms and critical warnings highlighted for patient safety.</p>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaFileMedical className="text-blue-400" />
              <h3 className="font-bold">Cited Sources</h3>
            </div>
            <p className="text-gray-400 text-sm">Every response includes relevant medical guidelines and research references.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}