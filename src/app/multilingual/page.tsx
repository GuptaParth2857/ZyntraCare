'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGlobe, FiMic, FiMicOff, FiVolume2, FiCheck, FiArrowRight } from 'react-icons/fi';

interface Language {
  code: string;
  name: string;
  native: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇱🇰' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

const SAMPLE_TEXTS: Record<string, { title: string; body: string }> = {
  en: { title: 'Welcome to ZyntraCare', body: 'Your health is our priority. Book appointments, find doctors, and manage your medical records all in one place.' },
  hi: { title: 'ज़्योंट्राकेयर में आपका स्वागत है', body: 'आपका स्वास्थ्य हमारी प्राथमिकता है। अपॉइंटमेंट बुक करें, डॉक्टर खोजें, और अपने मेडिकल रिकॉर्ड एक ही जगह पर प्रबंधित करें।' },
  ta: { title: 'ஜின்ட்ராகேருக்கு வரவேற்கிறோம்', body: 'உங்கள் ஆரோக்கியம் எங்கள் முன்னுரிமை ஆகும். அப்பாயின்மென்ட்களை முன்பதிவு செய்யுங்கள், மருத்துவர்களைக் கண்டுபிடிங்கள், உங்கள் மருத்துவப் பதிவுகளை ஒரே இடத்தில் நிர்வகியுங்கள்.' },
  te: { title: 'జింట్రాకేర్‌కు హృదయపూర్వక ఆహ్వానం', body: ' మీ ఆరోగ్యం మా ప్రాధాన్యత. appointments బుక్ చేయడం, doctors ను కనుగొనడం, మరియు మీ medical records ఒకే చోట manages.' },
};

export default function MultilingualPage() {
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [translatedText, setTranslatedText] = useState(SAMPLE_TEXTS.en);
  const [showLangList, setShowLangList] = useState(false);

  const changeLanguage = (lang: Language) => {
    setSelectedLang(lang);
    setTranslatedText(SAMPLE_TEXTS[lang.code] || SAMPLE_TEXTS.en);
    setShowLangList(false);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang.code === 'en' ? 'en-US' : selectedLang.code === 'hi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiGlobe className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Multi-Lingual Support</h1>
              <p className="text-blue-200">Voice & Text in 10+ Indian Languages</p>
            </div>
          </div>

          {/* Language Selector */}
          <button
            onClick={() => setShowLangList(!showLangList)}
            className="w-full bg-white/10 backdrop-blur-xl rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedLang.flag}</span>
              <div className="text-left">
                <p className="font-bold">{selectedLang.native}</p>
                <p className="text-xs text-blue-200">{selectedLang.name}</p>
              </div>
            </div>
            <FiArrowRight className={`transform transition ${showLangList ? 'rotate-90' : ''}`} />
          </button>

          {/* Language Dropdown */}
          {showLangList && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-white rounded-2xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
            >
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang)}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-slate-50 ${
                    selectedLang.code === lang.code ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{lang.native}</p>
                    <p className="text-xs text-slate-500">{lang.name}</p>
                  </div>
                  {selectedLang.code === lang.code && (
                    <FiCheck className="text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Voice Assistant Demo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-lg mb-4">🎙️ Voice Assistant</h3>
          <p className="text-sm text-slate-500 mb-4">Tap the microphone and speak in your language</p>
          
          <div className="flex flex-col items-center">
            <button
              onClick={toggleVoice}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <FiMicOff className="text-white text-3xl" />
              ) : (
                <FiMic className="text-white text-3xl" />
              )}
            </button>
            <p className="text-sm text-slate-500 mt-3">
              {isListening ? 'Listening...' : 'Tap to speak'}
            </p>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Try saying:</p>
            <p className="text-sm font-medium">"Book appointment with cardiologist"</p>
            <p className="text-xs text-indian-orange-500 mt-2">
              {selectedLang.code === 'hi' ? '"कार्डियोलॉजिस्ट के साथ अपॉइंटमेंट बुक करें"' : ''}
            </p>
          </div>
        </div>

        {/* Translation Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">📝 Translation Preview</h3>
            <button
              onClick={() => speakText(translatedText.title + '. ' + translatedText.body)}
              className="p-2 bg-blue-100 rounded-lg"
            >
              <FiVolume2 className="text-blue-600" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Title</p>
              <p className="font-bold text-lg text-slate-900">{translatedText.title}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Body</p>
              <p className="text-slate-700 leading-relaxed">{translatedText.body}</p>
            </div>
          </div>
        </div>

        {/* Supported Features */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="font-bold text-lg mb-4">✅ Supported Features</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'AI Chatbot',
              'Doctor Names',
              'Symptoms',
              'Medicines',
              'Appointments',
              'Emergency SOS',
              'Medical ID',
              'Prescriptions',
              'Hospital Search',
              'Lab Results',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <FiCheck className="text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Stats */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">🌍 Impact</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-black">10+</p>
              <p className="text-xs text-white/70">Languages</p>
            </div>
            <div>
              <p className="text-3xl font-black">70%</p>
              <p className="text-xs text-white/70">Rural Coverage</p>
            </div>
            <div>
              <p className="text-3xl font-black">500M+</p>
              <p className="text-xs text-white/70">Potential Users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}