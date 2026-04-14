import { NextRequest, NextResponse } from 'next/server';

const CAMPS_API = [
  { name: 'Free Cardiac Checkup Camp', city: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, services: ['ECG', 'BP Check', 'Sugar Test', 'Cardiac Consultation'], hospital: 'AIIMS Delhi' },
  { name: 'Diabetes Screening Camp', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, services: ['Blood Sugar', 'HbA1c', 'Eye Checkup'], hospital: 'KEM Hospital' },
  { name: 'Women Health Camp', city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, services: ['Mammography', 'Pap Smear', 'Gynecology'], hospital: 'Narayana Health' },
  { name: 'Eye Care Camp', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, services: ['Eye Test', 'Cataract Screening', 'Free Spectacles'], hospital: 'Aravind Eye Hospital' },
  { name: 'Child Immunization Camp', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, services: ['Vaccination', 'Growth Check', 'Nutrition'], hospital: 'Apollo Hyderabad' },
  { name: 'Senior Citizen Health Check', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, services: ['Bone Density', 'Heart Check', 'Memory Test'], hospital: 'Ruby Hall Clinic' },
  { name: 'Blood Donation Camp', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, services: ['Blood Group Test', 'Donation', 'Health Check'], hospital: 'CMRI Hospital' },
  { name: 'Cancer Screening Camp', city: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, services: ['Cancer Screening', 'Awareness', 'Consultation'], hospital: 'CII Hospital' },
];

function getRandomDate(startDays: number, endDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * (endDays - startDays)) + startDays);
  return date.toISOString().split('T')[0];
}

function getRandomTime(): string {
  const times = ['9:00 AM - 1:00 PM', '10:00 AM - 4:00 PM', '8:00 AM - 2:00 PM', '9:00 AM - 5:00 PM'];
  return times[Math.floor(Math.random() * times.length)];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  let camps = CAMPS_API.map((camp, i) => ({
    id: `camp_${i + 1}`,
    name: camp.name,
    date: getRandomDate(1, 30),
    time: getRandomTime(),
    location: `Medical Campus, ${camp.city}`,
    city: camp.city,
    state: camp.state,
    locationCoords: { lat: camp.lat, lng: camp.lng },
    services: camp.services,
    hospital: camp.hospital,
    registration: Math.random() > 0.5 ? 'Free' : '₹' + (100 + Math.floor(Math.random() * 400)),
    spotsAvailable: 20 + Math.floor(Math.random() * 80),
    organizedBy: camp.hospital,
  }));

  if (city) {
    camps = camps.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
  }
  if (state) {
    camps = camps.filter(c => c.state.toLowerCase().includes(state.toLowerCase()));
  }

  camps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json({
    camps,
    total: camps.length,
    cities: [...new Set(CAMPS_API.map(c => c.city))].sort(),
    states: [...new Set(CAMPS_API.map(c => c.state))].sort(),
  });
}
