import { NextResponse } from 'next/server';
import { authRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rateLimitCheck = authRateLimit(request as any, 5, 60000);
  if (rateLimitCheck) return rateLimitCheck;
  try {
    const { patientName, location, message, phone } = await request.json();

    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const alertTo = process.env.EMERGENCY_ALERT_PHONE;

    if (!accountSid || !authToken || !twilioFrom || !alertTo) {
      return NextResponse.json({
        message: 'SMS service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and EMERGENCY_ALERT_PHONE in .env.local',
        demo: true,
        simulated: true,
        alert: {
          patient: patientName || 'Unknown',
          location: `${location.lat}, ${location.lng}`,
          mapsUrl: `https://www.google.com/maps?q=${location.lat},${location.lng}`,
          message: message || 'Emergency SOS alert from ZyntraCare',
          timestamp: new Date().toISOString(),
        },
      }, { status: 200 });
    }

    const twilio = await import('twilio');
    const client = twilio.default(accountSid, authToken);

    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const smsBody = [
      '🚨 EMERGENCY SOS - ZyntraCare',
      `Patient: ${patientName || 'Unknown'}`,
      `Location: ${mapsUrl}`,
      `Message: ${message || 'Emergency alert'}`,
      `Time: ${new Date().toLocaleString('en-IN')}`,
    ].join('\n');

    await client.messages.create({
      body: smsBody,
      from: twilioFrom,
      to: alertTo,
    });

    return NextResponse.json({
      message: 'SMS sent successfully',
      demo: false,
      simulated: false,
      alert: {
        patient: patientName || 'Unknown',
        location: `${location.lat}, ${location.lng}`,
        mapsUrl,
        message: message || 'Emergency SOS alert from ZyntraCare',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('SMS send error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}
