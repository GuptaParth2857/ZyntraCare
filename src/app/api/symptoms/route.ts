import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface SymptomResult {
  symptoms: string[];
  possibleConditions: { name: string; probability: number; severity: string; category: string; recommendation: string }[];
  urgencyLevel: 'self-care' | 'consult-doctor' | 'emergency';
  redFlags: string[];
  suggestedTests: string[];
  aiAnalysis?: string;
}

// Rule-based fallback for when Gemini is not available
const SYMPTOM_CONDITIONS: Record<string, { conditions: string[]; redFlags: string[]; tests: string[] }> = {
  'fever': {
    conditions: ['Viral Infection', 'Typhoid', 'Malaria', 'Dengue', 'COVID-19'],
    redFlags: ['Fever > 103°F for > 3 days', 'Severe headache', 'Rash', 'Confusion', 'Difficulty breathing'],
    tests: ['CBC', 'Malaria Antigen', 'Dengue NS1', 'CRP', 'Blood Culture']
  },
  'cough': {
    conditions: ['Common Cold', 'Bronchitis', 'Pneumonia', 'TB', 'COVID-19', 'Asthma'],
    redFlags: ['Coughing blood', 'Shortness of breath', 'Chest pain', 'Night sweats', 'Weight loss'],
    tests: ['Chest X-Ray', 'CBC', 'Sputum Culture', 'PFT']
  },
  'headache': {
    conditions: ['Tension Headache', 'Migraine', 'Sinusitis', 'Hypertension', 'Meningitis'],
    redFlags: ['Sudden severe headache', 'Fever with stiff neck', 'Confusion', 'Vision changes', 'Weakness'],
    tests: ['CT Scan', 'MRI', 'Blood Pressure', 'CBC']
  },
  'chest pain': {
    conditions: ['GERD', 'Angina', 'Heart Attack', 'Pneumonia', 'Panic Attack'],
    redFlags: ['Pain radiating to arm/jaw', 'Sweating', 'Shortness of breath', 'Nausea', 'Fainting'],
    tests: ['ECG', 'Troponin', 'Chest X-Ray', 'Echo', 'Angiography']
  },
  'stomach pain': {
    conditions: ['GERD', 'Food Poisoning', 'Appendicitis', 'Gallstones', 'Ulcer'],
    redFlags: ['Severe pain', 'Blood in stool', 'Vomiting blood', 'Fever', 'Unable to pass gas'],
    tests: ['Ultrasound', 'CT Abdomen', 'CBC', 'Endoscopy']
  },
  'fatigue': {
    conditions: ['Anemia', 'Thyroid', 'Diabetes', 'Depression', 'Chronic Fatigue'],
    redFlags: ['Unexplained weight loss', 'Fever', 'Night sweats', 'Easy bruising'],
    tests: ['CBC', 'TSH', 'Blood Sugar', 'Vitamin B12', 'Iron Studies']
  },
  'joint pain': {
    conditions: ['Arthritis', 'Gout', 'Lupus', 'Fibromyalgia', 'Vitamin D Deficiency'],
    redFlags: ['Swelling', 'Redness', 'Fever', 'Morning stiffness > 30 min'],
    tests: ['RA Factor', 'Anti-CCP', 'ESR', 'CRP', 'Uric Acid']
  },
  'skin rash': {
    conditions: ['Allergy', 'Eczema', 'Psoriasis', 'Fungal', 'Chickenpox'],
    redFlags: ['Rapid spread', 'Blisters', 'Fever', 'Swelling of face', 'Difficulty breathing'],
    tests: ['Skin Biopsy', 'Allergy Test', 'Blood Test']
  },
};

function getCategory(condition: string): string {
  if (['Heart Attack', 'Angina'].includes(condition)) return 'Cardiovascular';
  if (['Pneumonia', 'TB', 'Asthma'].includes(condition)) return 'Respiratory';
  if (['Typhoid', 'Malaria', 'Dengue'].includes(condition)) return 'Infectious';
  if (['Arthritis', 'Gout'].includes(condition)) return 'Orthopedic';
  return 'General';
}

