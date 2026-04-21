import { NextResponse } from 'next/server';

interface BloodDonor {
  id: string;
  name: string;
  bloodType: string;
  location: string;
  distance: string;
  phone: string;
  available: boolean;
  lastDonated: string;
  donations: number;
  verified: boolean;
}

const mockDonors: BloodDonor[] = [
  { id: '1', name: 'Rahul S.', bloodType: 'O-', location: 'HSR Layout, Bangalore', distance: '1.2km', phone: '9876543210', available: true, lastDonated: '45 days ago', donations: 12, verified: true },
  { id: '2', name: 'Priya M.', bloodType: 'A+', location: 'Koramangala, Bangalore', distance: '2.5km', phone: '9876543211', available: true, lastDonated: '90 days ago', donations: 8, verified: true },
  { id: '3', name: 'Amit K.', bloodType: 'B+', location: 'Indiranagar, Bangalore', distance: '3.8km', phone: '9876543212', available: false, lastDonated: '30 days ago', donations: 15, verified: true },
  { id: '4', name: 'Sneha R.', bloodType: 'AB+', location: 'Whitefield, Bangalore', distance: '5.2km', phone: '9876543213', available: true, lastDonated: '120 days ago', donations: 5, verified: true },
  { id: '5', name: 'Vikram J.', bloodType: 'O+', location: 'JP Nagar, Bangalore', distance: '4.1km', phone: '9876543214', available: true, lastDonated: '60 days ago', donations: 20, verified: true },
  { id: '6', name: 'Anjali P.', bloodType: 'A-', location: 'MG Road, Bangalore', distance: '2.0km', phone: '9876543215', available: true, lastDonated: '75 days ago', donations: 7, verified: false },
  { id: '7', name: 'Rajesh T.', bloodType: 'B-', location: 'Bannerghatta, Bangalore', distance: '6.5km', phone: '9876543216', available: false, lastDonated: '25 days ago', donations: 3, verified: true },
  { id: '8', name: 'Meera S.', bloodType: 'AB-', location: 'City Market, Bangalore', distance: '1.8km', phone: '9876543217', available: true, lastDonated: '180 days ago', donations: 10, verified: true },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bloodType = searchParams.get('bloodType');
  const location = searchParams.get('location');

  let filtered = mockDonors;
  
  if (bloodType) {
    filtered = filtered.filter(d => d.bloodType === bloodType);
  }
  
  if (location) {
    filtered = filtered.filter(d => d.location.toLowerCase().includes(location.toLowerCase()));
  }

  return NextResponse.json({
    success: true,
    data: filtered,
    stats: {
      total: mockDonors.length,
      available: mockDonors.filter(d => d.available).length,
      verified: mockDonors.filter(d => d.verified).length,
      totalDonations: mockDonors.reduce((a, d) => a + d.donations, 0),
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, bloodType, location, urgency, message } = body;

    if (!name || !phone || !bloodType || !location) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Blood request submitted successfully',
      requestId: `BR-${Date.now()}`,
      data: { name, bloodType, location, urgency, message }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}