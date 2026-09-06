import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
  return genAI;
}

function getModel(modelName: string = 'gemini-2.0-flash'): GenerativeModel {
  const client = getClient();
  if (!client) throw new Error('GEMINI_API_KEY not configured');
  if (!model || modelName !== 'gemini-2.0-flash') {
    model = client.getGenerativeModel({ model: modelName });
  }
  return model;
}

export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

export async function generateHealthResponse(prompt: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    return result.response.text() || null;
  } catch (error) {
    console.error('[Gemini] Health response error:', error);
    return null;
  }
}

export async function generateSymptomAnalysis(
  symptoms: string[],
  patientAge?: number,
  patientGender?: string,
  duration?: string,
  severity?: string,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const prompt = `You are a medical AI assistant. Analyze these symptoms and provide:
1. Possible conditions (with probability %)
2. Urgency level (self-care / consult-doctor / emergency)
3. Red flags to watch for
4. Recommended tests
5. When to seek immediate help

Symptoms: ${symptoms.join(', ')}
${duration ? `Duration: ${duration.replace('-', ' ')}` : ''}
${severity ? `Severity: ${severity}` : ''}
${patientAge ? `Age: ${patientAge}` : ''}
${patientGender ? `Gender: ${patientGender}` : ''}

Respond in JSON format:
{
  "possibleConditions": [{"name": "...", "probability": 0-100, "severity": "mild/medium/high/critical", "category": "...", "recommendation": "..."}],
  "urgencyLevel": "self-care|consult-doctor|emergency",
  "redFlags": ["..."],
  "suggestedTests": ["..."],
  "aiAnalysis": "Brief analysis text"
}

IMPORTANT: This is for informational purposes only. Always recommend consulting a real doctor.`;

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    return result.response.text() || null;
  } catch (error) {
    console.error('[Gemini] Symptom analysis error:', error);
    return null;
  }
}

export async function generateTriageAssessment(
  symptoms: string[],
  vitals?: { heartRate?: number; bloodPressure?: string; temperature?: number; oxygenSat?: number },
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const prompt = `You are an emergency triage AI. Assess these symptoms and vitals:

Symptoms: ${symptoms.join(', ')}
${vitals?.heartRate ? `Heart Rate: ${vitals.heartRate} bpm` : ''}
${vitals?.bloodPressure ? `Blood Pressure: ${vitals.bloodPressure}` : ''}
${vitals?.temperature ? `Temperature: ${vitals.temperature}°F` : ''}
${vitals?.oxygenSat ? `SpO2: ${vitals.oxygenSat}%` : ''}

Provide triage assessment in JSON:
{
  "triageLevel": 1-5 (1=critical, 5=non-urgent),
  "urgency": "critical|high|medium|low",
  "requiresAmbulance": true/false,
  "requiresICU": true/false,
  "possibleConditions": ["..."],
  "recommendedAction": "...",
  "estimatedWaitMinutes": number
}

For Indian emergency context: 102 (ambulance), 108 (emergency), 112 (national).`;

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    return result.response.text() || null;
  } catch (error) {
    console.error('[Gemini] Triage assessment error:', error);
    return null;
  }
}

export async function generateHospitalRecommendation(
  userLocation: { lat: number; lng: number },
  symptoms: string[],
  preferences?: { budget?: string; specialty?: string },
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const prompt = `You are a hospital recommendation AI for Indian healthcare.

Patient location: ${userLocation.lat}, ${userLocation.lng}
Symptoms: ${symptoms.join(', ')}
${preferences?.budget ? `Budget: ${preferences.budget}` : ''}
${preferences?.specialty ? `Preferred specialty: ${preferences.specialty}` : ''}

Recommend the best approach for finding a hospital in JSON:
{
  "recommendedSpecialty": "...",
  "urgencyLevel": "emergency|urgent|routine",
  "searchRadius": "km",
  "keyFactors": ["..."],
  "advice": "..."
}`;

  try {
    const m = getModel();
    const result = await m.generateContent(prompt);
    return result.response.text() || null;
  } catch (error) {
    console.error('[Gemini] Hospital recommendation error:', error);
    return null;
  }
}

export async function generateChatResponse(
  message: string,
  conversationHistory: { role: string; content: string }[] = [],
  systemPrompt?: string,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const defaultSystem = `You are ZyntraCare AI Health Assistant, a professional healthcare chatbot for Indian users.
Provide accurate health information in simple language. Never diagnose or prescribe medication.
For emergencies, direct to call 112/102/108. Be empathetic and professional.
Respond in the same language the user uses.`;

  const historyContext = conversationHistory
    .slice(-10)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt || defaultSystem}

${historyContext ? 'Previous conversation:\n' + historyContext + '\n\n' : ''}User: ${message}

Assistant:`;

  try {
    const m = getModel();
    const result = await m.generateContent(fullPrompt);
    return result.response.text() || null;
  } catch (error) {
    console.error('[Gemini] Chat response error:', error);
    return null;
  }
}
