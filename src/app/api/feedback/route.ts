import { NextRequest, NextResponse } from 'next/server';

// Feedback storage API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, category, message, name, email } = body;

    if (!rating || !message) {
      return NextResponse.json({ error: 'Rating and message are required' }, { status: 400 });
    }

    // In production: save to database. For now, echo back success.
    const feedback = {
      id: `FB_${Date.now()}`,
      rating,
      category: category || 'Overall Experience',
      message,
      name: name || 'Anonymous',
      email: email || null,
      createdAt: new Date().toISOString(),
    };

    console.log('New feedback received:', feedback);

    return NextResponse.json({ success: true, id: feedback.id, message: 'Thank you for your feedback!' });
  } catch {
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

export async function GET() {
  // Admin only - return recent feedback (mock data for now)
  const mockFeedback = [
    { id: 'FB_001', rating: 5, category: 'AI Diagnosis Tool', message: 'Incredibly accurate diagnosis suggestions!', name: 'Rahul S', createdAt: '2026-04-05T10:30:00Z' },
    { id: 'FB_002', rating: 4, category: 'Hospital Booking', message: 'Very smooth booking process. Minor UI improvements needed.', name: 'Anita M', createdAt: '2026-04-04T15:20:00Z' },
    { id: 'FB_003', rating: 5, category: 'Overall Experience', message: 'Best healthcare platform I have used!', name: 'Anonymous', createdAt: '2026-04-03T09:10:00Z' },
  ];
  return NextResponse.json(mockFeedback);
}
