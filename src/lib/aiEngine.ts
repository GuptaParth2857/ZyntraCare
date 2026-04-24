// ZyntraCare AI Engine - RAG (Retrieval Augmented Generation) System
// This is our custom AI that uses local knowledge base for responses

import { 
  healthcareKnowledge, 
  HealthKnowledge,
  searchBySymptom, 
  searchByDisease, 
  searchByMedicine,
  semanticSearch,
  getFirstAid,
  getEmergencyInfo,
  getByCategory
} from '@/data/healthcareKnowledge';

export interface AIRequest {
  query: string;
  context?: string;
  mode?: 'chat' | 'symptom_checker' | 'medicine_info' | 'first_aid' | 'emergency';
  language?: 'en' | 'hi';
  userSymptoms?: string[];
}

export interface AIResponse {
  success: boolean;
  response: string;
  sources: HealthKnowledge[];
  suggestions: string[];
  isEmergency: boolean;
  mode: string;
}

interface ConversationContext {
  lastTopic?: string;
  userSymptoms: string[];
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

// Intent detection - determines what the user is asking about
function detectIntent(query: string): AIRequest['mode'] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || 
      lowerQuery.includes('serious') || lowerQuery.includes('danger')) {
    return 'emergency';
  }
  
  if (lowerQuery.includes('first aid') || lowerQuery.includes('how to treat') ||
      lowerQuery.includes('help') || lowerQuery.includes('what to do')) {
    return 'first_aid';
  }
  
  if (lowerQuery.includes('symptom') || lowerQuery.includes('feeling') ||
      lowerQuery.includes('ache') || lowerQuery.includes('pain') ||
      lowerQuery.includes('sick') || lowerQuery.includes('unwell')) {
    return 'symptom_checker';
  }
  
  if (lowerQuery.includes('medicine') || lowerQuery.includes('tablet') ||
      lowerQuery.includes('capsule') || lowerQuery.includes('drug') ||
      lowerQuery.includes('pill') || lowerQuery.includes('dose')) {
    return 'medicine_info';
  }
  
  return 'chat';
}

// Language detection
function detectLanguage(text: string): 'en' | 'hi' {
  const hindiIndicators = ['kya', 'hai', 'ka', 'ki', 'ko', 'se', 'meri', 'apka', 'hamara', 'bataye', 'kyu', 'kaise', 'kab'];
  const words = text.toLowerCase().split(/\s+/);
  let hindiScore = 0;
  
  for (const word of words) {
    if (hindiIndicators.includes(word)) hindiScore++;
  }
  
  return hindiScore > 2 ? 'hi' : 'en';
}

// Severity assessment
function assessSeverity(symptoms: string[], results: HealthKnowledge[]): 'low' | 'medium' | 'high' | 'emergency' {
  const emergencyKeywords = ['chest pain', 'shortness of breath', 'unconscious', 'bleeding', 'severe', 'stroke', 'heart attack'];
  const highKeywords = ['fever', 'vomiting', 'diarrhea', 'headache', 'cough'];
  
  const hasEmergency = symptoms.some(s => emergencyKeywords.some(k => s.toLowerCase().includes(k)));
  const hasHighSeverity = symptoms.some(s => highKeywords.some(k => s.toLowerCase().includes(k)));
  
  const resultsHaveEmergency = results.some(r => r.severity === 'emergency');
  const resultsHaveHigh = results.some(r => r.severity === 'high');
  
  if (hasEmergency || resultsHaveEmergency) return 'emergency';
  if (hasHighSeverity || resultsHaveHigh) return 'high';
  
  return 'medium';
}

// Build context from conversation history
function buildContext(context: ConversationContext | undefined, query: string): string {
  if (!context) return '';
  
  let ctx = '';
  if (context.lastTopic) {
    ctx += `Previous topic: ${context.lastTopic}. `;
  }
  if (context.userSymptoms.length > 0) {
    ctx += `User reported symptoms: ${context.userSymptoms.join(', ')}. `;
  }
  ctx += `Current query: ${query}`;
  
  return ctx;
}

