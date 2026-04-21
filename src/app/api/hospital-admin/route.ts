import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hospitalId = searchParams.get('hospitalId');
  const userId = searchParams.get('userId');
  
  try {
    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId;
    if (userId) where.userId = userId;
    
    const admins = await prisma.hospitalAdmin.findMany({
      where,
      include: { hospital: true },
    });
    
    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Hospital admin error:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, hospitalId, permissions } = body;
    
    if (!userId || !hospitalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const admin = await prisma.hospitalAdmin.create({
      data: {
        userId,
        hospitalId,
        permissions: permissions || 'read,write',
      },
    });
    
    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Create hospital admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminId, permissions, hospitalId } = body;
    
    if (!adminId) {
      return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });
    }
    
    const admin = await prisma.hospitalAdmin.update({
      where: { id: adminId },
      data: {
        permissions,
        hospitalId,
      },
    });
    
    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Update hospital admin error:', error);
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminId = searchParams.get('adminId');
  
  if (!adminId) {
    return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });
  }
  
  try {
    await prisma.hospitalAdmin.delete({ where: { id: adminId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete hospital admin error:', error);
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 });
  }
}