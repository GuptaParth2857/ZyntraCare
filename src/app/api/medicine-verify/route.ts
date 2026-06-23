import { NextRequest, NextResponse } from 'next/server';

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
      purpose: r.purpose?.[0] || '',
      warnings: r.warnings?.[0] || '',
      dosage: r.dosage_and_administration?.[0] || '',
    };
  } catch { return null; }
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
    return data.data[0];
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const code = searchParams.get('code')?.trim().toUpperCase() || '';

    if (code) {
      const indian = INDIAN_MEDICINES[code];
      if (indian) {
        return NextResponse.json({
          success: true, verified: true,
          medicine: { code, ...indian, timestamp: Date.now(), source: 'Indian Medicines Database' },
        });
      }

      const fda = await lookupOpenFDA(code);
      if (fda) {
        return NextResponse.json({
          success: true, verified: true,
          medicine: { code, ...fda, timestamp: Date.now(), source: 'US FDA OpenData' },
        });
      }

      return NextResponse.json({
        success: true, verified: false,
        medicine: { code, name: code, manufacturer: 'Unknown', category: 'Unverified', timestamp: Date.now(), source: 'No match found' },
      });
    }

    if (search) {
      const q = search.toLowerCase();
      const localMatches = Object.entries(INDIAN_MEDICINES)
        .filter(([code, med]) => code.toLowerCase().includes(q) || med.name.toLowerCase().includes(q) || med.manufacturer.toLowerCase().includes(q))
        .map(([code, med]) => ({ code, ...med, verified: true }));

      const fda = await lookupOpenFDA(search);
      const openCPS = await lookupOpenCPS(search);

      return NextResponse.json({
        success: true,
        medicines: localMatches,
        fdaResult: fda,
        openCPSResult: openCPS,
        total: localMatches.length,
      });
    }

    return NextResponse.json({
      success: true,
      medicines: Object.entries(INDIAN_MEDICINES).map(([code, med]) => ({ code, ...med, verified: true })),
      total: Object.keys(INDIAN_MEDICINES).length,
    });
  } catch (error) {
    console.error('Medicine Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const body = await req.json();
    const { code, name, manufacturer } = body;
    if (!code) return NextResponse.json({ error: 'Medicine code is required' }, { status: 400 });

    const upperCode = code.toUpperCase();
    const record = await prisma.medicineRecord.upsert({
      where: { code: upperCode },
      update: { name: name || '', manufacturer: manufacturer || '', verified: true },
      create: { code: upperCode, name: name || 'Unknown', manufacturer: manufacturer || 'Unknown', composition: '', category: 'User-Submitted', verified: true },
    });

    INDIAN_MEDICINES[upperCode] = { name: record.name, manufacturer: record.manufacturer, category: 'User-Submitted' };

    return NextResponse.json({
      success: true, verified: true,
      medicine: { code: upperCode, name: record.name, manufacturer: record.manufacturer, category: 'User-Submitted', timestamp: Date.now(), source: 'Community Verified' },
    });
  } catch (error) {
    console.error('Medicine POST error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
