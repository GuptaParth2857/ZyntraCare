import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

declare global {
  // eslint-disable-next-line no-var
  var __hhGemini: { genAI: GoogleGenerativeAI; modelName: string } | undefined;
}

function getMockResponse(message: string, language: string): string {
  const lower = message.toLowerCase();
  const isHindi = language === 'hi';

  if (lower.includes('emergency') || lower.includes('ambulance') || lower.includes('आपातकालीन') || lower.includes('एम्बुलेंस')) {
    return isHindi
      ? '🚨 आपातकालीन स्थिति के लिए:\n• एम्बुलेंस: 102 या 108\n• पुलिस: 100\n• अग्निशमन: 101\n\nकृपया तुरंत कॉल करें या हमारे Emergency पेज पर जाएं।'
      : '🚨 For emergencies:\n• Ambulance: 102 or 108\n• Police: 100\n• Fire: 101\n\nPlease call immediately or visit our Emergency page for more numbers.';
  }
  if (lower.includes('appointment') || lower.includes('book') || lower.includes('अपॉइंटमेंट') || lower.includes('बुक')) {
    return isHindi
      ? '📅 अपॉइंटमेंट बुक करने के लिए:\n1. Specialists पेज पर जाएं\n2. विशेषज्ञ चुनें\n3. "Book Appointment" बटन क्लिक करें\n\nक्या आप किसी विशेष विशेषज्ञ की तलाश कर रहे हैं?'
      : '📅 To book an appointment:\n1. Go to the Specialists page\n2. Choose your specialist\n3. Click "Book Appointment"\n\nAre you looking for a specific type of specialist?';
  }
  if (lower.includes('hospital') || lower.includes('अस्पताल') || lower.includes('nearest') || lower.includes('नज़दीकी')) {
    return isHindi
      ? '🏥 नज़दीकी अस्पताल खोजने के लिए:\n• Hospitals पेज पर जाएं\n• Map व्यू पर क्लिक करें\n• अपनी लोकेशन allow करें\n\nहमारे पास 500+ सत्यापित अस्पताल हैं।'
      : '🏥 To find nearby hospitals:\n• Go to the Hospitals page\n• Click the Map view icon\n• Allow your location access\n\nWe have 500+ verified hospitals with real-time bed availability.';
  }
  if (lower.includes('bed') || lower.includes('बेड') || lower.includes('availability') || lower.includes('उपलब्ध')) {
    return isHindi
      ? '🛏️ बेड उपलब्धता जांचने के लिए Hospitals पेज पर जाएं। हर अस्पताल कार्ड पर बेड की जानकारी दिखाई देती है:\n• हरा = उपलब्ध\n• लाल = भरे हुए\n• नीला = ICU'
      : '🛏️ Check bed availability on the Hospitals page. Each hospital card shows:\n• Green = Available beds\n• Red = Occupied\n• Blue = ICU availability\n\nYou can also use the Map view to see all hospitals at a glance.';
  }
  if (lower.includes('doctor') || lower.includes('specialist') || lower.includes('डॉक्टर') || lower.includes('विशेषज्ञ')) {
    return isHindi
      ? '👨‍⚕️ विशेषज्ञ खोजने के लिए:\n• Specialists पेज पर जाएं\n• Specialty, Location, या Rating से फ़िल्टर करें\n• Online consultation भी उपलब्ध है\n\nकिस तरह के डॉक्टर की तलाश है?'
      : '👨‍⚕️ To find specialists:\n• Visit the Specialists page\n• Filter by Specialty, Location, or Rating\n• Online consultation available\n\nWhat type of doctor are you looking for?';
  }
  if (lower.includes('health tip') || lower.includes('स्वास्थ्य') || lower.includes('tip')) {
    return isHindi
      ? '💡 स्वास्थ्य सुझाव:\n• रोजाना 8 गिलास पानी पिएं\n• 7-8 घंटे की नींद लें\n• फल और सब्जियां खाएं\n• रोजाना 30 मिनट व्यायाम करें\n• तनाव से बचें, योग करें'
      : '💡 Health Tips:\n• Drink 8 glasses of water daily\n• Get 7-8 hours of sleep\n• Eat fruits and vegetables\n• Exercise 30 min daily\n• Practice stress management\n• Get regular health checkups';
  }
  if (lower.includes('medicine') || lower.includes('दवाई') || lower.includes('tablet')) {
    return isHindi
      ? '💊 दवाई संबंधित जानकारी:\n• हमेशा डॉक्टर की सलाह पर दवाई लें\n• Medicine delivery सेवा उपलब्ध है\n• Dashboard से prescription अपलोड करें\n\nक्या आप कोई विशेष दवाई ढूंढ रहे हैं?'
      : '💊 Medicine information:\n• Always take medicines as prescribed\n• Medicine delivery service available\n• Upload prescriptions via Dashboard\n\nAre you looking for a specific medicine?';
  }
  if (lower.includes('camp') || lower.includes('शिविर') || lower.includes('checkup') || lower.includes('जांच')) {
    return isHindi
      ? '🏕️ आगामी स्वास्थ्य शिविर:\n• Health Camps पेज पर सभी शिविर देखें\n• कई शिविर मुफ्त हैं\n• अभी रजिस्टर करें!\n\nक्या आप किसी विशेष शहर में शिविर ढूंढ रहे हैं?'
      : '🏕️ Upcoming Health Camps:\n• View all camps on Health Camps page\n• Many camps are FREE\n• Register now!\n\nLooking for camps in a specific city?';
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('namaste') || lower.includes('नमस्ते')) {
    return isHindi
      ? '🙏 नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?\n\nआप मुझसे पूछ सकते हैं:\n• अस्पताल खोजें\n• डॉक्टर से अपॉइंटमेंट\n• आपातकालीन मदद\n• स्वास्थ्य सुझाव'
      : '🙏 Namaste! I\'m your Health Assistant. How can I help you today?\n\nYou can ask me about:\n• Finding hospitals\n• Doctor appointments\n• Emergency help\n• Health tips';
  }

  return isHindi
    ? '🤖 मैं आपकी मदद के लिए यहां हूं! आप मुझसे पूछ सकते हैं:\n• अस्पताल और बेड उपलब्धता\n• डॉक्टर अपॉइंटमेंट\n• आपातकालीन सेवाएं\n• स्वास्थ्य सुझाव\n• दवाई जानकारी'
    : '🤖 I\'m here to help! You can ask me about:\n• Hospitals & bed availability\n• Doctor appointments\n• Emergency services\n• Health tips & medicines\n• Health camps near you';
}

