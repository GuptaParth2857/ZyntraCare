import { NextResponse } from 'next/server';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
let cache: { data: any; at: number } | null = null;

const NATIONAL_DATA = {
  updatedAt: '2025',
  source: 'National Organ & Tissue Transplant Organisation (NOTTO), Ministry of Health & Family Welfare, Govt. of India - Annual Report 2025 / NOTTO Registry / PIB',
  cards: [
    { label: 'Total Transplants (2025)', value: '20,138', note: 'India crossed 20,000 transplants for the first time', year: 2025 },
    { label: 'Living-Donor Transplants (2025)', value: '16,612', note: 'Donated by living relatives/friends', year: 2025 },
    { label: 'Deceased-Donor Transplants (2025)', value: '3,526', note: 'From 1,200+ altruistic donor families', year: 2025 },
    { label: 'Donor Pledges (NOTTO)', value: '4,88,975', note: 'Aadhaar-verified pledges since Sep 2023 -> 5 lakh+', year: 2025 },
    { label: 'Deceased Donors (2024)', value: '1,128', note: '0.78 per million population', year: 2024 },
    { label: 'Deceased-Donor Rate', value: '< 1 pmp', note: 'India still far short of demand', year: 2025 },
  ],
  organWise: [
    { organ: 'Kidney', living: '11,558', deceased: '1,918' },
    { organ: 'Liver', living: '3,946', deceased: '952' },
    { organ: 'Heart', living: '-', deceased: '253' },
    { organ: 'Lung', living: '-', deceased: '228' },
  ],
  topStates: [
    { state: 'Delhi', transplants: '4,564' },
    { state: 'Tamil Nadu', transplants: '2,796', note: '#1 in deceased donors (266)' },
    { state: 'Maharashtra', transplants: '2,136' },
    { state: 'Telangana', transplants: '1,523' },
    { state: 'Kerala', transplants: '1,489' },
  ],
  milestone: 'Fourfold rise: ~5,000 transplants (2013) -> 20,138 (2025). India is world #1 in living-donor transplants.',
};

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, ...cache.data });
  }

  cache = { data: NATIONAL_DATA, at: Date.now() };
  return NextResponse.json({ success: true, ...cache.data });
}