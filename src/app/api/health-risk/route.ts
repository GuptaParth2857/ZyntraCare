import { NextRequest, NextResponse } from 'next/server';

interface RiskFactor {
  category: string;
  score: number;
  maxScore: number;
  risk: 'low' | 'medium' | 'high';
}

interface RiskResult {
  overallRisk: 'low' | 'medium' | 'high' | 'very_high';
  overallScore: number;
  maxScore: number;
  riskPercent: number;
  factors: RiskFactor[];
  recommendations: string[];
  diseases: { name: string; probability: number; category: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      age, gender, bmi, bloodPressure, bloodSugar, cholesterol,
      smoking, alcohol, exercise, stress, sleep, diet, familyHistory
    } = body;

    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let maxTotalScore = 0;

    // BMI Risk
    const bmiScore = bmi >= 30 ? 20 : bmi >= 25 ? 12 : bmi >= 18.5 ? 5 : 10;
    factors.push({
      category: 'BMI',
      score: bmiScore,
      maxScore: 20,
      risk: bmi >= 30 ? 'high' : bmi >= 25 ? 'medium' : 'low'
    });
    totalScore += bmiScore;
    maxTotalScore += 20;

    // Blood Pressure Risk
    const bpScore = bloodPressure >= 160 ? 20 : bloodPressure >= 140 ? 12 : bloodPressure >= 120 ? 6 : 4;
    factors.push({
      category: 'Blood Pressure',
      score: bpScore,
      maxScore: 20,
      risk: bloodPressure >= 160 ? 'high' : bloodPressure >= 140 ? 'medium' : 'low'
    });
    totalScore += bpScore;
    maxTotalScore += 20;

    // Blood Sugar Risk
    const sugarScore = bloodSugar >= 200 ? 20 : bloodSugar >= 140 ? 12 : bloodSugar >= 100 ? 6 : 3;
    factors.push({
      category: 'Blood Sugar',
      score: sugarScore,
      maxScore: 20,
      risk: bloodSugar >= 200 ? 'high' : bloodSugar >= 140 ? 'medium' : 'low'
    });
    totalScore += sugarScore;
    maxTotalScore += 20;

    // Cholesterol
    const cholScore = cholesterol >= 240 ? 15 : cholesterol >= 200 ? 10 : cholesterol >= 190 ? 5 : 3;
    factors.push({
      category: 'Cholesterol',
      score: cholScore,
      maxScore: 15,
      risk: cholesterol >= 240 ? 'high' : cholesterol >= 200 ? 'medium' : 'low'
    });
    totalScore += cholScore;
    maxTotalScore += 15;

    // Lifestyle Factors
    const lifestyleScore = 
      (smoking === 'yes' ? 15 : smoking === 'occasional' ? 8 : 0) +
      (alcohol === 'yes' ? 12 : alcohol === 'occasional' ? 6 : 0) +
      (exercise === 'never' ? 10 : exercise === 'rarely' ? 5 : 0) +
      (stress === 'high' ? 10 : stress === 'medium' ? 5 : 0) +
      (sleep < 6 ? 8 : sleep < 7 ? 4 : 0);
    
    factors.push({
      category: 'Lifestyle',
      score: lifestyleScore,
      maxScore: 55,
      risk: lifestyleScore > 35 ? 'high' : lifestyleScore > 20 ? 'medium' : 'low'
    });
    totalScore += lifestyleScore;
    maxTotalScore += 55;

    // Family History
    const familyScore = familyHistory === 'yes' ? 15 : familyHistory === 'partial' ? 8 : 0;
    factors.push({
      category: 'Family History',
      score: familyScore,
      maxScore: 15,
      risk: familyHistory === 'yes' ? 'high' : familyHistory === 'partial' ? 'medium' : 'low'
    });
    totalScore += familyScore;
    maxTotalScore += 15;

    const riskPercent = Math.round((totalScore / maxTotalScore) * 100);
    const overallRisk = riskPercent >= 60 ? 'very_high' : riskPercent >= 40 ? 'high' : riskPercent >= 20 ? 'medium' : 'low';

    // Generate disease probabilities
    const diseases = [];
    if (bmi >= 25 || bmi >= 30) {
      diseases.push({ name: 'Type 2 Diabetes', probability: Math.min(95, 40 + (bmi - 25) * 5), category: 'Metabolic' });
      diseases.push({ name: 'Hypertension', probability: Math.min(90, 30 + (bmi - 25) * 4), category: 'Cardiovascular' });
    }
    if (bloodPressure >= 140) {
      diseases.push({ name: 'Heart Disease', probability: Math.min(85, 30 + (bloodPressure - 140) * 0.8), category: 'Cardiovascular' });
      diseases.push({ name: 'Stroke Risk', probability: Math.min(70, 20 + (bloodPressure - 140) * 0.5), category: 'Cardiovascular' });
    }
    if (bloodSugar >= 140) {
      diseases.push({ name: 'Diabetes Complications', probability: Math.min(80, 25 + (bloodSugar - 140) * 0.5), category: 'Metabolic' });
    }
    if (smoking === 'yes') {
      diseases.push({ name: 'Lung Cancer', probability: Math.min(75, 20 + 15), category: 'Respiratory' });
      diseases.push({ name: 'COPD', probability: Math.min(70, 15 + 15), category: 'Respiratory' });
    }
    if (cholesterol >= 200) {
      diseases.push({ name: 'Atherosclerosis', probability: Math.min(80, 25 + (cholesterol - 200) * 0.3), category: 'Cardiovascular' });
    }

    // Sort by probability
    diseases.sort((a, b) => b.probability - a.probability);

    // Generate recommendations
    const recommendations = [];
    if (bmi >= 25) recommendations.push('Maintain healthy weight through balanced diet');
    if (bloodPressure >= 140) recommendations.push('Monitor blood pressure regularly, reduce sodium intake');
    if (bloodSugar >= 100) recommendations.push('Limit sugar intake, increase physical activity');
    if (cholesterol >= 200) recommendations.push('Reduce fatty foods, increase fiber intake');
    if (smoking === 'yes') recommendations.push('Consider smoking cessation programs');
    if (exercise === 'never' recommendations.push('Start with 30 min daily walking or moderate exercise');
    if (sleep < 6) recommendations.push('Prioritize 7-8 hours of sleep for recovery');
    if (stress === 'high') recommendations.push('Practice stress management techniques');

    return NextResponse.json({
      success: true,
      result: {
        overallRisk,
        overallScore: totalScore,
        maxScore: maxTotalScore,
        riskPercent,
        factors,
        recommendations,
        diseases: diseases.slice(0, 5)
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}