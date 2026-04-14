import { NextRequest, NextResponse } from 'next/server';

function getRandomDate(startDays: number, endDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * (endDays - startDays)) + startDays);
  return date.toISOString().split('T')[0];
}

function getRandomTime(): string {
  const times = ['9:00 AM - 1:00 PM', '10:00 AM - 4:00 PM', '8:00 AM - 2:00 PM', '9:00 AM - 5:00 PM'];
  return times[Math.floor(Math.random() * times.length)];
}

const CAMP_TYPES = [
  { type: 'Cardiac Checkup', services: ['ECG', 'BP Check', 'Sugar Test', 'Cardiac Consultation', 'Echo'] },
  { type: 'Diabetes Screening', services: ['Blood Sugar', 'HbA1c', 'Eye Checkup', 'Foot Examination'] },
  { type: 'Women Health', services: ['Mammography', 'Pap Smear', 'Gynecology Check', 'Bone Density'] },
  { type: 'Eye Care', services: ['Eye Test', 'Cataract Screening', 'Refraction', 'Free Spectacles'] },
  { type: 'Child Immunization', services: ['Vaccination', 'Growth Check', 'Nutrition Advice', 'General Checkup'] },
  { type: 'Senior Citizen Health', services: ['Bone Density', 'Heart Check', 'Memory Test', 'Blood Pressure'] },
  { type: 'Blood Donation', services: ['Blood Group Test', 'Donation', 'Health Check', 'Health Card'] },
  { type: 'Cancer Screening', services: ['Cancer Screening', 'Awareness', 'Consultation', 'Biopsy'] },
  { type: 'General Health Check', services: ['Complete Checkup', 'BP/Sugar', 'BMI', 'Consultation'] },
  { type: 'Dental Camp', services: ['Dental Checkup', 'Teeth Cleaning', 'X-Ray', 'Extraction'] },
];

const HOSPITALS = [
  { name: 'AIIMS Delhi', city: 'New Delhi', state: 'Delhi', lat: 28.5672, lng: 77.2100 },
  { name: 'Medanta Hospital', city: 'Gurgaon', state: 'Haryana', lat: 28.4551, lng: 77.0442 },
  { name: 'Fortis Memorial', city: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0282 },
  { name: 'Apollo Hospital', city: 'Delhi', state: 'Delhi', lat: 28.5384, lng: 77.2914 },
  { name: 'Max Super Speciality', city: 'Delhi', state: 'Delhi', lat: 28.5700, lng: 77.2400 },
  { name: 'Narayana Health', city: 'Bangalore', state: 'Karnataka', lat: 12.8387, lng: 77.6815 },
  { name: 'KEM Hospital', city: 'Mumbai', state: 'Maharashtra', lat: 18.9982, lng: 72.8378 },
  { name: 'Ruby Hall Clinic', city: 'Pune', state: 'Maharashtra', lat: 18.5314, lng: 73.8758 },
  { name: 'CMI Hospital', city: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'KIMS Hospital', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
];

function generateCamps(lat: number, lng: number, count: number = 20) {
  const camps = [];
  
  for (let i = 0; i < count; i++) {
    const campType = CAMP_TYPES[Math.floor(Math.random() * CAMP_TYPES.length)];
    const hospital = HOSPITALS[Math.floor(Math.random() * HOSPITALS.length)];
    
    // Add some randomness to location around the user
    const campLat = lat + (Math.random() - 0.5) * 0.5;
    const campLng = lng + (Math.random() - 0.5) * 0.5;
    
    camps.push({
      id: `camp_${Date.now()}_${i}`,
      name: `${campType.type} Camp`,
      date: getRandomDate(1, 30),
      time: getRandomTime(),
      location: `Community Center, ${hospital.city}`,
      city: hospital.city,
      state: hospital.state,
      locationCoords: { lat: campLat, lng: campLng },
      services: campType.services,
      hospital: hospital.name,
      registration: Math.random() > 0.5 ? 'Free' : '₹' + (100 + Math.floor(Math.random() * 400)),
      spotsAvailable: 20 + Math.floor(Math.random() * 80),
      organizedBy: hospital.name,
    });
  }
  
  // Sort by date
  camps.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return camps;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '28.6139');
  const lng = parseFloat(searchParams.get('lng') || '77.2090');
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  
  let camps = generateCamps(lat, lng, 25);
  
  // Filter if state/city provided
  if (state) {
    camps = camps.filter(c => c.state.toLowerCase().includes(state.toLowerCase()));
  }
  if (city) {
    camps = camps.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
  }
  
  return NextResponse.json({
    camps,
    total: camps.length,
    cities: [...new Set(HOSPITALS.map(h => h.city))],
    states: [...new Set(HOSPITALS.map(h => h.state))],
  });
}