import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const OPENCPS_URL = 'https://api.open-cps.org/v1/medicines';
const OPENFDA_URL = 'https://api.fda.gov/drug/label.json';

const INDIAN_MEDICINES: Record<string, { name: string; manufacturer: string; category: string }> = {
  'COVAS': { name: 'Covaxin', manufacturer: 'Bharat Biotech', category: 'Vaccine' },
  'COVSH': { name: 'Covishield', manufacturer: 'Serum Institute of India', category: 'Vaccine' },
  'AMOX500': { name: 'Amoxicillin 500mg', manufacturer: 'Cipla', category: 'Antibiotic' },
  'AZITH500': { name: 'Azithromycin 500mg', manufacturer: 'Sun Pharma', category: 'Antibiotic' },
  'PARA500': { name: 'Paracetamol 500mg', manufacturer: 'GSK', category: 'Analgesic' },
  'DOLO500': { name: 'Dolo 500mg', manufacturer: 'Micro Labs', category: 'Analgesic' },
  'IBU400': { name: 'Ibuprofen 400mg', manufacturer: 'Dr. Reddy\'s', category: 'Anti-inflammatory' },
  'OMEP20': { name: 'Omeprazole 20mg', manufacturer: 'AstraZeneca', category: 'Antacid' },
  'CROZI500': { name: 'Crocin 500mg', manufacturer: 'GSK', category: 'Analgesic' },
  'METFOR500': { name: 'Metformin 500mg', manufacturer: 'USV', category: 'Antidiabetic' },
  'ATOR10': { name: 'Atorvastatin 10mg', manufacturer: 'Pfizer', category: 'Cholesterol' },
  'AMLOD5': { name: 'Amlodipine 5mg', manufacturer: 'Pfizer', category: 'BP Medication' },
  'TELM40': { name: 'Telma 40mg', manufacturer: 'Glenmark', category: 'BP Medication' },
  'PAN20': { name: 'Pantoprazole 20mg', manufacturer: 'Sun Pharma', category: 'Antacid' },
  'MONTC10': { name: 'Montair LC 10mg', manufacturer: 'Cipla', category: 'Antiallergic' },
  'LEVOC5': { name: 'Levocetirizine 5mg', manufacturer: 'Dr. Reddy\'s', category: 'Antiallergic' },
  'BECLOS': { name: 'Becosules', manufacturer: 'Pfizer', category: 'Multivitamin' },
  'SUPRAD': { name: 'Supradyn', manufacturer: 'Bayer', category: 'Multivitamin' },
  'ZINC20': { name: 'Zincovit', manufacturer: 'Apex', category: 'Supplement' },
  'VITD3': { name: 'Vitamin D3 60K', manufacturer: 'Abbott', category: 'Supplement' },
  'FESO200': { name: 'Ferrous Sulphate 200mg', manufacturer: 'Merck', category: 'Supplement' },
  'NEUROB': { name: 'Neurobion', manufacturer: 'Procter & Gamble', category: 'Vitamin B Complex' },
  'SHELCAL': { name: 'Shelcal 500', manufacturer: 'Elder Pharma', category: 'Calcium Supplement' },
  'LIV52': { name: 'Liv 52', manufacturer: 'Himalaya', category: 'Liver Support' },
  'PUMPC': { name: 'Pumpkin C', manufacturer: 'Himalaya', category: 'Supplement' },
};

interface RegistryEntry {
  code: string;
  name: string;
  manufacturer: string;
  category: string;
  batchNumber: string | null;
  expiryDate: string | null;
  source: string;
  verified: boolean;
}

