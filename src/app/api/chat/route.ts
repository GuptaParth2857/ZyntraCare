import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error('Gemini error:', error);
    return null;
  }
}

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
  } catch (error) {
    return null;
  }
}

const HEALTH_SYSTEM_PROMPT = `You are ZyntraCare AI Health Assistant, a professional healthcare chatbot for Indian users.

Your responsibilities:
1. Provide accurate health information in simple language
2. Help users find hospitals, doctors, and healthcare services
3. Guide users through symptom checking
4. Provide emergency assistance guidance
5. Support multiple languages (English, Hindi, Hinglish)

Important guidelines:
- Always recommend consulting a doctor for serious symptoms
- Never diagnose or prescribe medication
- Provide general health information only
- For emergencies, immediately direct to call 112/102/108
- Be empathetic and professional
- Keep responses concise and helpful

Available actions users might ask about:
- Finding hospitals nearby
- Booking appointments
- Emergency services (112, 102, 108)
- Symptom checking
- Medicine information
- Health tips and wellness
- Insurance and health plans

Respond in the same language the user uses. If they use Hindi or Hinglish, respond in kind.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-10)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = `${HEALTH_SYSTEM_PROMPT}\n\n${conversationContext ? 'Previous conversation:\n' + conversationContext + '\n\n' : ''}User: ${message}\n\nAssistant:`;

    // Try Ollama first (local, faster)
    let reply = await callOllama(fullPrompt);
    let source = 'ollama';

    // Try Gemini if Ollama fails
    if (!reply && GEMINI_API_KEY) {
      reply = await callGemini(fullPrompt);
      source = 'gemini';
    }

    // Fallback to smart responses if both fail
    if (!reply) {
      reply = getSmartResponse(message, language);
      source = 'smart-fallback';
    }

    return NextResponse.json({ reply, source });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ 
      reply: 'I apologize for the technical difficulty. For immediate health concerns, please call 112 (emergency) or 102 (ambulance). How can I help you?',
      source: 'error-fallback' 
    });
  }
}

function getSmartResponse(message: string, language: string): string {
  const lower = message.toLowerCase();

  // Emergency detection
  if (lower.includes('emergency') || lower.includes('help') || lower.includes('urgent') || lower.includes('accident')) {
    return language === 'hi'
      ? '🚨 आपातकाल! कृपया तुरंत इन नंबरों पर कॉल करें:\n\n• 112 - राष्ट्रीय आपातकाल\n• 102 - एम्बुलेंस\n• 108 - आपातकालीन सेवा\n\nक्या आपको नज़दीकी अस्पताल खोजने में मदद चाहिए?'
      : '🚨 Emergency! Please call immediately:\n\n• 112 - National Emergency\n• 102 - Ambulance\n• 108 - Emergency Services\n\nDo you need help finding a nearby hospital?';
  }

  // Hospital search
  if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('clinic')) {
    return language === 'hi'
      ? '🏥 मैं आपको नज़दीकी अस्पताल खोजने में मदद कर सकता हूं। कृपया बताएं:\n\n1. आपका शहर क्या है?\n2. किस विशेषज्ञ की ज़रूरत है?\n\nया आप /hospitals पेज पर जा सकते हैं।'
      : '🏥 I can help you find nearby hospitals. Please tell me:\n\n1. Your city name\n2. What specialty do you need?\n\nOr visit the /hospitals page for a live map.';
  }

  // Appointment
  if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
    return language === 'hi'
      ? '📅 अपॉइंटमेंट बुक करने के लिए:\n\n1. /specialists पेज पर जाएं\n2. अपना डॉक्टर चुनें\n3. समय चुनें\n\nक्या आप किसी विशेष डॉक्टर की तलाश में हैं?'
      : '📅 To book an appointment:\n\n1. Visit the /specialists page\n2. Choose your doctor\n3. Select a time slot\n\nAre you looking for a specific doctor?';
  }

  // Symptoms
  if (lower.includes('symptom') || lower.includes('fever') || lower.includes('pain') || lower.includes('sick')) {
    return language === 'hi'
      ? '🩺 लक्षण जांच के लिए:\n\n1. /symptoms पेज पर जाएं\n2. अपने लक्षण चुनें\n3. AI विश्लेषण प्राप्त करें\n\n⚠️ गंभीर लक्षणों के लिए तुरंत डॉक्टर से संपर्क करें।'
      : '🩺 For symptom checking:\n\n1. Visit the /symptoms page\n2. Select your symptoms\n3. Get AI-powered analysis\n\n⚠️ For severe symptoms, consult a doctor immediately.';
  }

  // Medicine
  if (lower.includes('medicine') || lower.includes('drug') || lower.includes('pill') || lower.includes('pharmacy')) {
    return language === 'hi'
      ? '💊 दवाई की जानकारी के लिए:\n\n1. /pill-scanner पेज पर जाएं\n2. दवाई का नाम लिखें या फोटो अपलोड करें\n3. पूरी जानकारी प्राप्त करें\n\n📍 नज़दीकी फार्मेसी खोजने के लिए /pharmacies देखें।'
      : '💊 For medicine information:\n\n1. Visit the /pill-scanner page\n2. Enter medicine name or upload photo\n3. Get complete information\n\n📍 Find nearby pharmacies at /pharmacies.';
  }

  // Insurance
  if (lower.includes('insurance') || lower.includes('plan') || lower.includes('premium')) {
    return language === 'hi'
      ? '🛡️ स्वास्थ्य बीमा:\n\n1. /subscription पेज पर जाएं\n2. अपना प्लान चुनें\n3. प्रीमियम सुविधाएं प्राप्त करें\n\nहमारे प्लान:\n• Free: बुनियादी सुविधाएं\n• Premium: AI विश्लेषण, असीमित अपॉइंटमेंट'
      : '🛡️ Health Insurance:\n\n1. Visit the /subscription page\n2. Choose your plan\n3. Get premium features\n\nOur plans:\n• Free: Basic features\n• Premium: AI analysis, unlimited appointments';
  }

  // Default response
  return language === 'hi'
    ? '🙏 नमस्ते! मैं ZyntraCare AI हूं। मैं आपकी मदद कर सकता हूं:\n\n• 🏥 अस्पताल खोजने में\n• 📅 अपॉइंटमेंट बुक करने में\n• 🩺 लक्षण जांच में\n• 💊 दवाई की जानकारी में\n• 🚨 आपातकाल में मदद\n\nआपको किस चीज़ में मदद चाहिए?'
    : '🙏 Hello! I\'m ZyntraCare AI Health Assistant. I can help you with:\n\n• 🏥 Finding hospitals\n• 📅 Booking appointments\n• 🩺 Symptom checking\n• 💊 Medicine information\n• 🚨 Emergency assistance\n\nHow can I assist you today?';
}
