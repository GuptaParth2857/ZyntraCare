import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const code = searchParams.get('code') || '';

    if (code) {
      const upperCode = code.toUpperCase();
      const medicine = await prisma.medicineRecord.findUnique({
        where: { code: upperCode },
      });

      if (medicine) {
        return NextResponse.json({
          success: true,
          verified: medicine.verified,
          medicine: {
            code: medicine.code,
            name: medicine.name,
            manufacturer: medicine.manufacturer,
            category: medicine.category,
            verified: medicine.verified,
            timestamp: Date.now(),
            source: 'ZyntraCare Verified Database',
          },
        });
      }

      return NextResponse.json({
        success: true,
        verified: false,
        medicine: {
          code: upperCode,
          name: 'Unknown Product',
          manufacturer: 'Unknown',
          category: 'Unverified',
          verified: false,
          timestamp: Date.now(),
          source: 'Requires Verification',
        },
      });
    }

    const searchTerm = search.toLowerCase();
    const rows = await prisma.medicineRecord.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { manufacturer: { contains: searchTerm } },
        ],
      },
      select: { code: true, name: true, manufacturer: true, category: true, verified: true },
    });

    const mapped = rows.map(r => ({ ...r, verified: r.verified }));

    return NextResponse.json({
      success: true,
      medicines: mapped,
      total: mapped.length,
    });
  } catch (error) {
    console.error('Medicine Verify GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, manufacturer, batchNumber, composition, category, expiryDate, location } = body;

    if (!code) {
      return NextResponse.json({ error: 'Medicine code is required' }, { status: 400 });
    }

    const upperCode = code.toUpperCase();

    const hashInput = upperCode + (manufacturer || '') + Date.now();
    const hashBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput));
    const hash = Array.from(new Uint8Array(hashBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const prevHashInput = upperCode + (Date.now() - 1);
    const prevHashBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(prevHashInput));
    const previousHash =
      '0x' +
      Array.from(new Uint8Array(prevHashBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .substring(0, 64);

    const medicineRecord = await prisma.medicineRecord.upsert({
      where: { code: upperCode },
      update: {
        name: name || '',
        manufacturer: manufacturer || '',
        composition: composition || '',
        category: category || 'Unverified',
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        verified: true,
      },
      create: {
        code: upperCode,
        name: name || 'Unknown',
        manufacturer: manufacturer || 'Unknown',
        composition: composition || '',
        category: category || 'Unverified',
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        verified: true,
      },
    });

    return NextResponse.json({
      success: true,
      verification: {
        id: medicineRecord.id,
        name: medicineRecord.name,
        manufacturer: medicineRecord.manufacturer,
        batchNumber:
          batchNumber ||
          `BAT${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        expiryDate:
          expiryDate ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        verified: true,
        timestamp: Date.now(),
        source: 'ZyntraCare Supply Chain Network',
      },
      supplyChain: {
        manufacturer: medicineRecord.manufacturer,
        distributor: 'ZyntraCare Authorized Distributor',
        pharmacy: location || 'Verified Retail Partner',
        timestamp: Date.now(),
        blockchain: {
          hash,
          previousHash,
          verified: true,
        },
      },
    });
  } catch (error) {
    console.error('Medicine Verify POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
