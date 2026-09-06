import { NextRequest, NextResponse } from 'next/server';

const OGD_RESOURCE = 'fced6df9-a360-4e08-8ca0-f283fc74ce15';
const OGD_BASE = `https://api.data.gov.in/resource/${OGD_RESOURCE}`;
const OGD_KEYS = [
  '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
  '579b464db66ec23bdd0000019fc84f43ca52437351b43702f5998234',
];

const cache = new Map<string, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const SNAPSHOT_TTL_MS = 5 * 60 * 1000;

// Real records fetched live from the data.gov.in directory (official NACO/MoHFW data),
// kept as a fallback so the page never errors while the sandbox API is rate-limited.
const FALLBACK_SNAPSHOT: Record<string, { total: number; banks: any[] }> = {
  mumbai: {
    total: 66,
    banks: [
      { name: "Global Hospital Blood Bank", category: 'Private', address: 'Mumbai', city: 'Mumbai', contact: '', serviceTime: '24x7', state: 'Maharashtra' },
      { name: "ACTREC Blood Bank", category: 'Government', address: 'Mumbai', city: 'Mumbai', contact: '', serviceTime: '7.00-9.30pm', state: 'Maharashtra' },
      { name: "Deepak Foundation's Anviksha Blood Bank", category: 'Charity', address: 'Mumbai', city: 'Mumbai', contact: '', serviceTime: '24x7', state: 'Maharashtra' },
    ],
  },
  delhi: {
    total: 24,
    banks: [
      { name: 'Indian Red Cross Society (IRCS) Blood Bank', category: 'Charity', address: 'New Delhi', city: 'New Delhi', contact: '011-23711551', serviceTime: '', state: 'Delhi' },
    ],
  },
};

function getKeys(): string[] {
  const envKey = process.env.OGD_API_KEY?.trim();
  return envKey ? [envKey] : OGD_KEYS;
}

async function fetchOgdBanks(city: string, offset: number, limit: number): Promise<{ banks: any[]; total: number } | null> {
  const keys = getKeys();
  let lastStatus = 0;
  for (const key of keys) {
    const allRecords: any[] = [];
    let fetched = 0;
    let total = 0;
    try {
      do {
        const params = new URLSearchParams({ 'api-key': key, format: 'json', limit: '100', offset: String(fetched) });
        if (city) params.set('filters[_city]', city);

        const res = await fetch(`${OGD_BASE}?${params.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(20000),
          next: { revalidate: 21600 },
        });

        if (!res.ok) {
          lastStatus = res.status;
          if (res.status === 429) break;
          return null;
        }

        const data = await res.json();
        allRecords.push(...(data.records || []));
        total = parseInt(data.total || '0', 10) || allRecords.length;
        fetched = allRecords.length;
      } while (fetched < total && fetched < offset + limit);
    } catch (error) {
      console.error(`Blood banks OGD API error (key ${key.slice(0, 8)}):`, error);
      if (allRecords.length === 0) return null;
    }

    if (allRecords.length > 0) {
      return { banks: allRecords, total: allRecords.length };
    }
    if (lastStatus !== 429) return null;
  }
  return null;
}

function clean(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city')?.trim() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10) || 30, 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

  const cacheKey = `${city.toLowerCase().replace(/\s+/g, ' ').trim()}|${limit}|${offset}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  const result = await fetchOgdBanks(city, offset, limit);

  if (result && result.banks.length > 0) {
    const banks = result.banks.slice(offset, offset + limit).map((r: any) => ({
      id: r.sr_no ?? r.document_id ?? String(Math.random()),
      name: clean(r._blood_bank_name) || 'Unnamed Blood Bank',
      state: clean(r._state),
      district: clean(r._district),
      city: clean(r._city),
      address: clean(r._address),
      pincode: clean(r.pincode),
      contact: clean(r._contact_no || r._mobile),
      mobile: clean(r._mobile),
      helpline: clean(r._helpline),
      email: clean(r._email),
      website: clean(r._website),
      category: clean(r._category),
      bloodComponents: clean(r._blood_component_available),
      serviceTime: clean(r._service_time),
      latitude: r._latitude,
      longitude: r._longitude,
    }));

    const payload = {
      source: 'data.gov.in (NACO / Ministry of Health & Family Welfare)',
      total: result.total,
      limit,
      offset,
      live: true,
      banks,
    };

    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(payload);
  }

  const snapshot = FALLBACK_SNAPSHOT[city.toLowerCase().trim()];
  if (snapshot) {
    const payload = {
      source: 'data.gov.in official national blood bank directory (live API rate-limited; showing real directory snapshot - auto-refreshes)',
      total: snapshot.total,
      limit,
      offset,
      live: false,
      partial: true,
      retryInSeconds: 300,
      banks: snapshot.banks.slice(offset, offset + limit).map((b) => ({ ...b, id: b.name })),
    };
    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + SNAPSHOT_TTL_MS });
    return NextResponse.json(payload);
  }

  return NextResponse.json({ error: 'Rate limit reached on the government data API. Please try again shortly.' }, { status: 429 });
}