// Generate response based on mode
function generateResponse(
  results: HealthKnowledge[], 
  mode: AIRequest['mode'],
  language: 'en' | 'hi',
  query: string
): { response: string; suggestions: string[]; isEmergency: boolean } {
  const isEmergency = results.some(r => r.severity === 'emergency');
  
  if (language === 'hi') {
    return generateHindiResponse(results, mode, query);
  }
  
  switch (mode) {
    case 'symptom_checker':
      return generateSymptomResponse(results);
    case 'medicine_info':
      return generateMedicineResponse(results);
    case 'first_aid':
      return generateFirstAidResponse(results);
    case 'emergency':
      return generateEmergencyResponse(results);
    default:
      return generateChatResponse(results);
  }
}

function generateSymptomResponse(results: HealthKnowledge[]): { response: string; suggestions: string[]; isEmergency: boolean } {
  if (results.length === 0) {
    return {
      response: "I couldn't find specific information for those symptoms. Please consult a doctor for proper diagnosis. For immediate guidance, call 108 (emergency services).",
      suggestions: ['Consult a doctor', 'Call 108 for emergencies', 'Visit nearest clinic'],
      isEmergency: false
    };
  }
  
  const mainResult = results[0];
  const otherResults = results.slice(1, 3);
  
  let response = `Based on your symptoms, this could be related to **${mainResult.title}**.\n\n`;
  response += `**Description:** ${mainResult.description}\n\n`;
  
  if (mainResult.symptoms && mainResult.symptoms.length > 0) {
    response += `**Common symptoms:** ${mainResult.symptoms.slice(0, 5).join(', ')}\n\n`;
  }
  
  if (mainResult.treatments && mainResult.treatments.length > 0) {
    response += `**Treatment options:**\n`;
    mainResult.treatments.forEach((t, i) => response += `${i + 1}. ${t}\n`);
    response += '\n';
  }
  
  if (mainResult.when_to_doctor && mainResult.when_to_doctor.length > 0) {
    response += `**⚠️ Consult a doctor if:** ${mainResult.when_to_doctor.join(', ')}\n\n`;
  }
  
  if (mainResult.severity === 'emergency' || mainResult.severity === 'high') {
    response += `**🔴 This condition requires medical attention. Please consult a doctor immediately.**\n`;
  }
  
  if (otherResults.length > 0) {
    response += `**Other possible conditions:** ${otherResults.map(r => r.title).join(', ')}\n`;
  }
  
  const suggestions = [
    'Rest and monitor symptoms',
    'Stay hydrated',
    'Consult a doctor if symptoms worsen',
    'Call 108 for emergencies'
  ];
  
  return { response, suggestions, isEmergency: mainResult.severity === 'emergency' };
}

function generateMedicineResponse(results: HealthKnowledge[]): { response: string; suggestions: string[]; isEmergency: boolean } {
  if (results.length === 0) {
    return {
      response: "I couldn't find specific information about that medicine. Please consult a doctor or pharmacist before taking any medication.",
      suggestions: ['Consult a doctor', 'Ask a pharmacist', 'Check medicine package insert'],
      isEmergency: false
    };
  }
  
  const mainResult = results[0];
  
  let response = `**${mainResult.title}**\n\n`;
  response += `${mainResult.description}\n\n`;
  
  if (mainResult.medicine_names && mainResult.medicine_names.length > 0) {
    response += `**Related medicines:** ${mainResult.medicine_names.join(', ')}\n\n`;
  }
  
  if (mainResult.treatments) {
    response += `**General treatment approach:**\n`;
    mainResult.treatments.forEach(t => response += `- ${t}\n`);
    response += '\n';
  }
  
  response += `**⚠️ Important:** Always consult a doctor before starting any medication. Do not self-medicate.\n`;
  
  return { response, suggestions: ['Consult doctor', 'Read package insert', 'Check dosage'], isEmergency: false };
}

function generateFirstAidResponse(results: HealthKnowledge[]): { response: string; suggestions: string[]; isEmergency: boolean } {
  if (results.length === 0) {
    return {
      response: "I don't have specific first aid instructions for that situation. Please call emergency services (108) immediately.",
      suggestions: ['Call 108', 'Stay calm', 'Describe situation to dispatcher'],
      isEmergency: true
    };
  }
  
  const mainResult = results[0];
  
  let response = `**🩹 First Aid: ${mainResult.title}**\n\n`;
  response += `${mainResult.description}\n\n`;
  
  if (mainResult.treatments && mainResult.treatments.length > 0) {
    response += `**Immediate steps:**\n`;
    mainResult.treatments.forEach((t, i) => response += `${i + 1}. ${t}\n`);
    response += '\n';
  }
  
  response += `**⚠️ When to seek medical help:** ${mainResult.when_to_doctor?.join(', ') || 'If symptoms persist or worsen'}\n`;
  
  return { response, suggestions: ['Follow steps immediately', 'Call 108 if needed', 'Stay with the person'], isEmergency: true };
}

