import { NextRequest, NextResponse } from 'next/server';

const SPECIALTIES = ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'General Medicine', 'Psychiatry', 'Pulmonology'];
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const HOSPITALS = ['Apollo Hospital', 'Fortis Healthcare', 'Max Hospital', 'Medanta', 'AIIMS', 'Narayana Health', 'Manipal Hospital', 'Ruby Hall Clinic', 'KEM Hospital', 'SGPGI'];
const NAMES = ['Dr. Amit Kumar', 'Dr. Priya Sharma', 'Dr. Rahul Verma', 'Dr. Sneha Singh', 'Dr. Vikram Patel', 'Dr. Anjali Gupta', 'Dr. Sanjay Reddy', 'Dr. Meera Joshi', 'Dr. Rajesh Nair', 'Dr. Kavita Malhotra', 'Dr. Deepak Chopra', 'Dr. Sonali Das', 'Dr. Ashok Mishra', 'Dr. Pooja Khanna', 'Dr. Manish Bansal'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDoctors(count: number = 50) {
  return Array.from({ length: count }, (_, i) => {
    const specialty = getRandomElement(SPECIALTIES);
    const city = getRandomElement(CITIES);
    const lat = 28.6 + (Math.random() - 0.5) * 2;
    const lng = 77.2 + (Math.random() - 0.5) * 2;
    
    return {
      id: `doc_${i + 1}`,
      name: getRandomElement(NAMES),
      specialty,
      hospitalName: getRandomElement(HOSPITALS),
      qualification: specialty === 'Cardiology' ? 'MD, DM (Cardiology)' : specialty === 'Neurology' ? 'MD, DM (Neurology)' : 'MBBS, MD',
      experience: Math.floor(Math.random() * 30) + 5,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      consultationFee: Math.floor(Math.random() * 3000) + 500,
      available: Math.random() > 0.3,
      nextAvailable: Math.random() > 0.3 ? 'Today, ' + (Math.floor(Math.random() * 8) + 9) + ':00 AM' : 'Tomorrow, 10:00 AM',
      languages: ['English', 'Hindi'],
      image: `https://images.unsplash.com/photo-${['1612349317150-e413f6a5b16d', '1559839734-2b71ea197ec2', '1537368910025-700350fe46c7', '1622253692010-333f2da6031d'][i % 4]}?w=400`,
      location: { lat, lng },
      city,
    };
  });
}

const doctorsCache = generateDoctors(50);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get('specialty');
  const city = searchParams.get('city');
  const available = searchParams.get('available');
  const search = searchParams.get('search');
  
  let result = [...doctorsCache];
  
  if (specialty) {
    result = result.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  
  if (city) {
    result = result.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
  }
  
  if (available === 'true') {
    result = result.filter(d => d.available);
  }
  
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.specialty.toLowerCase().includes(q) ||
      d.hospitalName.toLowerCase().includes(q)
    );
  }
  
  return NextResponse.json({
    doctors: result,
    total: result.length,
    specialties: SPECIALTIES,
    cities: CITIES,
  });
}