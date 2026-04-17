import { NextRequest, NextResponse } from 'next/server';

const consultations = [
  { id: '1', doctorName: 'Dr. Priya Sharma', specialty: 'General Physician', hospital: 'Rural Health Center, UP', available: true, nextSlot: 'Today 4PM', isRural: true, languages: ['Hindi', 'English'] },
  { id: '2', doctorName: 'Dr. Amit Kumar', specialty: 'Cardiologist', hospital: 'District Hospital, Bihar', available: true, nextSlot: 'Tomorrow 10AM', isRural: true, languages: ['Hindi'] },
  { id: '3', doctorName: 'Dr. Sneha Gupta', specialty: 'Dermatologist', hospital: 'City Hospital, Delhi', available: false, nextSlot: 'Next Week', isRural: false, languages: ['English', 'Hindi'] },
  { id: '4', doctorName: 'Dr. Rajesh Patel', specialty: 'Pediatrician', hospital: 'Taluka Hospital, Gujarat', available: true, nextSlot: 'Today 6PM', isRural: true, languages: ['Gujarati', 'Hindi'] },
  { id: '5', doctorName: 'Dr. Lisa Chen', specialty: 'Psychiatrist', hospital: 'Metro Hospital, Mumbai', available: true, nextSlot: 'Today 5PM', isRural: false, languages: ['English', 'Hindi'] },
  { id: '6', doctorName: 'Dr. Raj Malhotra', specialty: 'Orthopedic', hospital: 'PHC, Rajasthan', available: true, nextSlot: 'Tomorrow 9AM', isRural: true, languages: ['Hindi'] },
  { id: '7', doctorName: 'Dr. Kavita Singh', specialty: 'Gynecologist', hospital: 'CHC, MP', available: true, nextSlot: 'Today 3PM', isRural: true, languages: ['Hindi', 'English'] },
  { id: '8', doctorName: 'Dr. Vikram Joshi', specialty: 'General Physician', hospital: 'Urban Health Post, Delhi', available: true, nextSlot: 'Today 7PM', isRural: false, languages: ['English', 'Hindi', 'Punjabi'] },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialty = searchParams.get('specialty');
  const rural = searchParams.get('rural') === 'true';

  let filtered = consultations;
  
  if (specialty && specialty !== 'all') {
    filtered = filtered.filter(c => c.specialty === specialty);
  }
  
  if (rural) {
    filtered = filtered.filter(c => c.isRural);
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    consultations: filtered
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { consultationId, userId, date, time } = body;

  if (!consultationId || !date || !time) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const consultation = consultations.find(c => c.id === consultationId);
  if (!consultation) {
    return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
  }

  if (!consultation.available) {
    return NextResponse.json({ error: 'Consultation not available' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: 'Consultation booked successfully',
    meetingLink: `https://meet.zyntracare.com/${consultationId}`,
    booking: { consultationId, userId, date, time }
  });
}