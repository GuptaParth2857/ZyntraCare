import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  try {
    const programs = await prisma.corporateProgram.findMany({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, programs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (body.action === 'register-company') {
      const program = await prisma.corporateProgram.create({
        data: {
          companyName: body.companyName,
          contactName: body.contactName,
          contactEmail: body.contactEmail,
          contactPhone: body.contactPhone,
          employeeCount: body.employeeCount,
          services: body.services ? JSON.stringify(body.services) : '[]',
        },
      });
      return NextResponse.json({ success: true, program });
    }
    
    if (body.action === 'add-member') {
      const member = await prisma.corporateMember.create({
        data: {
          programId: body.programId,
          userId: body.userId,
          employeeId: body.employeeId,
          name: body.name,
          email: body.email,
          department: body.department,
        },
      });
      return NextResponse.json({ success: true, member });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const body = await req.json();
    const program = await prisma.corporateProgram.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, program });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
