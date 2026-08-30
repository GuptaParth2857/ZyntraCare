// prisma/seed-doctors.ts
// Seeds REAL India doctor profiles from Lybrate (India's public doctor
// directory) into the Doctor table. Lybrate serves plain SSR HTML with no
// CAPTCHA/Cloudflare, so no API key and no paid limit is required - we just
// fetch the city+specialty listing pages and parse each doctor card
// (name, specialty, experience, education).
//
//   npm run db:doctors
//
// Notes:
//   * Idempotent - a doctor is keyed by a deterministic email so re-runs don't
//     duplicate.
//   * Polite throttling (single worker + delay) to avoid hammering Lybrate.
//   * Only fetches the curated (city, specialty) set below - a handful of pages.
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./dev.db' }),
});

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const REQUEST_DELAY_MS = 800;

// Curated (city-slug, specialty-slug, display-specialty) page set.
// These map to Lybrate's own city + specialty listing URLs.
const COMBO: Array<{ citySlug: string; spSlug: string; specialty: string; display: string; city: string }> = [
  { citySlug: 'delhi', spSlug: 'cardiologist', specialty: 'Cardiology', display: 'Cardiologist', city: 'Delhi' },
  { citySlug: 'mumbai', spSlug: 'neurologist', specialty: 'Neurology', display: 'Neurologist', city: 'Mumbai' },
  { citySlug: 'bangalore', spSlug: 'orthopedist', specialty: 'Orthopedics', display: 'Orthopedic Surgeon', city: 'Bangalore' },
  { citySlug: 'chennai', spSlug: 'gynaecologist', specialty: 'Gynecology', display: 'Gynecologist', city: 'Chennai' },
  { citySlug: 'kolkata', spSlug: 'dermatologist', specialty: 'Dermatology', display: 'Dermatologist', city: 'Kolkata' },
  { citySlug: 'hyderabad', spSlug: 'pediatrician', specialty: 'Pediatrics', display: 'Pediatrician', city: 'Hyderabad' },
  { citySlug: 'pune', spSlug: 'urologist', specialty: 'Urology', display: 'Urologist', city: 'Pune' },
  { citySlug: 'gurgaon', spSlug: 'gastroenterologist', specialty: 'Gastroenterology', display: 'Gastroenterologist', city: 'Gurgaon' },
  { citySlug: 'ahmedabad', spSlug: 'eye-specialist', specialty: 'Ophthalmology', display: 'Ophthalmologist', city: 'Ahmedabad' },
  { citySlug: 'jaipur', spSlug: 'ent-specialist', specialty: 'ENT', display: 'ENT Specialist', city: 'Jaipur' },
  { citySlug: 'lucknow', spSlug: 'psychiatrist', specialty: 'Psychiatry', display: 'Psychiatrist', city: 'Lucknow' },
  { citySlug: 'kochi', spSlug: 'oncologist', specialty: 'Oncology', display: 'Oncologist', city: 'Kochi' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Parse all doctor cards out of a listing page: name, specialty, experience, degree.
function parseCards(html: string): Array<{ name: string; specialty: string; experience: number | null; education: string }> {
  const cards: Array<{ name: string; specialty: string; experience: number | null; education: string }> = [];
  // Each doctor is an anchor to a doctor profile page: <a href=".../doctor/dr-x">Dr. X</a>
  const nameRe = /<a href="https:\/\/www\.lybrate\.com\/[a-z-]+\/doctor\/[^"]+"[^>]*>\s*Dr\.\s*([A-Za-z][^<]*?)\s*<\/a>/g;
  const specRe = /doctorCard_specialityDisplaySrp__[^"]*"[^>]*>([^<]+)</;
  const expRe = /doctorCard_experienceSrp__[^"]*"[^>]*>\s*([\d.]+)\s*Years?[\s\S]*?Exp\.?/i;
  const degRe = /doctorCard_srpDegree__[^"]*"[^>]*>([^<]+)</;

  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(html)) !== null) {
    const name = m[1].trim().replace(/\s+/g, ' ');
    const windowStr = html.slice(m.index, m.index + 1200);
    const spec = windowStr.match(specRe);
    const exp = windowStr.match(expRe);
    const deg = windowStr.match(degRe);
    cards.push({
      name,
      specialty: spec ? spec[1].trim() : '',
      experience: exp ? Math.round(parseFloat(exp[1])) : null,
      education: deg ? deg[1].trim() : '',
    });
  }
  return cards;
}

async function main() {
  console.log('🩺 Seeding real doctors from Lybrate...');
  const started = Date.now();
  const hashedPassword = await bcrypt.hash('doctor123', 12);
  let created = 0;
  let linked = 0;
  const seenEmails = new Set<string>();

  // Map to link doctors to the verified wibest hospitals where the names line up.
  const hospitals = await prisma.hospital.findMany({ select: { id: true, name: true, city: true } });
  const hospitalByCity = new Map<string, any[]>();
  for (const h of hospitals) {
    if (!hospitalByCity.has(h.city)) hospitalByCity.set(h.city, []);
    hospitalByCity.get(h.city)!.push(h);
  }

  for (const combo of COMBO) {
    const url = `https://www.lybrate.com/${combo.citySlug}/${combo.spSlug}`;
    try {
      const resp = await fetch(url, { headers: { 'user-agent': USER_AGENT, accept: 'text/html' } });
      if (!resp.ok) { console.log(`  ⚠️ ${combo.city}/${combo.display}: HTTP ${resp.status}`); continue; }
      const html = await resp.text();
      const cards = parseCards(html);
      console.log(`  ✅ ${combo.city} ${combo.display}: ${cards.length} doctors`);

      for (const card of cards) {
        const cleanName = card.name.replace(/^(Dr\.?)\s+/i, '').replace(/^[^A-Za-z]+/, '').trim();
        if (!cleanName) continue;
        const firstName = cleanName.split(' ')[0] || '';
        const lastName = cleanName.split(' ').slice(1).join(' ') || '';

        const email = `dr.${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}.${combo.citySlug}@lybrate.doctor`;
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) continue;

        const education = card.education || 'MBBS';
        const experience = card.experience && card.experience > 0 ? card.experience : 5;

        const user = await prisma.user.create({
          data: { email, name: `Dr. ${cleanName}`, passwordHash: hashedPassword, role: 'doctor' },
        });
        const doctor = await prisma.doctor.create({
          data: {
            userId: user.id,
            specialty: combo.specialty,
            license: `LYB-${combo.citySlug.toUpperCase()}-${created + 1000}`,
            experience,
            bio: `${combo.display} in ${combo.city}.`,
            education,
            languages: 'English, Hindi',
            consultingFee: 300 + (created % 15) * 75,
            isAvailable: true,
          },
        }).catch(() => null);
        if (!doctor) { continue; }
        created++;

        if (lastName && firstName) {
          const candidates = hospitalByCity.get(combo.city) || [];
          const matched = candidates.find((h: any) => {
            const hn = h.name.toLowerCase();
            return hn.includes(firstName.toLowerCase()) ||
              (lastName.length > 3 && hn.includes(lastName.toLowerCase()));
          });
          if (matched) {
            await prisma.doctorHospital.create({
              data: { doctorId: doctor.id, hospitalId: matched.id },
            }).catch(() => {});
            linked++;
          }
        }

        await sleep(REQUEST_DELAY_MS);
      }
    } catch (e: any) {
      console.log(`  ❌ ${combo.city}/${combo.display}: ${e.message}`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  console.log('-----------------------------');
  console.log(`Created ${created} real doctors from Lybrate`);
  console.log(`Linked ${linked} to matching hospitals`);
  console.log(`Took ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log('-----------------------------');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
