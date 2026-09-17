import { NextRequest, NextResponse } from 'next/server';
import { geminiGenerate } from '@/lib/gemini';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const REFERENCE_RANGES: Record<string, { unit: string; low: number; high: number }> = {
  hemoglobin: { unit: 'g/dL', low: 12, high: 17 },
  rbcCount: { unit: 'million/µL', low: 4.5, high: 6.1 },
  wbcCount: { unit: 'thousand/µL', low: 4.0, high: 11.0 },
  platelets: { unit: 'thousand/µL', low: 150, high: 450 },
  fastingGlucose: { unit: 'mg/dL', low: 70, high: 99 },
  hba1c: { unit: '%', low: 4.0, high: 5.6 },
  totalCholesterol: { unit: 'mg/dL', low: 125, high: 200 },
  ldl: { unit: 'mg/dL', low: 0, high: 100 },
  hdl: { unit: 'mg/dL', low: 40, high: 60 },
  triglycerides: { unit: 'mg/dL', low: 0, high: 150 },
  creatinine: { unit: 'mg/dL', low: 0.6, high: 1.3 },
  bun: { unit: 'mg/dL', low: 7, high: 20 },
  alt: { unit: 'U/L', low: 7, high: 56 },
  ast: { unit: 'U/L', low: 5, high: 40 },
  tsh: { unit: 'µIU/mL', low: 0.4, high: 4.0 },
};

const PARAMETER_LABELS: Record<string, string> = {
  hemoglobin: 'Hemoglobin',
  rbcCount: 'RBC Count',
  wbcCount: 'WBC Count',
  platelets: 'Platelets',
  fastingGlucose: 'Fasting Glucose',
  hba1c: 'HbA1c',
  totalCholesterol: 'Total Cholesterol',
  ldl: 'LDL Cholesterol',
  hdl: 'HDL Cholesterol',
  triglycerides: 'Triglycerides',
  creatinine: 'Creatinine',
  bun: 'BUN',
  alt: 'ALT',
  ast: 'AST',
  tsh: 'TSH',
};

function parseNumber(val: string | number): number | null {
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^\d.\-]/g, '');
  if (cleaned === '') return null;
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

function analyzeParams(parameters: any[]) {
  const results: any[] = [];
  for (const p of parameters) {
    const range = REFERENCE_RANGES[p.name];
    const value = parseNumber(p.value);
    if (!range || value === null) {
      results.push({ ...p, unit: p.unit || '—', status: 'unknown', range: range ? `${range.low}-${range.high}` : '—' });
      continue;
    }
    let status = 'normal';
    if (value < range.low) status = 'low';
    else if (value > range.high) status = 'high';
    results.push({ ...p, label: PARAMETER_LABELS[p.name] || p.label || p.name, value, unit: p.unit || range.unit, status, range: `${range.low}-${range.high}` });
  }
  return results;
}

function buildRecommendations(results: any[]) {
  const recs: string[] = [];
  const flags: string[] = [];
  for (const r of results) {
    if (r.status === 'high') { flags.push(`${r.label || r.name} is high`); recs.push(`Consult a doctor about elevated ${r.label || r.name} (${r.value} ${r.unit}).`); }
    if (r.status === 'low') { flags.push(`${r.label || r.name} is low`); recs.push(`Address low ${r.label || r.name} (${r.value} ${r.unit}) with diet and medical guidance.`); }
  }
  if (recs.length === 0) recs.push('All measured parameters are within normal reference ranges. Continue healthy habits.');
  return { flags, recommendations: recs.slice(0, 6) };
}

function localAnalyze(parameters: any[]) {
  const analyzed = analyzeParams(parameters);
  const abnormal = analyzed.filter(r => r.status === 'high' || r.status === 'low');
  const normalCount = analyzed.filter(r => r.status === 'normal').length;
  const { flags, recommendations } = buildRecommendations(analyzed);
  return {
    overall: abnormal.length === 0 ? 'normal' : abnormal.length <= 2 ? 'attention' : 'review',
    summary: `${normalCount} of ${analyzed.length} parameters measured. ${flags.length ? flags.length + ' abnormal finding(s): ' + flags.join('; ') : 'No abnormal findings.'}`,
    analyzed,
    flags,
    recommendations,
    mode: 'local',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parameters, reportText } = body;

    if (!Array.isArray(parameters) || parameters.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one lab parameter is required' }, { status: 400 });
    }
    if (parameters.length > 25) {
      return NextResponse.json({ success: false, error: 'Too many parameters (max 25)' }, { status: 400 });
    }

    let finalResult: any = null;

    if (GEMINI_API_KEY && parameters && parameters.length > 0) {
      try {
        const prompt = `You are a medical lab report analyzer. Analyze these lab parameters and return JSON.
Parameters: ${JSON.stringify(parameters)}${reportText ? `\nRaw report text: ${reportText}` : ''}
Return JSON with shape:
{
  "summary": "plain-language human summary of the overall results",
  "overall": "normal|warning|critical",
  "flags": ["short flag for each abnormal value"],
  "recommendations": ["up to 5 actionable, non-diagnostic recommendations"]
}`;
        const text = await geminiGenerate({ prompt, json: true });
        if (text) {
          const parsed = JSON.parse(text);
          finalResult = { ...parsed, analyzed: analyzeParams(parameters), mode: 'ai' };
        }
      } catch (err) {
        console.error('Gemini lab analysis failed, using local:', err);
      }
    }

    if (!finalResult) {
      finalResult = localAnalyze(parameters || []);
    }

    return NextResponse.json({ success: true, result: finalResult });
  } catch (error) {
    console.error('Lab report analysis error:', error);
    return NextResponse.json({ success: false, error: 'Analysis failed' }, { status: 500 });
  }
}
