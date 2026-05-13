import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

async function requireAdminOrHospitalAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (token.role !== 'admin' && token.role !== 'hospital_admin') {
    return NextResponse.json({ error: 'Admin or Hospital Admin access required' }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await requireAdminOrHospitalAdmin(req);
  if (authError) return authError;
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
  const authError = await requireAdminOrHospitalAdmin(req);
  if (authError) return authError;

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
  const authError = await requireAdminOrHospitalAdmin(req);
  if (authError) return authError;

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
  const authError = await requireAdminOrHospitalAdmin(req);
  if (authError) return authError;

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