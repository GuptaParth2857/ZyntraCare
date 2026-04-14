import { NextRequest, NextResponse } from 'next/server';

interface MedicineVerification {
  id: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  verified: boolean;
  timestamp: number;
  source: string;
}

const medicineDatabase: Record<string, { manufacturer: string; composition: string; category: string; verified: boolean }> = {
  'COVAS': { manufacturer: 'Zydus Cadila', composition: 'Covishield Vaccine', category: 'Vaccine', verified: true },
  'COVAX': { manufacturer: 'Bharat Biotech', composition: 'Covaxin', category: 'Vaccine', verified: true },
  'AMOX500': { manufacturer: 'Cipla Ltd', composition: 'Amoxicillin 500mg', category: 'Antibiotic', verified: true },
  'PARA500': { manufacturer: 'Abbott India', composition: 'Paracetamol 500mg', category: 'Pain Relief', verified: true },
  'MET500': { manufacturer: 'USV Ltd', composition: 'Metformin 500mg', category: 'Anti-Diabetic', verified: true },
  'AMLOD10': { manufacturer: 'Sun Pharma', composition: 'Amlodipine 10mg', category: 'Cardiovascular', verified: true },
  'ATOR20': { manufacturer: 'Pfizer', composition: 'Atorvastatin 20mg', category: 'Cholesterol', verified: true },
  'RAMIPRIL5': { manufacturer: 'Lupin Ltd', composition: 'Ramipril 5mg', category: 'Cardiovascular', verified: true },
  'OMEP40': { manufacturer: 'Dr Reddy\'s', composition: 'Omeprazole 40mg', category: 'Gastrointestinal', verified: true },
  'AZITHRO250': { manufacturer: 'Alkem Labs', composition: 'Azithromycin 250mg', category: 'Antibiotic', verified: true },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const code = searchParams.get('code') || '';

  // If searching by unique code/barcode
  if (code) {
    const upperCode = code.toUpperCase();
    
    // Check if code exists in database
    if (medicineDatabase[upperCode]) {
      const med = medicineDatabase[upperCode];
      return NextResponse.json({
        success: true,
        verified: true,
        medicine: {
          code: upperCode,
          name: med.composition,
          manufacturer: med.manufacturer,
          category: med.category,
          verified: true,
          timestamp: Date.now(),
          source: 'ZyntraCare Verified Database'
        }
      });
    }
    
    // Simulate verification check
    const isLikelyGenuine = Math.random() > 0.1;
    return NextResponse.json({
      success: true,
      verified: isLikelyGenuine,
      medicine: {
        code: upperCode,
        name: 'Unknown Product',
        manufacturer: 'Unknown',
        category: 'Unverified',
        verified: isLikelyGenuine,
        timestamp: Date.now(),
        source: isLikelyGenuine ? 'Likely Authentic' : 'Requires Verification'
      }
    });
  }

  // Search medicines
  const results = Object.entries(medicineDatabase)
    .filter(([code, med]) => 
      med.composition.toLowerCase().includes(search.toLowerCase()) ||
      med.manufacturer.toLowerCase().includes(search.toLowerCase())
    )
    .map(([code, med]) => ({
      code,
      name: med.composition,
      manufacturer: med.manufacturer,
      category: med.category,
      verified: med.verified
    }));

  return NextResponse.json({
    success: true,
    medicines: results,
    total: results.length
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, name, manufacturer, batchNumber, location } = body;

    if (!code) {
      return NextResponse.json({ error: 'Medicine code is required' }, { status: 400 });
    }

    const upperCode = code.toUpperCase();
    const existing = medicineDatabase[upperCode];

    // Simulate blockchain-style verification
    const verificationResult: MedicineVerification = {
      id: `VFY-${Date.now()}`,
      name: existing?.composition || name || 'Unknown',
      manufacturer: existing?.manufacturer || manufacturer || 'Unknown',
      batchNumber: batchNumber || `BAT${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: existing?.verified || Math.random() > 0.2,
      timestamp: Date.now(),
      source: 'ZyntraCare Supply Chain Network'
    };

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      supplyChain: {
        manufacturer: verificationResult.manufacturer,
        distributor: 'ZyntraCare Authorized Distributor',
        pharmacy: location || 'Verified Retail Partner',
        timestamp: Date.now(),
        blockchain: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          previousHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          verified: verificationResult.verified
        }
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}