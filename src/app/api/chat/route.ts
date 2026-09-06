import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.message?.content || null;
  } catch {
    return null;
  }
}

const LANG_MAP: Record<string, { name: string; emergency: string; hello: string; hospital: string; appointment: string; symptom: string; medicine: string; insurance: string; default: string }> = {
  en: { name: 'English', emergency: '🚨 Emergency! Please call immediately:\n\n• 112 - National Emergency\n• 102 - Ambulance\n• 108 - Emergency Services\n\nDo you need help finding a nearby hospital?', hello: '🙏 Hello! I\'m ZyntraCare AI Health Assistant. I can help you with:\n\n• 🏥 Finding hospitals\n• 📅 Booking appointments\n• 🩺 Symptom checking\n• 💊 Medicine information\n• 🚨 Emergency assistance\n\nHow can I assist you today?', hospital: '🏥 I can help you find nearby hospitals. Please tell me:\n\n1. Your city name\n2. What specialty do you need?\n\nOr visit the /hospitals page for a live map.', appointment: '📅 To book an appointment:\n\n1. Visit the /specialists page\n2. Choose your doctor\n3. Select a time slot\n\nAre you looking for a specific doctor?', symptom: '🩺 For symptom checking:\n\n1. Visit the /symptoms page\n2. Select your symptoms\n3. Get AI-powered analysis\n\n⚠️ For severe symptoms, consult a doctor immediately.', medicine: '💊 For medicine information:\n\n1. Visit the /pill-scanner page\n2. Enter medicine name or upload photo\n3. Get complete information\n\n📍 Find nearby pharmacies at /pharmacies.', insurance: '🛡️ Health Insurance:\n\n1. Visit the /subscription page\n2. Choose your plan\n3. Get premium features\n\nOur plans:\n• Free: Basic features\n• Premium: AI analysis, unlimited appointments', default: '🙏 Hello! I\'m ZyntraCare AI Health Assistant. I can help you with:\n\n• 🏥 Finding hospitals\n• 📅 Booking appointments\n• 🩺 Symptom checking\n• 💊 Medicine information\n• 🚨 Emergency assistance\n\nHow can I assist you today?' },
  hi: { name: 'Hindi', emergency: '🚨 आपातकाल! कृपया तुरंत इन नंबरों पर कॉल करें:\n\n• 112 - राष्ट्रीय आपातकाल\n• 102 - एम्बुलेंस\n• 108 - आपातकालीन सेवा\n\nक्या आपको नज़दीकी अस्पताल खोजने में मदद चाहिए?', hello: '🙏 नमस्ते! मैं ZyntraCare AI हूं। मैं आपकी मदद कर सकता हूं:\n\n• 🏥 अस्पताल खोजने में\n• 📅 अपॉइंटमेंट बुक करने में\n• 🩺 लक्षण जांच में\n• 💊 दवाई की जानकारी में\n• 🚨 आपातकाल में मदद\n\nआपको किस चीज़ में मदद चाहिए?', hospital: '🏥 मैं आपको नज़दीकी अस्पताल खोजने में मदद कर सकता हूं। कृपया बताएं:\n\n1. आपका शहर क्या है?\n2. किस विशेषज्ञ की ज़रूरत है?\n\nया आप /hospitals पेज पर जा सकते हैं।', appointment: '📅 अपॉइंटमेंट बुक करने के लिए:\n\n1. /specialists पेज पर जाएं\n2. अपना डॉक्टर चुनें\n3. समय चुनें\n\nक्या आप किसी विशेष डॉक्टर की तलाश में हैं?', symptom: '🩺 लक्षण जांच के लिए:\n\n1. /symptoms पेज पर जाएं\n2. अपने लक्षण चुनें\n3. AI विश्लेषण प्राप्त करें\n\n⚠️ गंभीर लक्षणों के लिए तुरंत डॉक्टर से संपर्क करें।', medicine: '💊 दवाई की जानकारी के लिए:\n\n1. /pill-scanner पेज पर जाएं\n2. दवाई का नाम लिखें या फोटो अपलोड करें\n3. पूरी जानकारी प्राप्त करें\n\n📍 नज़दीकी फार्मेसी खोजने के लिए /pharmacies देखें।', insurance: '🛡️ स्वास्थ्य बीमा:\n\n1. /subscription पेज पर जाएं\n2. अपना प्लान चुनें\n3. प्रीमियम सुविधाएं प्राप्त करें\n\nहमारे प्लान:\n• Free: बुनियादी सुविधाएं\n• Premium: AI विश्लेषण, असीमित अपॉइंटमेंट', default: '🙏 नमस्ते! मैं ZyntraCare AI हूं। मैं आपकी मदद कर सकता हूं:\n\n• 🏥 अस्पताल खोजने में\n• 📅 अपॉइंटमेंट बुक करने में\n• 🩺 लक्षण जांच में\n• 💊 दवाई की जानकारी में\n• 🚨 आपातकाल में मदद\n\nआपको किस चीज़ में मदद चाहिए?' },
  bn: { name: 'Bengali', emergency: '🚨 জরুরি! অনুগ্রহ করে এখনই এই নম্বরগুলিতে কল করুন:\n\n• 112 - জাতীয় জরুরি\n• 102 - অ্যাম্বুলেন্স\n• 108 - জরুরি সেবা\n\nআপনার কি কাছের হাসপাতাল খুঁজে পেতে সাহায্য দরকার?', hello: '🙏 নমস্কার! আমি ZyntraCare AI। আমি আপনাকে সাহায্য করতে পারি:\n\n• 🏥 হাসপাতাল খুঁজে পেতে\n• 📅 অ্যাপয়েন্টমেন্ট বুক করতে\n• 🩺 লক্ষণ পরীক্ষা\n• 💊 ওষুধের তথ্য\n• 🚨 জরুরি সাহায্য\n\nআমি আজ আপনাকে কীভাবে সাহায্য করতে পারি?', hospital: '🏥 আমি আপনাকে কাছের হাসপাতাল খুঁজে পেতে সাহায্য করতে পারি।', appointment: '📅 অ্যাপয়েন্টমেন্ট বুক করতে /specialists পেজে যান।', symptom: '🩺 লক্ষণ পরীক্ষার জন্য /symptoms পেজে যান।', medicine: '💊 ওষুধের তথ্যের জন্য /pill-scanner পেজে যান।', insurance: '🛡️ স্বাস্থ্য বীমার জন্য /subscription পেজে যান।', default: '🙏 নমস্কার! আমি ZyntraCare AI। আমি আপনাকে সাহায্য করতে পারি।' },
  ta: { name: 'Tamil', emergency: '🚨 அவசரம்! உடனே இந்த எண்களுக்கு அழைக்கவும்:\n\n• 112 - தேசிய அவசரம்\n• 102 - ஆம்புலன்ஸ்\n• 108 - அவசர சேவை', hello: '🙏 வணக்கம்! நான் ZyntraCare AI. நான் உங்களுக்கு உதவ முடியும்:\n\n• 🏥 மருத்துவமனைகளைக் கண்டறிய\n• 📅 சந்திப்பு முன்பதிவு\n• 🩺 அறிகுறி சரிபார்ப்பு\n• 💊 மருந்து தகவல்\n• 🚨 அவசர உதவி', hospital: '🏥 அருகிலுள்ள மருத்துவமனைகளைக் கண்டறிய உங்களுக்கு உதவ முடியும்.', appointment: '📅 சந்திப்பு முன்பதிவு செய்ய /specialists பக்கத்திற்குச் செல்லவும்.', symptom: '🩺 அறிகுறி சரிபார்ப்புக்கு /symptoms பக்கத்திற்குச் செல்லவும்.', medicine: '💊 மருந்து தகவலுக்கு /pill-scanner பக்கத்திற்குச் செல்லவும்.', insurance: '🛡️ சுகாதார காப்பீட்டிற்கு /subscription பக்கத்திற்குச் செல்லவும்.', default: '🙏 வணக்கம்! நான் ZyntraCare AI. நான் உங்களுக்கு உதவ முடியும்.' },
  te: { name: 'Telugu', emergency: '🚨 అత్యవసరం! వెంటనే ఈ నంబర్లకు కాల్ చేయండి:\n\n• 112 - జాతీయ అత్యవసరం\n• 102 - అంబులెన్స్\n• 108 - అత్యవసర సేవలు', hello: '🙏 నమస్కారం! నేను ZyntraCare AI. నేను మీకు సహాయం చేయగలను:\n\n• 🏥 ఆసుపత్రులు కనుగొనడంలో\n• 📅 అపాయింట్మెంట్ బుక్ చేయడంలో\n• 🩺 లక్షణాల చెక్\n• 💊 మందుల సమాచారం\n• 🚨 అత్యవసర సహాయం', hospital: '🏥 సమీపంలోని ఆసుపత్రులు కనుగొనడంలో నేను సహాయం చేయగలను.', appointment: '📅 అపాయింట్మెంట్ బుక్ చేయడానికి /specialists పేజీకి వెళ్ళండి.', symptom: '🩺 లక్షణాల చెక్ కోసం /symptoms పేజీకి వెళ్ళండి.', medicine: '💊 మందుల సమాచారం కోసం /pill-scanner పేజీకి వెళ్ళండి.', insurance: '🛡️ ఆరోగ్య బీమా కోసం /subscription పేజీకి వెళ్ళండి.', default: '🙏 నమస్కారం! నేను ZyntraCare AI. నేను మీకు సహాయం చేయగలను.' },
  mr: { name: 'Marathi', emergency: '🚨 आपत्काल! कृपया तुरंत या नंबरवर कॉल करा:\n\n• 112 - राष्ट्रीय आपत्काल\n• 102 - अॅम्बुलन्स\n• 108 - आपत्कालीन सेवा', hello: '🙏 नमस्कार! मी ZyntraCare AI आहे. मी तुम्हाला मदत करू शकतो:\n\n• 🏥 रुग्णालये शोधण्यास\n• 📅 भेटी बुक करण्यास\n• 🩺 लक्षणे तपासणी\n• 💊 औषध माहिती\n• 🚨 आपत्कालीन मदत', hospital: '🏥 जवळची रुग्णालये शोधण्यास मी मदत करू शकतो.', appointment: '📅 भेट बुक करण्यासाठी /specialists पेजवर जा.', symptom: '🩺 लक्षणे तपासणीसाठी /symptoms पेजवर जा.', medicine: '💊 औषध माहितीसाठी /pill-scanner पेजवर जा.', insurance: '🛡️ आरोग्य विमेसाठी /subscription पेजवर जा.', default: '🙏 नमस्कार! मी ZyntraCare AI आहे. मी तुम्हाला मदत करू शकतो.' },
  kn: { name: 'Kannada', emergency: '🚨 ತುರ್ತು! ದಯವಿಟ್ಟು ತಕ್ಷಣ ಈ ಸಂಖ್ಯೆಗಳಿಗೆ ಕರೆ ಮಾಡಿ:\n\n• 112 - ರಾಷ್ಟ್ರೀಯ ತುರ್ತು\n• 102 - ಆಂಬ್ಯುಲೆನ್ಸ್\n• 108 - ತುರ್ತು ಸೇವೆಗಳು', hello: '🙏 ನಮಸ್ಕಾರ! ನಾನು ZyntraCare AI. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು:\n\n• 🏥 ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಗಲು\n• 📅 ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು\n• 🩺 ಲಕ್ಷಣ ಪರಿಶೀಲನೆ\n• 💊 ಔಷಧ ಮಾಹಿತಿ\n• 🚨 ತುರ್ತು ಸಹಾಯ', hospital: '🏥 ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳನ್ನು ಹುಡುಗಲು ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು.', appointment: '📅 ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಬುಕ್ ಮಾಡಲು /specialists ಪುಟಕ್ಕೆ ಹೋಗಿ.', symptom: '🩺 ಲಕ್ಷಣ ಪರಿಶೀಲನೆಗೆ /symptoms ಪುಟಕ್ಕೆ ಹೋಗಿ.', medicine: '💊 ಔಷಧ ಮಾಹಿತಿಗೆ /pill-scanner ಪುಟಕ್ಕೆ ಹೋಗಿ.', insurance: '🛡️ ಆರೋಗ್ಯ ವಿಮೆಗೆ /subscription ಪುಟಕ್ಕೆ ಹೋಗಿ.', default: '🙏 ನಮಸ್ಕಾರ! ನಾನು ZyntraCare AI. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಹುದು.' },
  ml: { name: 'Malayalam', emergency: '🚨 അടിയന്തരം! ഉടൻ ഈ നമ്പറുകളിൽ വിളിക്കുക:\n\n• 112 - ദേശീയ അടിയന്തരം\n• 102 - ആംബുലൻസ്\n• 108 - അടിയന്തര സേവനങ്ങൾ', hello: '🙏 നമസ്കാരം! ഞാൻ ZyntraCare AI ആണ്. ഞാൻ നിങ്ങളെ സഹായിക്കാം:\n\n• 🏥 ആശുപത്രികൾ കണ്ടെത്താൻ\n• 📅 അപ്പോയിൻട്ട്മെന്റ് ബുക്ക് ചെയ്യാൻ\n• 🩺 ലക്ഷണ പരിശോധന\n• 💊 മരുന്ന് വിവരം\n• 🚨 അടിയന്തര സഹായം', hospital: '🏥 സമീപത്തുള്ള ആശുപത്രികൾ കണ്ടെത്താൻ ഞാൻ സഹായിക്കാം.', appointment: '📅 അപ്പോയിൻട്ട്മെന്റ് ബുക്ക് ചെയ്യാൻ /specialists പേജിലേക്ക് പോകുക.', symptom: '🩺 ലക്ഷണ പരിശോധനയ്ക്ക് /symptoms പേജിലേക്ക് പോകുക.', medicine: '💊 മരുന്ന് വിവരത്തിന് /pill-scanner പേജിലേക്ക് പോകുക.', insurance: '🛡️ ആരോഗ്യ ഇൻഷുറൻസിന് /subscription പേജിലേക്ക് പോകുക.', default: '🙏 നമസ്കാരം! ഞാൻ ZyntraCare AI ആണ്. ഞാൻ നിങ്ങളെ സഹായിക്കാം.' },
  pa: { name: 'Punjabi', emergency: "🚨 ਐਮਰਜੈਂਸੀ! ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਇਹਨਾਂ ਨੰਬਰਾਂ 'ਤੇ ਕਾਲ ਕਰੋ:\n\n• 112 - ਕੌਮੀ ਐਮਰਜੈਂਸੀ\n• 102 - ਐਂਬੂਲੈਂਸ\n• 108 - ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ", hello: "🙏 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ZyntraCare AI ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n\n• 🏥 ਹਸਪਤਾਲ ਲੱਭਣ ਵਿੱਚ\n• 📅 ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਵਿੱਚ\n• 🩺 ਲੱਛਣ ਜਾਂਚ\n• 💊 ਦਵਾਈ ਜਾਣਕਾਰੀ\n• 🚨 ਐਮਰਜੈਂਸੀ ਮਦਦ", hospital: "🏥 ਨੇੜਲੇ ਹਸਪਤਾਲ ਲੱਭਣ ਵਿੱਚ ਮੈਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।", appointment: "📅 ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਲਈ /specialists ਪੇਜ 'ਤੇ ਜਾਓ।", symptom: "🩺 ਲੱਛਣ ਜਾਂਚ ਲਈ /symptoms ਪੇਜ 'ਤੇ ਜਾਓ।", medicine: "💊 ਦਵਾਈ ਜਾਣਕਾਰੀ ਲਈ /pill-scanner ਪੇਜ 'ਤੇ ਜਾਓ।", insurance: "🛡️ ਸਿਹਤ ਬੀਮੇ ਲਈ /subscription ਪੇਜ 'ਤੇ ਜਾਓ।", default: "🙏 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ZyntraCare AI ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ।" },
  hinglish: { name: 'Hinglish', emergency: '🚨 Emergency! Please turant in numbers pe call karo:\n\n• 112 - National Emergency\n• 102 - Ambulance\n• 108 - Emergency Services\n\nKya aapko nearest hospital dhundhne mein help chahiye?', hello: '🙏 Namaste! Main ZyntraCare AI hun. Main aapki help kar sakta hun:\n\n• 🏥 Hospitals dhundhne mein\n• 📅 Appointments book karne mein\n• 🩺 Symptoms check karne mein\n• 💊 Dawai ki jaankari mein\n• 🚨 Emergency mein help\n\nAapko kis cheez mein help chahiye?', hospital: '🏥 Main aapko nearby hospitals dhundhne mein help kar sakta hun.', appointment: '📅 Appointment book karne ke liye /specialists page pe jao.', symptom: '🩺 Symptoms check karne ke liye /symptoms page pe jao.', medicine: '💊 Dawai ki jaankari ke liye /pill-scanner page pe jao.', insurance: '🛡️ Health insurance ke liye /subscription page pe jao.', default: '🙏 Namaste! Main ZyntraCare AI hun. Main aapki help kar sakta hun.' },
};