export async function POST(req: Request) {
  let message = '', language = 'en', history: any[] = [];
  try {
    const body = await req.json();
    message = body.message || '';
    language = body.language || 'en';
    history = body.history || [];
  } catch {
    return NextResponse.json({ reply: 'Invalid request.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ reply: getMockResponse(message, language) });
  }

  try {
    // Cache the client/model choice across invocations (server runtime).
    if (!globalThis.__hhGemini) {
      globalThis.__hhGemini = { genAI: new GoogleGenerativeAI(apiKey), modelName: 'gemini-1.5-flash' };
    }
    const { genAI, modelName } = globalThis.__hhGemini;
    const model = genAI.getGenerativeModel({ model: modelName });

    const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', mr: 'Marathi' };
    const langName = langMap[language] || 'English';

    const systemPrompt = `You are "ZyntraCare Sentient AI", an advanced clinical symptom analyzer and medical advisor for an Indian healthcare platform. Respond in ${langName} language.
Analyze the user's symptoms thoroughly based on vast medical literature. If the user describes a problem or disease, you MUST:
1. Provide a step-by-step analysis of possible causes (differential diagnosis).
2. Offer clear, actionable solutions, including evidence-based home remedies, OTC suggestions if safe, and lifestyle changes.
3. Keep responses highly structured using bullet points and a professional tone. (Under 200 words).
4. If it sounds like a severe emergency, immediately trigger a high-priority warning to call 102 (Ambulance) or 108.
5. Always end with a strong medical disclaimer: "🩺 Note: This AI analysis is for informational purposes and cannot replace a doctor's diagnosis."`;

    const historyText = history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nConversation:\n${historyText}\nUser: ${message}\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: getMockResponse(message, language) });
  }
}