import { NextResponse } from 'next/server';

const INDIA_CITIES = [
  { name: 'Mumbai', lat: 19.076, lng: 72.877, size: 1.2 },
  { name: 'Delhi', lat: 28.613, lng: 77.209, size: 1.1 },
  { name: 'Bangalore', lat: 12.971, lng: 77.594, size: 1.0 },
  { name: 'Chennai', lat: 13.082, lng: 80.271, size: 0.9 },
  { name: 'Kolkata', lat: 22.573, lng: 88.363, size: 0.85 },
  { name: 'Hyderabad', lat: 17.375, lng: 78.474, size: 0.9 },
  { name: 'Pune', lat: 18.520, lng: 73.856, size: 0.8 },
  { name: 'Ahmedabad', lat: 23.030, lng: 72.580, size: 0.75 },
  { name: 'Jaipur', lat: 26.912, lng: 75.787, size: 0.7 },
  { name: 'Lucknow', lat: 26.846, lng: 80.946, size: 0.65 },
  { name: 'Kanpur', lat: 26.449, lng: 80.332, size: 0.6 },
  { name: 'Nagpur', lat: 21.146, lng: 79.084, size: 0.55 },
  { name: 'Indore', lat: 22.719, lng: 75.858, size: 0.5 },
  { name: 'Coimbatore', lat: 11.017, lng: 76.955, size: 0.5 },
];

const ALERT_TYPES = [
  'Heart Attack SOS',
  'Stroke Alert',
  'Dengue Outbreak',
  'Blood Shortage',
  'Drone Dispatch',
  'Organ Match Found',
];

const MESSAGES = [
  'Emergency SOS received - ETA 8 mins',
  'Critical condition detected - Drone dispatched',
  'Outbreak pattern identified - Alert sent',
  'Blood unit matched - Hospital notified',
  'Drone delivering medicine - Live tracking',
  'Organ match confirmed - All parties alerted',
];

export async function GET() {
  return NextResponse.json({
    cities: INDIA_CITIES,
    alertTypes: ALERT_TYPES,
    messages: MESSAGES,
  });
}