function generateEmergencyResponse(results: HealthKnowledge[]): { response: string; suggestions: string[]; isEmergency: boolean } {
  let response = `**🚨 EMERGENCY INFORMATION**\n\n`;
  
  if (results.length > 0) {
    const relevantEmergency = results[0];
    
    if (relevantEmergency) {
      response += `**${relevantEmergency.title}**\n\n`;
      response += `${relevantEmergency.description}\n\n`;
      response += `**⚠️ CALL EMERGENCY SERVICES (108) IMMEDIATELY!**\n\n`;
      response += `**Signs to watch for:**\n`;
      relevantEmergency.symptoms?.forEach((s: string) => response += `- ${s}\n`);
      response += '\n';
      response += `**Immediate actions:**\n`;
      relevantEmergency.treatments?.slice(0, 5).forEach((t: string) => response += `- ${t}\n`);
    }
  }
  
  return { response, suggestions: ['Call 108 immediately', 'Stay calm', 'Follow dispatcher instructions', 'Stay with the person'], isEmergency: true };
}

function generateChatResponse(results: HealthKnowledge[]): { response: string; suggestions: string[]; isEmergency: boolean } {
  if (results.length === 0) {
    return {
      response: "I'm here to help with health-related questions. You can ask me about symptoms, medicines, first aid, or any health concerns. How can I assist you today?",
      suggestions: ['Ask about symptoms', 'Search for medicine info', 'Get first aid guidance', 'Learn about a condition'],
      isEmergency: false
    };
  }
  
  const mainResult = results[0];
  
  let response = `I found some information about **${mainResult.title}**.\n\n`;
  response += `${mainResult.description}\n\n`;
  
  if (mainResult.treatments) {
    response += `**Treatment options:** ${mainResult.treatments.slice(0, 3).join(', ')}\n`;
  }
  
  const suggestions = ['Get more details', 'Check symptoms', 'Find medicines', 'First aid tips'];
  
  return { response, suggestions, isEmergency: mainResult.severity === 'emergency' };
}

function generateHindiResponse(results: HealthKnowledge[], mode: AIRequest['mode'], query: string): { response: string; suggestions: string[]; isEmergency: boolean } {
  const result = results[0];
  
  if (!result) {
    return {
      response: "मुझे इस विषय पर जानकारी नहीं मिली। कृपया डॉक्टर से मिलें। आपातकालीन स्थिति में 108 पर कॉल करें।",
      suggestions: ['डॉक्टर से मिलें', '108 पर कॉल करें', 'निकटतम क्लिनिक जाएं'],
      isEmergency: false
    };
  }
  
  let response = `**${result.title}** के बारे में जानकारी:\n\n`;
  response += `${result.description}\n\n`;
  
  if (result.symptoms) {
    response += `**लक्षण:** ${result.symptoms.slice(0, 5).join(', ')}\n`;
  }
  
  if (result.severity === 'emergency') {
    response += `\n⚠️ **यह आपातकालीन स्थिति है! तुरंत 108 पर कॉल करें।**\n`;
  }
  
  return { response, suggestions: ['डॉक्टर से मिलें', 'विस्तार जानें', 'दवाई की जानकारी'], isEmergency: result.severity === 'emergency' };
}

