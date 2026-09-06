import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const EK_BASE = 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/nearbyBB.cnt';
const EK_CAMPS_TTL = 10 * 60 * 1000;
let ekCampsCache: { data: CampEntry[]; expiresAt: number } | null = null;

interface CampEntry {
  id: string;
  name: string;
  campType?: string;
  date: string;
  time: string;
  location: string;
  city: string;
  state: string;
  services: string[];
  hospital: string;
  registration: string;
  spotsAvailable?: number;
  organizedBy?: string;
  contact?: string;
  registerUrl?: string;
  source: 'db' | 'eraktkosh';
}

function parseEkCamp(row: unknown): CampEntry | null {
  if (!Array.isArray(row) || row.length < 6) return null;
  const col = (i: number) => String(row[i] ?? '').trim();
  const date = col(1).split('<br/>')[0].replace(/^Date:\s*/i, '').trim() || 'TBA';
  const registerHtml = col(10);
  const href = registerHtml.match(/href\s*=\s*["']?([^"'\s>]+)/i);
  const registerUrl = href
    ? (href[1].startsWith('http') ? href[1] : `https://eraktkosh.mohfw.gov.in${href[1]}`)
    : '';
  return {
    id: `ek-${col(0) || Math.random().toString(36).slice(2, 8)}`,
    name: col(3) || 'Blood Donation Camp',
    date,
    time: col(2) || 'TBA',
    location: col(4) || 'Awaiting venue details',
    city: col(6) || 'N/A',
    state: col(5) || 'N/A',
    services: ['Blood Donation'],
    hospital: col(8) || col(9) || 'e-RaktKosh',
    registration: 'Free',
    organizedBy: col(9) || col(8) || '',
    contact: col(7) || '',
    registerUrl,
    source: 'eraktkosh',
  };
}

async function fetchEkCamps(): Promise<CampEntry[]> {
  if (ekCampsCache && ekCampsCache.expiresAt > Date.now()) return ekCampsCache.data;
  try {
    const res = await fetch(`${EK_BASE}?hmode=GETNEARBYCAMPS&stateCode=-1&districtCode=-1&lang=0`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Basic dW5kZWZpbmVkOnVuZGVmaW5lZA==',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const camps = (Array.isArray(data?.data) ? data.data : [])
      .map(parseEkCamp)
      .filter((c: CampEntry | null): c is CampEntry => c !== null);
    ekCampsCache = { data: camps, expiresAt: Date.now() + EK_CAMPS_TTL };
    return camps;
  } catch (error) {
    console.error('e-RaktKosh camps error:', error);
    return [];
  }
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isUpcoming(dateStr: string): boolean {
  if (!dateStr) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr >= todayISO();
  }
  const t = new Date(dateStr).getTime();
  return isNaN(t) ? true : t >= startOfToday();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city')?.toLowerCase() ?? '';
  const state = searchParams.get('state')?.toLowerCase() ?? '';

  try {
    const [camps, citiesResult, statesResult, ekCamps] = await Promise.all([
      prisma.healthCamp.findMany({ orderBy: { date: 'asc' } }),
      prisma.healthCamp.findMany({
        select: { city: true },
        distinct: ['city'],
      }),
      prisma.healthCamp.findMany({
        select: { state: true },
        distinct: ['state'],
      }),
      fetchEkCamps(),
    ]);

    const dbCamps: CampEntry[] = camps.map(c => ({
      id: c.id,
      name: c.name,
      campType: c.campType,
      date: c.date,
      time: c.time,
      location: c.location,
      city: c.city,
      state: c.state,
      services: typeof c.services === 'string' ? JSON.parse(c.services) : c.services,
      hospital: c.hospital,
      registration: c.registration,
      spotsAvailable: c.spotsAvailable,
      organizedBy: c.organizedBy || c.hospital,
      source: 'db',
    }));

    const allCamps = [...dbCamps, ...ekCamps];

    const filtered = allCamps.filter(c => {
      if (!isUpcoming(c.date)) return false;
      if (city && !(c.city || '').toLowerCase().includes(city)) return false;
      if (state && !(c.state || '').toLowerCase().includes(state)) return false;
      return true;
    });

    return NextResponse.json({
      camps: filtered,
      total: filtered.length,
      cities: citiesResult.map(c => c.city).filter(Boolean),
      states: statesResult.map(s => s.state).filter(Boolean),
      sources: {
        db: filtered.filter(c => c.source === 'db').length,
        eraktkosh: filtered.filter(c => c.source === 'eraktkosh').length,
      },
      officialNote: 'Official blood donation camps from e-RaktKosh (National Blood Transfusion Council, MoHFW).',
    });
  } catch (error) {
    console.error('Camps API error:', error);
    return NextResponse.json({ error: 'Failed to fetch camps' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, raw: false });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const camp = await prisma.healthCamp.create({
      data: {
        name: body.name,
        campType: body.campType || body.type,
        date: body.date,
        time: body.time,
        location: body.location,
        city: body.city,
        state: body.state,
        lat: body.lat ?? body.locationCoords?.lat ?? null,
        lng: body.lng ?? body.locationCoords?.lng ?? null,
        services: JSON.stringify(body.services || []),
        hospital: body.hospital,
        hospitalId: body.hospitalId || null,
        registration: body.registration || 'Free',
        spotsAvailable: body.spotsAvailable ?? 50,
        organizedBy: body.organizedBy || body.hospital,
      },
    });

    return NextResponse.json({ success: true, camp });
  } catch (error) {
    console.error('Failed to create camp:', error);
    return NextResponse.json({ error: 'Failed to create camp' }, { status: 500 });
  }
}
