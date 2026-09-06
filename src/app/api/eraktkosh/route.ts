import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE = 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/nearbyBB.cnt';
const STATES: { code: string; name: string }[] = [
  { code: '97', name: 'Delhi' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '36', name: 'Telangana' },
  { code: '28', name: 'Andhra Pradesh' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '32', name: 'Kerala' },
  { code: '24', name: 'Gujarat' },
  { code: '19', name: 'West Bengal' },
  { code: '10', name: 'Bihar' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '99', name: 'Uttar Pradesh' },
  { code: '95', name: 'Uttarakhand' },
  { code: '98', name: 'Rajasthan' },
  { code: '93', name: 'Punjab' },
  { code: '30', name: 'Goa' },
  { code: '18', name: 'Assam' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '14', name: 'Manipur' },
  { code: '17', name: 'Meghalaya' },
  { code: '15', name: 'Mizoram' },
  { code: '13', name: 'Nagaland' },
  { code: '16', name: 'Tripura' },
  { code: '11', name: 'Sikkim' },
  { code: '94', name: 'Chandigarh' },
  { code: '25', name: 'Dadra And Nagar Haveli And Daman And Diu' },
  { code: '31', name: 'Lakshadweep' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '91', name: 'Jammu and Kashmir' },
  { code: '37', name: 'Ladakh' },
  { code: '34', name: 'Puducherry' },
  { code: '92', name: 'Himachal Pradesh' },
  { code: '96', name: 'Haryana' },
];

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const DISTRICT_TTL = 24 * 60 * 60 * 1000;
const STOCK_TTL = 10 * 60 * 1000;

async function getJSON(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Basic dW5kZWZpbmVkOnVuZGVmaW5lZA==' },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('e-RaktKosh fetch error:', error);
    return null;
  }
}

function stripHtml(value: string): string {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseStock(html: any): { available: boolean; units: Record<string, string>; raw: string } {
  const text = stripHtml(html || '');
  const units: Record<string, string> = {};
  const re = /([A-Z]{1,2}[+-])Ve?\s*:\s*([\d.]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    units[`${m[1]}`] = m[2];
  }
  const available = /available/i.test(text) && !/not available/i.test(text);
  return { available, units, raw: text };
}

function parseBank(row: any[]): any {
  const info = String(row[1] || '');
  const parts = info.split('<br/>').map((p: string) => p.trim()).filter(Boolean);
  const name = (parts[0] || 'Blood Bank').replace(/^[-*\d.\s]+/, '').trim();
  const address = parts.length > 1 ? parts[1] : '';
  const phoneM = info.match(/Phone:\s*([^,]+)/i);
  const faxM = info.match(/Fax:\s*([^,]+)/i);
  const emailM = info.match(/Email:\s*([^\s,]+)/i);

  const stock = parseStock(row[3]);
  const lastUpdatedRaw = stripHtml(row[4]);
  const lastUpdated = /live/i.test(String(row[4])) ? 'Live Now' : (lastUpdatedRaw || '');

  return {
    name,
    address,
    category: String(row[2] || ''),
    stock: stock.raw,
    available: stock.available,
    units: stock.units,
    phone: phoneM ? phoneM[1].trim() : '',
    fax: faxM ? faxM[1].trim() : '',
    email: emailM ? emailM[1].trim() : '',
    lastUpdated,
    type: String(row[5] || ''),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'states';
  const state = searchParams.get('state')?.trim() || '';
  const district = searchParams.get('district')?.trim() || '';
  const group = searchParams.get('group')?.trim() || 'all';
  const component = searchParams.get('component')?.trim() || '11';

  const cacheKey = `${action}|${state}|${district}|${group}|${component}`;
  const ttl = action === 'stock' ? STOCK_TTL : DISTRICT_TTL;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  if (action === 'states') {
    const payload = { success: true, source: 'e-RaktKosh - National Blood Transfusion Council, MoHFW', states: STATES };
    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + DISTRICT_TTL });
    return NextResponse.json(payload);
  }

  if (action === 'districts') {
    if (!state) return NextResponse.json({ error: 'state required' }, { status: 400 });
    const data = await getJSON(`${BASE}?hmode=GETDISTRICTLIST&selectedStateCode=${encodeURIComponent(state)}`);
    if (!data) return NextResponse.json({ error: 'Unable to reach e-RaktKosh' }, { status: 502 });
    const districts = (data.records || []).map((r: any) => ({ code: String(r.value), name: String(r.id) }));
    const payload = { success: true, districts };
    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + DISTRICT_TTL });
    return NextResponse.json(payload);
  }

  if (action === 'stock') {
    if (!state || !district) return NextResponse.json({ error: 'state and district required' }, { status: 400 });
    const url = `${BASE}?hmode=GETNEARBYSTOCKDETAILS&stateCode=${encodeURIComponent(state)}&districtCode=${encodeURIComponent(district)}&bloodGroup=${encodeURIComponent(group)}&bloodComponent=${encodeURIComponent(component)}&lang=0`;
    const data = await getJSON(url);
    if (!data) return NextResponse.json({ error: 'Unable to reach e-RaktKosh' }, { status: 502 });

    const banks = (data.data || []).map(parseBank);
    if (banks.length === 0) return NextResponse.json({ error: 'No blood banks reported stock for this area' }, { status: 404 });

    const payload = {
      success: true,
      source: 'e-RaktKosh - National Blood Transfusion Council, MoHFW',
      live: true,
      total: banks.length,
      banks,
    };
    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + STOCK_TTL });
    return NextResponse.json(payload);
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}