// Main AI processing function
export async function processAIRequest(request: AIRequest, context?: ConversationContext): Promise<AIResponse> {
  try {
    const { query, mode: requestedMode, language: requestedLang } = request;
    
    // Detect language if not specified
    const language = requestedLang || detectLanguage(query);
    
    // Detect intent if mode not specified
    const mode = requestedMode || detectIntent(query);
    
    // Extract potential symptoms from query
    const extractedSymptoms = extractSymptoms(query);
    const allSymptoms = [...(request.userSymptoms || []), ...extractedSymptoms];
    
    // Build search context
    const fullQuery = buildContext(context, query);
    
    // Search knowledge base
    let results: HealthKnowledge[] = [];
    
    switch (mode) {
      case 'symptom_checker':
        results = extractedSymptoms.flatMap(s => searchBySymptom(s));
        if (results.length === 0) results = semanticSearch(query, 5);
        break;
      case 'medicine_info':
        results = searchByMedicine(query);
        if (results.length === 0) results = semanticSearch(query, 5);
        break;
      case 'first_aid':
        const firstAidResult = getFirstAid(query);
        results = firstAidResult ? [firstAidResult] : semanticSearch(query, 3);
        break;
      case 'emergency':
        results = getEmergencyInfo();
        break;
      default:
        results = semanticSearch(query, 5);
    }
    
    // Deduplicate results
    const uniqueResults = results.filter((r, i, arr) => 
      arr.findIndex(x => x.id === r.id) === i
    );
    
    // Generate response
    const { response, suggestions, isEmergency } = generateResponse(uniqueResults, mode, language, query);
    
    // Calculate severity
    const severity = assessSeverity(allSymptoms, uniqueResults);
    
    return {
      success: true,
      response,
      sources: uniqueResults.slice(0, 3),
      suggestions,
      isEmergency: isEmergency || severity === 'emergency',
      mode
    };
    
  } catch (error) {
    console.error('AI Processing Error:', error);
    return {
      success: false,
      response: "I'm experiencing technical difficulties. Please try again or consult a healthcare professional directly.",
      sources: [],
      suggestions: ['Consult a doctor', 'Call 108 for emergencies'],
      isEmergency: false,
      mode: 'chat'
    };
  }
}

// Extract symptoms from text
function extractSymptoms(text: string): string[] {
  const symptomPatterns = [
    'fever', 'headache', 'cough', 'cold', 'vomiting', 'nausea', 'diarrhea',
    'pain', 'ache', 'fatigue', 'tired', 'dizzy', 'breathing', 'chest',
    'stomach', 'throat', 'body pain', 'muscle', 'joint', 'back pain',
    'rash', 'swelling', 'burning', 'sweating', 'chills', 'sneezing'
  ];
  
  const lowerText = text.toLowerCase();
  return symptomPatterns.filter(symptom => lowerText.includes(symptom));
}

// Check if query is emergency
export function isEmergencyQuery(query: string): boolean {
  const emergencyKeywords = [
    'emergency', 'urgent', 'dying', 'unconscious', 'not breathing',
    'chest pain', 'heart attack', 'stroke', 'severe bleeding',
    'cant breathe', 'can\'t breathe', 'unbearable', 'life threatening'
  ];
  
  const lowerQuery = query.toLowerCase();
  return emergencyKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Get health tips
export function getHealthTips(category?: string): string[] {
  const tips: Record<string, string[]> = {
    general: [
      'Drink 8 glasses of water daily',
      'Exercise for at least 30 minutes',
      'Get 7-8 hours of sleep',
      'Eat a balanced diet with fruits and vegetables',
      'Manage stress through meditation or yoga',
      'Wash hands frequently',
      'Get regular health checkups'
    ],
    immunity: [
      'Include Vitamin C rich foods (citrus fruits)',
      'Get adequate sleep',
      'Exercise regularly',
      'Manage stress levels',
      'Stay hydrated',
      'Consider Zinc supplements'
    ],
    heart: [
      'Limit salt intake to less than 5g/day',
      'Exercise regularly (30 min most days)',
      'Maintain healthy weight',
      'Quit smoking',
      'Limit alcohol consumption',
      'Manage stress'
    ],
    diabetes: [
      'Monitor blood sugar regularly',
      'Follow diabetic diet',
      'Exercise daily',
      'Take medications as prescribed',
      'Foot care is essential',
      'Regular eye checkups'
    ]
  };
  
  if (category && tips[category]) {
    return tips[category];
  }
  
  return tips.general;
}

// Export for testing
export const AI_CONFIG = {
  maxContextLength: 1000,
  maxSources: 3,
  fallbackResponses: [
    "I couldn't find specific information for that. Please consult a healthcare professional.",
    "For accurate medical advice, please consult a doctor.",
    "This requires professional medical attention. Please visit a clinic or hospital."
  ]
};