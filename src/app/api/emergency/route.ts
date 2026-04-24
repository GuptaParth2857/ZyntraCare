import { NextRequest, NextResponse } from 'next/server';

const EMERGENCY_NUMBERS = [
  { type: 'ambulance', number: '102', name: 'National Ambulance', state: 'All India', available: true },
  { type: 'ambulance', number: '108', name: 'Emergency Ambulance', state: 'All India', available: true },
  { type: 'police', number: '100', name: 'Police Emergency', state: 'All India', available: true },
  { type: 'fire', number: '101', name: 'Fire Brigade', state: 'All India', available: true },
  { type: 'disaster', number: '112', name: 'National Emergency', state: 'All India', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Delhi', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Maharashtra', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Karnataka', available: true },
  { type: 'medical', number: '104', name: 'Medical Helpline', state: 'Haryana', available: true },
  { type: 'medical', number: '102', name: 'Health Helpline', state: 'West Bengal', available: true },
  { type: 'child', number: '1098', name: 'Child Helpline', state: 'All India', available: true },
  { type: 'medical', number: '1800-180-1111', name: 'National Health', state: 'All India', available: true },
];

const HOSPITALS_WITH_EMERGENCY = [
  { name: 'AIIMS Emergency', phone: '+91 11-2659-3062', city: 'Delhi', lat: 28.5921, lng: 77.1895 },
  { name: 'Safdarjung Emergency', phone: '+91 11-2316-0002', city: 'Delhi', lat: 28.5548, lng: 77.2204 },
  { name: 'Ram Manohar Lohia Emergency', phone: '+91 11-2336-5525', city: 'Delhi', lat: 28.6411, lng: 77.2366 },
  { name: 'Apollo Emergency Delhi', phone: '+91 11-2692-5858', city: 'Delhi', lat: 28.5853, lng: 77.2452 },
  { name: 'Fortis Emergency Gurgaon', phone: '+91 124-256-0222', city: 'Gurgaon', lat: 28.4743, lng: 77.0266 },
  { name: 'Medanta Emergency', phone: '+91 124-414-1414', city: 'Gurgaon', lat: 28.4920, lng: 77.0680 },
  { name: 'KEM Hospital Emergency', phone: '+91 22-2410-7000', city: 'Mumbai', lat: 18.9956, lng: 72.8361 },
  { name: 'Tata Memorial Emergency', phone: '+91 22-2417-7000', city: 'Mumbai', lat: 18.9987, lng: 72.8129 },
  { name: 'Apollo Mumbai', phone: '+91 22-2434-2727', city: 'Mumbai', lat: 19.0178, lng: 72.9128 },
  { name: 'Narayana Health', phone: '+91 80-2253-6000', city: 'Bangalore', lat: 12.9535, lng: 77.6194 },
  { name: 'Manipal Hospital', phone: '+91 80-2224-1133', city: 'Bangalore', lat: 12.9457, lng: 77.6015 },
  { name: 'Fortis Bannerghatta', phone: '+91 80-6625-4400', city: 'Bangalore', lat: 12.8706, lng: 77.5957 },
  { name: 'Apollo Chennai', phone: '+91 44-2829-2829', city: 'Chennai', lat: 13.0562, lng: 80.2575 },
  { name: 'Government Hospital Chennai', phone: '+91 44-2539-3000', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'SSKM Emergency', phone: '+91 33-2280-2401', city: 'Kolkata', lat: 22.5353, lng: 88.3412 },
  { name: 'AMRI Emergency', phone: '+91 33-6680-0000', city: 'Kolkata', lat: 22.5367, lng: 88.3633 },
];

const AMBULANCE_SERVICES = [
  { name: 'ZyntraCare Ambulance', phone: '102', type: 'Emergency', cities: ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'] },
  { name: 'Private Ambulance Service', phone: '+91 9876543210', type: 'AC', cities: ['Delhi', 'Gurgaon'] },
  { name: 'Private Ambulance Service', phone: '+91 9876543211', type: 'AC', cities: ['Mumbai', 'Pune'] },
  { name: 'Private Ambulance Service', phone: '+91 9876543212', type: 'Emergency', cities: ['Bangalore', 'Hyderabad'] },
  { name: 'Government Ambulance', phone: '108', type: 'Emergency', cities: ['All India'] },
];

const generateAlerts = () => {
  const alerts = [];
  const types = ['BED_AVAILABLE', 'EMERGENCY', 'BLOOD_NEEDED', 'AMBULANCE_DISPATCH', 'SCHEDULE'];
  const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  
  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    alerts.push({
      id: `ALERT_${i + 1}`,
      type,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hospital: HOSPITALS_WITH_EMERGENCY[Math.floor(Math.random() * HOSPITALS_WITH_EMERGENCY.length)].name,
      description: getAlertDescription(type),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: {
        lat: 28.5 + Math.random() * 0.5,
        lng: 77 + Math.random() * 0.5
      }
    });
  }
  return alerts;
};

function getAlertDescription(type: string) {
  const descriptions: Record<string, string[]> = {
    BED_AVAILABLE: ['ICU bed available', 'General bed available', 'Emergency bed available'],
    EMERGENCY: ['Critical patient admitted', 'Emergency case admitted', 'Accident case admitted'],
    BLOOD_NEEDED: ['O+ blood needed', 'B+ blood needed', 'AB- blood needed'],
    AMBULANCE_DISPATCH: ['Ambulance dispatched', 'ambulance en route', 'Patient transport'],
    SCHEDULE: ['New appointment', 'Follow-up scheduled', 'Check-up scheduled']
  };
  const arr = descriptions[type] || ['Update'];
  return arr[Math.floor(Math.random() * arr.length)];
}

const ALERTS_DB = generateAlerts();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const city = searchParams.get('city');
  
  try {
    let filtered = [...ALERTS_DB];
    
    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    
    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    
    if (city) {
      filtered = filtered.filter(a => a.hospital.toLowerCase().includes(city.toLowerCase()));
    }
    
    return NextResponse.json({
      alerts: filtered,
      emergencyNumbers: EMERGENCY_NUMBERS,
      emergencyHospitals: HOSPITALS_WITH_EMERGENCY,
      ambulanceServices: AMBULANCE_SERVICES,
      total: filtered.length
    });
  } catch (error) {
    console.error('Emergency API error:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newAlert = {
      id: `ALERT_${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: 'PENDING'
    };
    ALERTS_DB.unshift(newAlert);
    return NextResponse.json({ success: true, alert: newAlert });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}