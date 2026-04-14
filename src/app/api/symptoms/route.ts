import { NextRequest, NextResponse } from 'next/server';

interface SymptomResult {
  symptoms: string[];
  possibleConditions: { name: string; probability: number; severity: string; category: string; recommendation: string }[];
  urgencyLevel: 'self-care' | 'consult-doctor' | 'emergency';
  redFlags: string[];
  suggestedTests: string[];
}

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
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms, duration, severity, additionalInfo } = body;

    if (!symptoms || symptoms.length === 0) {
      return NextResponse.json({ error: 'Please provide at least one symptom' }, { status: 400 });
    }

    const results: SymptomResult = {
      symptoms,
      possibleConditions: [],
      urgencyLevel: 'self-care',
      redFlags: [],
      suggestedTests: []
    };

    // Analyze each symptom
    const allRedFlags: string[] = [];
    const allTests: Set<string> = new Set();

    symptoms.forEach((symptom: string) => {
      const lowerSymptom = symptom.toLowerCase();
      Object.keys(SYMPTOM_CONDITIONS).forEach(key => {
        if (lowerSymptom.includes(key)) {
          const data = SYMPTOM_CONDITIONS[key];
          data.redFlags.forEach(flag => {
            if (!allRedFlags.includes(flag)) allRedFlags.push(flag);
          });
          data.tests.forEach(test => allTests.add(test));
        }
      });
    });

    // Generate possible conditions based on symptoms
    const conditionsMap: Record<string, { count: number; severity: string }> = {};
    
    symptoms.forEach((symptom: string) => {
      const lowerSymptom = symptom.toLowerCase();
      Object.keys(SYMPTOM_CONDITIONS).forEach(key => {
        if (lowerSymptom.includes(key)) {
          SYMPTOM_CONDITIONS[key].conditions.forEach(cond => {
            if (!conditionsMap[cond]) {
              conditionsMap[cond] = { count: 0, severity: 'mild' };
            }
            conditionsMap[cond].count++;
          });
        }
      });
    });

    // Calculate probabilities and determine severity
    const maxCount = Math.max(...Object.values(conditionsMap).map(c => c.count));
    
    results.possibleConditions = Object.entries(conditionsMap)
      .map(([name, data]) => ({
        name,
        probability: Math.round((data.count / maxCount) * 80 + 20),
        severity: data.count >= maxCount ? 'high' : data.count >= maxCount * 0.7 ? 'medium' : 'low',
        category: getCategory(name),
        recommendation: getRecommendation(name)
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5);

    // Determine urgency level
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

    return NextResponse.json({
      success: true,
      result: results
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

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