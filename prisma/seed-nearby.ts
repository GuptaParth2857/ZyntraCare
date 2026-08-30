// prisma/seed-nearby.ts
// Bulk-imports real India healthcare POIs (from Overture Maps) into the
// NearbyPlace table. Reads the committed gzip artifact prisma/nearby-places.jsonl.gz
// so it runs anywhere with node only - no network, no Python required.
//
//   npm run db:seed:nearby
//
// Idempotent: if NearbyPlace already has rows it exits early.
import { readFileSync } from 'fs';
import { gunzipSync } from 'zlib';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
});

function loadRows(): any[] {
  const file = path.join(process.cwd(), 'prisma', 'nearby-places.jsonl.gz');
  const gz = readFileSync(file);
  const text = gunzipSync(gz).toString('utf-8');
  const lines = text.split('\n').filter((l: string) => l.trim().length > 0);
  return lines.map((l: string) => JSON.parse(l));
}

async function main() {
  const existing = await prisma.nearbyPlace.count();
  if (existing > 0) {
    console.log(`NearbyPlace already has ${existing} rows - skipping seed.`);
    return;
  }

  const rows = loadRows();
  console.log(`Loaded ${rows.length} places from artifact.`);

  const CHUNK = 400;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map((r) => ({
      name: String(r.name || '').slice(0, 500),
      type: String(r.type || 'clinic'),
      address: String(r.address || '').slice(0, 2000),
      city: String(r.city || '').slice(0, 200),
      state: String(r.state || '').slice(0, 200),
      pincode: String(r.pincode || '').slice(0, 20),
      phone: String(r.phone || '').slice(0, 50),
      lat: Number(r.lat),
      lng: Number(r.lng),
      categories: JSON.stringify([r.cat || r.type].filter(Boolean)),
      source: 'overture',
    }));
    await prisma.nearbyPlace.createMany({ data: chunk });
    inserted += chunk.length;
    if (i % 20000 === 0) console.log(`  ...${inserted}`);
  }

  console.log(`Inserted ${inserted} nearby places.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
