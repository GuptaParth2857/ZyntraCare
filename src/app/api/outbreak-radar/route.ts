import { NextResponse } from 'next/server';

const INDIAN_CITIES = [
  { city: 'Mumbai', lat: 19.076, lng: 72.877, symptomScore: 45, salesSpike: 120, searchSpike: 85, risk: 'critical', predictedDay: 2 },
  { city: 'Delhi', lat: 28.613, lng: 77.209, symptomScore: 38, salesSpike: 95, searchSpike: 72, risk: 'high', predictedDay: 3 },
  { city: 'Bangalore', lat: 12.971, lng: 77.594, symptomScore: 28, salesSpike: 65, searchSpike: 45, risk: 'medium', predictedDay: 5 },
  { city: 'Chennai', lat: 13.082, lng: 80.271, symptomScore: 22, salesSpike: 48, searchSpike: 35, risk: 'medium', predictedDay: 7 },
  { city: 'Kolkata', lat: 22.573, lng: 88.363, symptomScore: 35, salesSpike: 88, searchSpike: 62, risk: 'high', predictedDay: 4 },
  { city: 'Hyderabad', lat: 17.375, lng: 78.474, symptomScore: 18, salesSpike: 32, searchSpike: 28, risk: 'low', predictedDay: 10 },
  { city: 'Pune', lat: 18.520, lng: 73.856, symptomScore: 42, salesSpike: 110, searchSpike: 78, risk: 'critical', predictedDay: 2 },
  { city: 'Ahmedabad', lat: 23.030, lng: 72.580, symptomScore: 30, salesSpike: 72, searchSpike: 55, risk: 'high', predictedDay: 4 },
  { city: 'Jaipur', lat: 26.912, lng: 75.787, symptomScore: 15, salesSpike: 25, searchSpike: 18, risk: 'low', predictedDay: 12 },
  { city: 'Lucknow', lat: 26.846, lng: 80.946, symptomScore: 25, salesSpike: 55, searchSpike: 42, risk: 'medium', predictedDay: 6 },
  { city: 'Kanpur', lat: 26.449, lng: 80.332, symptomScore: 20, salesSpike: 38, searchSpike: 30, risk: 'low', predictedDay: 8 },
  { city: 'Nagpur', lat: 21.146, lng: 79.084, symptomScore: 12, salesSpike: 20, searchSpike: 15, risk: 'low', predictedDay: 14 },
  { city: 'Indore', lat: 22.719, lng: 75.858, symptomScore: 28, salesSpike: 62, searchSpike: 48, risk: 'medium', predictedDay: 5 },
  { city: 'Coimbatore', lat: 11.017, lng: 76.955, symptomScore: 10, salesSpike: 18, searchSpike: 12, risk: 'low', predictedDay: 15 },
];

const ACTIVE_ALERTS = [
  { id: 'ALT-001', city: 'Mumbai', disease: 'Dengue Outbreak', probability: 92, timestamp: '2 hours ago' },
  { id: 'ALT-002', city: 'Pune', disease: 'Viral Fever', probability: 85, timestamp: '5 hours ago' },
  { id: 'ALT-003', city: 'Delhi', disease: 'Covid-19 Variant', probability: 68, timestamp: '8 hours ago' },
  { id: 'ALT-004', city: 'Kolkata', disease: 'Cholera', probability: 45, timestamp: '12 hours ago' },
];

export async function GET() {
  try {
    return NextResponse.json({ cities: INDIAN_CITIES, alerts: ACTIVE_ALERTS });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch outbreak data' }, { status: 500 });
  }
}