function getSmartResponse(message: string, lang: string): string {
  const lower = message.toLowerCase();
  const t = LANG_MAP[lang] || LANG_MAP.en;

  if (lower.includes('emergency') || lower.includes('help') || lower.includes('urgent') || lower.includes('accident')) {
    return t.emergency;
  }
  if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('clinic')) {
    return t.hospital;
  }
  if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
    return t.appointment;
  }
  if (lower.includes('symptom') || lower.includes('fever') || lower.includes('pain') || lower.includes('sick')) {
    return t.symptom;
  }
  if (lower.includes('medicine') || lower.includes('drug') || lower.includes('pill') || lower.includes('pharmacy')) {
    return t.medicine;
  }
  if (lower.includes('insurance') || lower.includes('plan') || lower.includes('premium')) {
    return t.insurance;
  }
  return t.default;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const langName = LANG_MAP[language]?.name || 'English';

    const SYSTEM_PROMPT = `You are ZyntraCare AI Health Assistant, a professional healthcare chatbot for Indian users.

CRITICAL: You MUST respond in ${langName} (${language}). Match the user's language. If they write in Hindi, respond in Hindi. If they write in English, respond in English. If they write in Hinglish, respond in Hinglish. If they write in Bengali/Tamil/Telugu/Marathi/Kannada/Malayalam/Punjabi, respond in that language.

Your responsibilities:
1. Provide accurate health information in simple language
2. Help users find hospitals, doctors, and healthcare services
3. Guide users through symptom checking
4. Provide emergency assistance guidance

Important guidelines:
- Always recommend consulting a doctor for serious symptoms
- Never diagnose or prescribe medication
- Provide general health information only
- For emergencies, immediately direct to call 112/102/108
- Be empathetic and professional
- Keep responses concise and helpful
- ALWAYS respond in ${langName}

Available actions:
- Finding hospitals nearby (/hospitals)
- Booking appointments (/specialists)
- Emergency services (112, 102, 108)
- Symptom checking (/symptoms)
- Medicine information (/pill-scanner)
- Health tips and wellness`;

    // Priority 1: Try Gemini with language-aware prompt
    const conversationContext = conversationHistory
      .slice(-10)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationContext ? 'Previous conversation:\n' + conversationContext + '\n\n' : ''}User: ${message}\n\nAssistant:`;

    let reply = await generateChatResponse(message, conversationHistory, SYSTEM_PROMPT);
    let source = 'gemini';

    // Priority 2: Try Ollama
    if (!reply) {
      try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: [{ role: 'user', content: fullPrompt }],
            stream: false
          })
        });
        if (response.ok) {
          const data = await response.json();
          reply = data.message?.content || null;
          source = 'ollama';
        }
      } catch {}
    }

    // Priority 3: Smart multilingual fallback
    if (!reply) {
      reply = getSmartResponse(message, language);
      source = 'smart-fallback';
    }

    return NextResponse.json({ reply, source, language });
  } catch (error) {
    console.error('Chat error:', error);
    const lang = 'en';
    return NextResponse.json({
      reply: 'I apologize for the technical difficulty. For immediate health concerns, please call 112 (emergency) or 102 (ambulance). How can I help you?',
      source: 'error-fallback',
      language: lang
    });
  }
}
