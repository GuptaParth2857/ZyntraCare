import { NextRequest, NextResponse } from 'next/server';

const outbreakData = [
  { area: 'Dwarka', city: 'Delhi', cases: 156, severity: 'high', symptoms: ['Fever', 'Joint Pain', 'Rash'], trend: 'increasing', predictedSurge: 45, daysUntilPeak: 5 },
  { area: 'Rohini', city: 'Delhi', cases: 89, severity: 'medium', symptoms: ['Fever', 'Headache'], trend: 'stable', predictedSurge: 12, daysUntilPeak: 0 },
  { area: 'Saket', city: 'Delhi', cases: 234, severity: 'critical', symptoms: ['Fever', 'Bleeding', 'Shock'], trend: 'increasing', predictedSurge: 78, daysUntilPeak: 3 },
  { area: 'Karol Bagh', city: 'Delhi', cases: 67, severity: 'low', symptoms: ['Fever'], trend: 'decreasing', predictedSurge: -15, daysUntilPeak: 0 },
  { area: 'Connaught Place', city: 'Delhi', cases: 45, severity: 'low', symptoms: ['Mild Fever'], trend: 'stable', predictedSurge: 5, daysUntilPeak: 0 },
  { area: 'Lajpat Nagar', city: 'Delhi', cases: 178, severity: 'high', symptoms: ['Fever', 'Muscle Pain', 'Fatigue'], trend: 'increasing', predictedSurge: 56, daysUntilPeak: 4 },
  { area: 'Vasant Kunj', city: 'Delhi', cases: 123, severity: 'medium', symptoms: ['Fever', 'Cough'], trend: 'increasing', predictedSurge: 23, daysUntilPeak: 7 },
  { area: 'Chandni Chowk', city: 'Delhi', cases: 234, severity: 'critical', symptoms: ['High Fever', 'Vomiting'], trend: 'increasing', predictedSurge: 89, daysUntilPeak: 2 },
];

const heatmapPoints = [
  { lat: 28.6139, lng: 77.2090, intensity: 0.95, disease: 'Dengue' },
  { lat: 28.6288, lng: 77.2094, intensity: 0.75, disease: 'Viral Fever' },
  { lat: 28.5892, lng: 77.2298, intensity: 0.85, disease: 'Dengue' },
  { lat: 28.6544, lng: 77.2412, intensity: 0.45, disease: 'Seasonal Flu' },
  { lat: 28.5661, lng: 77.2434, intensity: 0.65, disease: 'Food Poisoning' },
  { lat: 28.5921, lng: 77.2187, intensity: 0.55, disease: 'Malaria' },
  { lat: 28.5352, lng: 77.2101, intensity: 0.35, disease: 'Seasonal Flu' },
  { lat: 28.5741, lng: 77.1891, intensity: 0.72, disease: 'Dengue' },
];

const symptomTrends = [
  { symptom: 'Fever', trend: '+45%', status: 'rising' },
  { symptom: 'Joint Pain', trend: '+38%', status: 'rising' },
  { symptom: 'Headache', trend: '+22%', status: 'rising' },
  { symptom: 'Rash', trend: '+15%', status: 'rising' },
  { symptom: 'Cough', trend: '+8%', status: 'stable' },
  { symptom: 'Fatigue', trend: '+32%', status: 'rising' },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const disease = searchParams.get('disease');

    const filteredHeatmap = disease && disease !== 'all'
      ? heatmapPoints.filter(p => p.disease.toLowerCase().includes(disease.toLowerCase()))
      : heatmapPoints;

    return NextResponse.json({
      outbreakData,
      heatmapPoints: filteredHeatmap,
      symptomTrends,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch epidemic data' }, { status: 500 });
  }
}
