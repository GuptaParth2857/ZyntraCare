import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(1, 'Message is required').max(5000),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const rateLimitCheck = await authRateLimit(req, 5, 60000);
  if (rateLimitCheck) return rateLimitCheck;

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const message = await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        userId: parsed.data.userId || null,
      },
    });
    return NextResponse.json({
      message: 'Thank you for reaching out! We will get back to you within 24-48 hours.',
      id: message.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Contact POST error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