function getRecommendation(condition: string): string {
  const recs: Record<string, string> = {
    'Heart Attack': 'Call emergency immediately. Chew aspirin if not allergic.',
    'Pneumonia': 'Consult doctor within 24 hours. May need antibiotics.',
    'Malaria': 'Start anti-malarial treatment immediately after blood test.',
    'Appendicitis': 'Seek immediate medical attention - may need surgery.',
    'Diabetes': 'Monitor blood sugar, consult endocrinologist.',
  };
  return recs[condition] || 'Consult a healthcare provider for proper diagnosis.';
}

async function analyzeWithGemini(symptoms: string[], duration: string, severity: string): Promise<SymptomResult | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a structured response.

Patient Symptoms: ${symptoms.join(', ')}
Duration: ${duration}
Severity: ${severity}

Please provide:
1. Possible conditions (top 5) with probability percentages
2. Urgency level (self-care, consult-doctor, or emergency)
3. Red flags to watch for
4. Suggested diagnostic tests
5. Brief analysis

Format your response as JSON with this structure:
{
  "conditions": [
    { "name": "Condition Name", "probability": 75, "severity": "high/medium/low", "category": "Category", "recommendation": "..." }
  ],
  "urgencyLevel": "consult-doctor",
  "redFlags": ["..."],
  "suggestedTests": ["..."],
  "aiAnalysis": "Brief analysis text"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      symptoms,
      possibleConditions: parsed.conditions || [],
      urgencyLevel: parsed.urgencyLevel || 'consult-doctor',
      redFlags: parsed.redFlags || [],
      suggestedTests: parsed.suggestedTests || [],
      aiAnalysis: parsed.aiAnalysis || '',
    };
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return null;
  }
}

function analyzeWithRules(symptoms: string[], duration: string, severity: string): SymptomResult {
  const results: SymptomResult = {
    symptoms,
    possibleConditions: [],
    urgencyLevel: 'self-care',
    redFlags: [],
    suggestedTests: [],
  };

  const allRedFlags: string[] = [];
  const allTests: Set<string> = new Set();
  const conditionsMap: Record<string, { count: number; severity: string }> = {};

  symptoms.forEach((symptom: string) => {
    const lowerSymptom = symptom.toLowerCase();
    Object.keys(SYMPTOM_CONDITIONS).forEach(key => {
      if (lowerSymptom.includes(key)) {
        const data = SYMPTOM_CONDITIONS[key];
        data.redFlags.forEach(flag => {
          if (!allRedFlags.includes(flag)) allRedFlags.push(flag);
        });
        data.tests.forEach(test => allTests.add(test));
        data.conditions.forEach(cond => {
          if (!conditionsMap[cond]) {
            conditionsMap[cond] = { count: 0, severity: 'mild' };
          }
          conditionsMap[cond].count++;
        });
      }
    });
  });

  const maxCount = Math.max(...Object.values(conditionsMap).map(c => c.count), 1);

  results.possibleConditions = Object.entries(conditionsMap)
    .map(([name, data]) => ({
      name,
      probability: Math.round((data.count / maxCount) * 80 + 20),
      severity: data.count >= maxCount ? 'high' : data.count >= maxCount * 0.7 ? 'medium' : 'low',
      category: getCategory(name),
      recommendation: getRecommendation(name),
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5);

  if (allRedFlags.length > 0 || severity === 'severe') {
    results.urgencyLevel = 'emergency';
    results.redFlags = allRedFlags.slice(0, 5);
  } else if (duration && duration.includes('week')) {
    results.urgencyLevel = 'consult-doctor';
    results.redFlags = allRedFlags.slice(0, 3);
  } else {
    results.urgencyLevel = 'self-care';
  }

  results.suggestedTests = Array.from(allTests).slice(0, 5);

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, duration, severity, additionalInfo } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one symptom' }, { status: 400 });
    }

    // Try Gemini AI first
    let aiResult = await analyzeWithGemini(symptoms, duration || 'few-days', severity || 'moderate');

    // Fall back to rule-based analysis if Gemini fails
    if (!aiResult) {
      aiResult = analyzeWithRules(symptoms, duration || 'few-days', severity || 'moderate');
    }

    return NextResponse.json({
      success: true,
      result: aiResult,
      source: GEMINI_API_KEY ? 'gemini' : 'rules',
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
