'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const translations: Record<string, Record<string, string>> = {
  en: {
    home: 'Home', hospitals: 'Hospitals', specialists: 'Specialists', healthCamps: 'Health Camps',
    emergency: 'Emergency', myHealth: 'My Health', premium: 'Premium', helpline: 'Helpline',
    signIn: 'Sign In', logout: 'Logout', findHospitals: 'Find Hospitals', findSpecialists: 'Find Specialists',
    heroTitle: 'Your Health, Our', heroPriority: 'Priority',
    heroDesc: 'Find the best hospitals, specialists, and healthcare services across India. Book appointments instantly.',
    search: 'Search', allSpecialties: 'All Specialties', allLocations: 'All Locations', allStates: 'All States',
    filters: 'Filters', emergencyOnly: 'Emergency Services Only', hospitalsFound: 'hospitals found',
    doctorsFound: 'doctors found', viewAll: 'View All', viewDetails: 'View Details',
    bookAppointment: 'Book Appointment', registerNow: 'Register Now', availableToday: 'Available Today',
    bedsAvailable: 'Beds Available', icuFree: 'ICU Free', bedOccupancy: 'Bed Occupancy',
    emergencyNumbers: 'Emergency Numbers', quickAccess: 'Quick access to emergency services across India',
    ambulance: 'Ambulance', police: 'Police', fire: 'Fire',
    topHospitals: 'Top Hospitals', topSpecialists: 'Top Specialists', ourSpecialties: 'Our Specialties',
    upcomingCamps: 'Upcoming Health Camps', downloadApp: 'Download Our Mobile App',
    choosePlan: 'Choose Your Plan', currentPlan: 'Current Plan', subscribeNow: 'Subscribe Now',
    loading: 'Loading...', noResults: 'No results found', clearFilters: 'Clear filters',
    language: 'Language', searchPlaceholder: 'Search doctors, hospitals, conditions...',
    verifiedHospitals: 'Verified Hospitals', expertDoctors: 'Expert Doctors',
    happyPatients: 'Happy Patients', yearsService: 'Years of Service',
    needEmergencyHelp: 'Need Emergency Help?', emergencyDesc: 'Our 24/7 emergency services are always ready to help you.',
    findNearest: 'Find Nearest Hospital', campsFree: 'Free health checkups and screenings near you',
    chatAssistant: 'Health Assistant', chatOnline: 'Online • Ready to help',
    chatPlaceholder: 'Type your message...', quickActions: 'Quick actions:',
    findNearestHospital: 'Find nearest hospital', bookAppointmentAction: 'Book appointment',
    emergencyHelp: 'Emergency help', findSpecialist: 'Find specialist',
    healthTips: 'Health tips', medicinesInfo: 'Medicines info',
    emergencyCallTitle: '🚨 Emergency Check',
    emergencyCallDesc: 'You have been browsing for a while. Are you looking for emergency medical help?',
    yesEmergency: 'Yes, I need help!', noEmergency: 'No, I\'m fine',
    connectingHospital: 'Connecting you to the nearest hospital...',
    aiSpeaking: 'AI Assistant is speaking...',
    legal: 'Legal',
    contact: 'Contact',
    saasBuilder: 'SaaS Builder',
  },
  hi: {
    home: 'होम', hospitals: 'अस्पताल', specialists: 'विशेषज्ञ', healthCamps: 'स्वास्थ्य शिविर',
    emergency: 'आपातकाल', myHealth: 'मेरा स्वास्थ्य', premium: 'प्रीमियम', helpline: 'हेल्पलाइन',
    signIn: 'साइन इन', logout: 'लॉगआउट', findHospitals: 'अस्पताल खोजें', findSpecialists: 'विशेषज्ञ खोजें',
    heroTitle: 'आपका स्वास्थ्य, हमारी', heroPriority: 'प्राथमिकता',
    heroDesc: 'भारत भर में सबसे अच्छे अस्पतालों, विशेषज्ञों और स्वास्थ्य सेवाओं को खोजें।',
    search: 'खोजें', allSpecialties: 'सभी विशेषताएं', allLocations: 'सभी स्थान', allStates: 'सभी राज्य',
    filters: 'फ़िल्टर', emergencyOnly: 'केवल आपातकालीन सेवाएं', hospitalsFound: 'अस्पताल मिले',
    doctorsFound: 'डॉक्टर मिले', viewAll: 'सभी देखें', viewDetails: 'विवरण देखें',
    bookAppointment: 'अपॉइंटमेंट बुक करें', registerNow: 'अभी रजिस्टर करें', availableToday: 'आज उपलब्ध',
    bedsAvailable: 'बेड उपलब्ध', icuFree: 'ICU खाली', bedOccupancy: 'बेड अधिभोग',
    emergencyNumbers: 'आपातकालीन नंबर', quickAccess: 'भारत भर में आपातकालीन सेवाओं तक त्वरित पहुंच',
    ambulance: 'एम्बुलेंस', police: 'पुलिस', fire: 'अग्निशमन',
    topHospitals: 'शीर्ष अस्पताल', topSpecialists: 'शीर्ष विशेषज्ञ', ourSpecialties: 'हमारी विशेषताएं',
    upcomingCamps: 'आगामी स्वास्थ्य शिविर', downloadApp: 'हमारा मोबाइल ऐप डाउनलोड करें',
    choosePlan: 'अपना प्लान चुनें', currentPlan: 'वर्तमान प्लान', subscribeNow: 'अभी सब्सक्राइब करें',
    loading: 'लोड हो रहा है...', noResults: 'कोई परिणाम नहीं', clearFilters: 'फ़िल्टर साफ़ करें',
    language: 'भाषा', searchPlaceholder: 'डॉक्टर, अस्पताल, बीमारी खोजें...',
    verifiedHospitals: 'सत्यापित अस्पताल', expertDoctors: 'विशेषज्ञ डॉक्टर',
    happyPatients: 'खुश मरीज़', yearsService: 'सेवा के वर्ष',
    needEmergencyHelp: 'आपातकालीन मदद चाहिए?', emergencyDesc: 'हमारी 24/7 आपातकालीन सेवाएं हमेशा तैयार हैं।',
    findNearest: 'नज़दीकी अस्पताल खोजें', campsFree: 'आपके पास मुफ्त स्वास्थ्य जांच शिविर',
    chatAssistant: 'स्वास्थ्य सहायक', chatOnline: 'ऑनलाइन • मदद के लिए तैयार',
    chatPlaceholder: 'अपना संदेश लिखें...', quickActions: 'त्वरित कार्य:',
    findNearestHospital: 'नज़दीकी अस्पताल खोजें', bookAppointmentAction: 'अपॉइंटमेंट बुक करें',
    emergencyHelp: 'आपातकालीन मदद', findSpecialist: 'विशेषज्ञ खोजें',
    healthTips: 'स्वास्थ्य सुझाव', medicinesInfo: 'दवाई जानकारी',
    emergencyCallTitle: '🚨 आपातकालीन जांच',
    emergencyCallDesc: 'आप काफी देर से ब्राउज़ कर रहे हैं। क्या आपको आपातकालीन चिकित्सा सहायता चाहिए?',
    yesEmergency: 'हां, मुझे मदद चाहिए!', noEmergency: 'नहीं, मैं ठीक हूं',
    connectingHospital: 'आपको नज़दीकी अस्पताल से जोड़ रहे हैं...',
    aiSpeaking: 'AI सहायक बोल रहा है...',
    legal: 'कानूनी',
    contact: 'संपर्क',
    saasBuilder: 'SaaS बिल्डर',
  },
  bn: {
    home: 'হোম', hospitals: 'হাসপাতাল', specialists: 'বিশেষজ্ঞ', healthCamps: 'স্বাস্থ্য শিবির',
    emergency: 'জরুরি', myHealth: 'আমার স্বাস্থ্য', premium: 'প্রিমিয়াম', helpline: 'হেল্পলাইন',
    signIn: 'সাইন ইন', logout: 'লগআউট', findHospitals: 'হাসপাতাল খুঁজুন', findSpecialists: 'বিশেষজ্ঞ খুঁজুন',
    heroTitle: 'আপনার স্বাস্থ্য, আমাদের', heroPriority: 'অগ্রাধিকার',
    heroDesc: 'ভারত জুড়ে সেরা হাসপাতাল ও বিশেষজ্ঞদের খুঁজুন।',
    search: 'খুঁজুন', filters: 'ফিল্টার', loading: 'লোড হচ্ছে...', language: 'ভাষা',
    emergencyCallTitle: '🚨 জরুরি পরীক্ষা',
    emergencyCallDesc: 'আপনি অনেকক্ষণ ধরে ব্রাউজ করছেন। আপনার কি জরুরি চিকিৎসা সাহায্য দরকার?',
    yesEmergency: 'হ্যাঁ, আমার সাহায্য দরকার!', noEmergency: 'না, আমি ঠিক আছি',
  },
  ta: {
    home: 'முகப்பு', hospitals: 'மருத்துவமனைகள்', specialists: 'நிபுணர்கள்', emergency: 'அவசரம்',
    signIn: 'உள்நுழைக', search: 'தேடு', language: 'மொழி', loading: 'ஏற்றுகிறது...',
    emergencyCallTitle: '🚨 அவசர சோதனை',
    yesEmergency: 'ஆம், எனக்கு உதவி தேவை!', noEmergency: 'இல்லை, நான் நன்றாக இருக்கிறேன்',
  },
  te: {
    home: 'హోమ్', hospitals: 'ఆసుపత్రులు', specialists: 'నిపుణులు', emergency: 'అత్యవసరం',
    signIn: 'సైన్ ఇన్', search: 'వెతకండి', language: 'భాష', loading: 'లోడ్ అవుతోంది...',
    emergencyCallTitle: '🚨 అత్యవసర తనిఖీ',
    yesEmergency: 'అవును, నాకు సహాయం కావాలి!', noEmergency: 'లేదు, నేను బాగానే ఉన్నాను',
  },
  mr: {
    home: 'होम', hospitals: 'रुग्णालये', specialists: 'तज्ञ', emergency: 'आणीबाणी',
    signIn: 'साइन इन', search: 'शोधा', language: 'भाषा', loading: 'लोड होत आहे...',
    emergencyCallTitle: '🚨 आणीबाणी तपासणी',
    yesEmergency: 'हो, मला मदत हवी आहे!', noEmergency: 'नाही, मी ठीक आहे',
  },
  hinglish: {
    home: 'Home', hospitals: 'Hospitals', specialists: 'Doctors', healthCamps: 'Health Camps',
    emergency: 'Emergency', myHealth: 'Meri Health', premium: 'Premium', helpline: 'Helpline',
    signIn: 'Login Karo', logout: 'Logout', findHospitals: 'Hospital Dhundo', findSpecialists: 'Doctor Dhundo',
    heroTitle: 'Aapki Health, Humari', heroPriority: 'Zimmedari',
    heroDesc: 'India bhar ke best hospitals aur doctors ki jankari ek hi jagah. Abhi appointment book karo!',
    search: 'Search Karo', allSpecialties: 'Sab Specialties', allLocations: 'Sab Jagah', allStates: 'Sab States',
    filters: 'Filters', emergencyOnly: 'Sirf Emergency Services', hospitalsFound: 'hospital mile',
    doctorsFound: 'doctor mile', viewAll: 'Sab Dekho', viewDetails: 'Details Dekho',
    bookAppointment: 'Appointment Lo', registerNow: 'Register Karo', availableToday: 'Aaj Available',
    bedsAvailable: 'Bed Available', icuFree: 'ICU Khali', bedOccupancy: 'Bed Bharao',
    emergencyNumbers: 'Emergency Numbers', quickAccess: 'India bhar ki emergency services tak jaldi pahuncho',
    ambulance: 'Ambulance', police: 'Police', fire: 'Aag Brigade',
    topHospitals: 'Top Hospitals', topSpecialists: 'Best Doctors', ourSpecialties: 'Hamari Specialties',
    upcomingCamps: 'Aane Wale Health Camps', downloadApp: 'App Download Karo',
    choosePlan: 'Plan Choose Karo', currentPlan: 'Current Plan', subscribeNow: 'Subscribe Karo',
    loading: 'Load ho raha hai...', noResults: 'Kuch nahi mila', clearFilters: 'Filters Hatao',
    language: 'Bhasha', searchPlaceholder: 'Doctor, hospital ya bimari dhundo...',
    verifiedHospitals: 'Verified Hospitals', expertDoctors: 'Expert Doctors',
    happyPatients: 'Khush Patients', yearsService: 'Saal ki Service',
    needEmergencyHelp: 'Emergency Help Chahiye?', emergencyDesc: 'Hamari 24/7 emergency services hamesha ready hain.',
    findNearest: 'Najdiki Hospital Dhundo', campsFree: 'Aapke paas free health check camps',
    chatAssistant: 'Health Sahayak', chatOnline: 'Online • Help ke liye ready',
    chatPlaceholder: 'Apna message likho...', quickActions: 'Jaldi karo:',
    findNearestHospital: 'Najdiki hospital', bookAppointmentAction: 'Appointment lo',
    emergencyHelp: 'Emergency help', findSpecialist: 'Doctor dhundo',
    healthTips: 'Health tips', medicinesInfo: 'Dawai ki jankari',
    emergencyCallTitle: '🚨 Emergency Check',
    emergencyCallDesc: 'Aap kaafi der se browse kar rahe hain. Kya aapko emergency medical help chahiye?',
    yesEmergency: 'Haan, help chahiye!', noEmergency: 'Nahi, main theek hoon',
    connectingHospital: 'Sajdiki hospital se connect kar rahe hain...',
    aiSpeaking: 'AI Sahayak bol raha hai...',
  },
};

interface LanguageContextType {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en', setLang: () => {}, t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState('en');

  // Load from localStorage and set html lang
  useEffect(() => {
    const stored = localStorage.getItem('app_lang');
    if (stored) setLang(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleSetLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  const t = (key: string) => translations[lang]?.[key] || translations.en?.[key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];