async function getRegistry(): Promise<RegistryEntry[]> {
  const dbRecords = await prisma.medicineRecord.findMany();
  const dbMap = new Map(dbRecords.map((r) => [r.code, r]));
  const merged: RegistryEntry[] = [];

  for (const [code, med] of Object.entries(INDIAN_MEDICINES)) {
    const db = dbMap.get(code);
    merged.push({
      code,
      name: db?.name || med.name,
      manufacturer: db?.manufacturer || med.manufacturer,
      category: db?.category || med.category,
      batchNumber: db?.batchNumber ?? null,
      expiryDate: db?.expiryDate ?? null,
      source: db ? 'ZyntraCare Medicine Registry' : 'Indian Medicines Database',
      verified: true,
    });
    dbMap.delete(code);
  }
  for (const db of dbMap.values()) {
    merged.push({
      code: db.code,
      name: db.name,
      manufacturer: db.manufacturer,
      category: db.category,
      batchNumber: db.batchNumber,
      expiryDate: db.expiryDate,
      source: 'Community Verified',
      verified: true,
    });
  }
  return merged;
}

async function lookupOpenFDA(medicineName: string) {
  try {
    const res = await fetch(`${OPENFDA_URL}?search=openfda.brand_name:${encodeURIComponent(medicineName)}&limit=3`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.length) return null;
    const r = data.results[0];
    return {
      name: r.openfda?.brand_name?.[0] || r.openfda?.generic_name?.[0] || medicineName,
      manufacturer: r.openfda?.manufacturer_name?.[0] || 'Unknown',
      category: r.openfda?.product_type?.[0] || 'Medicine',
    };
  } catch {
    return null;
  }
}

async function lookupOpenCPS(medicineName: string) {
  try {
    const res = await fetch(`${OPENCPS_URL}?search=${encodeURIComponent(medicineName)}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.data?.length) return null;
    const r = data.data[0];
    return { name: r.name || medicineName, manufacturer: r.manufacturer || 'Unknown', category: r.category || 'Medicine' };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const code = searchParams.get('code')?.trim().toUpperCase() || '';
    const registry = await getRegistry();

    if (code) {
      const match = registry.find((r) => r.code === code);
      if (match) {
        return NextResponse.json({
          success: true,
          verified: true,
          medicine: { ...match, timestamp: Date.now() },
        });
      }

      const fda = await lookupOpenFDA(code);
      if (fda) {
        return NextResponse.json({
          success: true,
          verified: true,
          medicine: { code, ...fda, batchNumber: null, expiryDate: null, timestamp: Date.now(), source: 'US FDA OpenData' },
        });
      }

      return NextResponse.json({
        success: true,
        verified: false,
        medicine: {
          code, name: code, manufacturer: 'Not found', category: 'Not in registry',
          batchNumber: null, expiryDate: null, timestamp: Date.now(),
          source: 'No match in registry — this does not mean the medicine is fake',
        },
      });
    }

    if (search) {
      const matches = registry.filter((r) =>
        r.code.toLowerCase().includes(search) ||
        r.name.toLowerCase().includes(search) ||
        r.manufacturer.toLowerCase().includes(search)
      );
      const liveRes = await Promise.allSettled([lookupOpenFDA(search), lookupOpenCPS(search)]);
      return NextResponse.json({
        success: true,
        medicines: matches,
        fdaResult: liveRes[0].status === 'fulfilled' ? liveRes[0].value : null,
        openCPSResult: liveRes[1].status === 'fulfilled' ? liveRes[1].value : null,
        total: matches.length,
      });
    }

    return NextResponse.json({ success: true, medicines: registry, total: registry.length });
  } catch (error) {
    console.error('Medicine Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, manufacturer, category, batchNumber, expiryDate } = body;
    if (!code) return NextResponse.json({ error: 'Medicine code is required' }, { status: 400 });

    const upperCode = code.toUpperCase();
    const record = await prisma.medicineRecord.upsert({
      where: { code: upperCode },
      update: {
        name: name || undefined,
        manufacturer: manufacturer || undefined,
        category: category || undefined,
        batchNumber: batchNumber || undefined,
        expiryDate: expiryDate || undefined,
      },
      create: {
        code: upperCode,
        name: name || 'Unknown',
        manufacturer: manufacturer || 'Unknown',
        composition: '',
        category: category || 'User-Submitted',
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        verified: true,
      },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      medicine: {
        code: upperCode, name: record.name, manufacturer: record.manufacturer, category: record.category,
        batchNumber: record.batchNumber, expiryDate: record.expiryDate, timestamp: Date.now(),
        source: 'Community Verified',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Medicine POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}