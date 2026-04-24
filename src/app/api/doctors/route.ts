import { NextRequest, NextResponse } from 'next/server';

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics',
  'Dermatology', 'Gynecology', 'Urology', 'Nephrology', 'Gastroenterology',
  'Pulmonology', 'Ophthalmology', 'ENT', 'Psychiatry', 'General Physician',
  'Cardiac Surgeon', 'Neuro Surgeon', 'Plastic Surgeon', 'Dentist', 'Ayurveda'
];

const CITIES = [
  { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { city: 'Pune', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { city: 'Gurgaon', lat: 28.4283, lng: 77.0266 },
  { city: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { city: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { city: 'Indore', lat: 22.7196, lng: 75.8577 },
  { city: 'Kochi', lat: 9.9312, lng: 76.2673 },
];

const HOSPITALS = [
  'AIIMS', 'Fortis', 'Apollo', 'Max', 'Medanta', 'Narayana', 'Saife',
  'Breach Candy', 'KEM', 'Tata', 'Sir Ganga Ram', 'BLK', 'Manipal', 'Cloudnine'
];

const FIRST_NAMES = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Raj', 'Meera', 'Sanjay', 'Kavita', 'Deepak', 'Sunita', 'Arun', 'Divya', 'Gaurav', 'Nisha'];
const LAST_NAMES = ['Sharma', 'Kumar', 'Patel', 'Gupta', 'Singh', 'Verma', 'Reddy', 'Joshi', 'Mehta', 'Shah', 'Chopra', 'Malhotra', 'Kapoor', 'Iyer', 'Nair', 'Das'];

function generateDoctors() {
  const doctors = [];
  let id = 1;
  const now = new Date();
  
  for (const city of CITIES) {
    const numDoctors = 8 + Math.floor(Math.random() * 8);
    for (let i = 0; i < numDoctors; i++) {
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const specialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)];
      const hospital = HOSPITALS[Math.floor(Math.random() * HOSPITALS.length)];
      
      const available = Math.random() > 0.3;
      const nextSlotDays = Math.floor(Math.random() * 7);
      const nextSlot = new Date(now.getTime() + nextSlotDays * 24 * 60 * 60 * 1000);
      
      doctors.push({
        id: `DR_${String(id).padStart(4, '0')}`,
        name: `Dr. ${firstName} ${lastName}`,
        specialty,
        hospital: `${hospital} ${city.city}`,
        city: city.city,
        state: getStateForCity(city.city),
        rating: (3.5 + Math.random() * 1.2).toFixed(1),
        experience: 2 + Math.floor(Math.random() * 25),
        fee: 300 + Math.floor(Math.random() * 1500),
        languages: ['English', 'Hindi', ...(Math.random() > 0.5 ? ['Regional'] : [])],
        available,
        nextSlot: available ? nextSlot.toISOString().split('T')[0] : null,
        isAvailable: available,
        waitTime: 5 + Math.floor(Math.random() * 45),
        consultationType: Math.random() > 0.3 ? 'Both' : (Math.random() > 0.5 ? 'Teleconsult' : 'In-Person'),
        education: 'Medical College',
        bio: `${specialty} specialist with ${Math.floor(Math.random() * 20) + 2} years experience`,
        location: {
          lat: city.lat + (Math.random() - 0.5) * 0.1,
          lng: city.lng + (Math.random() - 0.5) * 0.1
        }
      });
      id++;
    }
  }
  return doctors;
}

function getStateForCity(city: string) {
  const states: Record<string, string> = {
    'Delhi': 'Delhi', 'Mumbai': 'Maharashtra', 'Bangalore': 'Karnataka',
    'Chennai': 'Tamil Nadu', 'Kolkata': 'West Bengal', 'Hyderabad': 'Telangana',
    'Pune': 'Maharashtra', 'Ahmedabad': 'Gujarat', 'Jaipur': 'Rajasthan',
    'Lucknow': 'Uttar Pradesh', 'Gurgaon': 'Haryana', 'Chandigarh': 'Punjab',
    'Bhopal': 'Madhya Pradesh', 'Indore': 'Madhya Pradesh', 'Kochi': 'Kerala'
  };
  return states[city] || 'Delhi';
}

const DOCTORS_DB = generateDoctors();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get('specialty');
  const isAvailable = searchParams.get('isAvailable');
  const city = searchParams.get('city');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    let filtered = [...DOCTORS_DB];
    
    if (specialty) {
      filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    
    if (isAvailable === 'true') {
      filtered = filtered.filter(d => d.available);
    }
    
    if (city) {
      filtered = filtered.filter(d => d.city.toLowerCase() === city.toLowerCase());
    }
    
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);
    
    return NextResponse.json({
      doctors: paginated,
      total: filtered.length,
      page,
      pages: Math.ceil(filtered.length / limit),
      specialties: SPECIALTIES
    });
  } catch (error) {
    console.error('Doctor API error:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Use app to register as doctor' }, { status: 501 });
}

export async function PATCH(req: NextRequest) {
  return NextResponse.json({ error: 'Use app to update doctor profile' }, { status: 501 });
}