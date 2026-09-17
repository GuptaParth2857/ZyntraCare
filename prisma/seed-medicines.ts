import { prisma } from '../src/lib/prisma';

const MEDICINES: Record<string, { name: string; manufacturer: string; category: string }> = {
  COVAS: { name: 'Covaxin', manufacturer: 'Bharat Biotech', category: 'Vaccine' },
  COVSH: { name: 'Covishield', manufacturer: 'Serum Institute of India', category: 'Vaccine' },
  AMOX500: { name: 'Amoxicillin 500mg', manufacturer: 'Cipla', category: 'Antibiotic' },
  AZITH500: { name: 'Azithromycin 500mg', manufacturer: 'Sun Pharma', category: 'Antibiotic' },
  PARA500: { name: 'Paracetamol 500mg', manufacturer: 'GSK', category: 'Analgesic' },
  DOLO500: { name: 'Dolo 500mg', manufacturer: 'Micro Labs', category: 'Analgesic' },
  IBU400: { name: 'Ibuprofen 400mg', manufacturer: "Dr. Reddy's", category: 'Anti-inflammatory' },
  OMEP20: { name: 'Omeprazole 20mg', manufacturer: 'AstraZeneca', category: 'Antacid' },
  CROZI500: { name: 'Crocin 500mg', manufacturer: 'GSK', category: 'Analgesic' },
  METFOR500: { name: 'Metformin 500mg', manufacturer: 'USV', category: 'Antidiabetic' },
  ATOR10: { name: 'Atorvastatin 10mg', manufacturer: 'Pfizer', category: 'Cholesterol' },
  AMLOD5: { name: 'Amlodipine 5mg', manufacturer: 'Pfizer', category: 'BP Medication' },
  TELM40: { name: 'Telma 40mg', manufacturer: 'Glenmark', category: 'BP Medication' },
  PAN20: { name: 'Pantoprazole 20mg', manufacturer: 'Sun Pharma', category: 'Antacid' },
  MONTC10: { name: 'Montair LC 10mg', manufacturer: 'Cipla', category: 'Antiallergic' },
  LEVOC5: { name: 'Levocetirizine 5mg', manufacturer: "Dr. Reddy's", category: 'Antiallergic' },
  BECLOS: { name: 'Becosules', manufacturer: 'Pfizer', category: 'Multivitamin' },
  SUPRAD: { name: 'Supradyn', manufacturer: 'Bayer', category: 'Multivitamin' },
  ZINC20: { name: 'Zincovit', manufacturer: 'Apex', category: 'Supplement' },
  VITD3: { name: 'Vitamin D3 60K', manufacturer: 'Abbott', category: 'Supplement' },
  FESO200: { name: 'Ferrous Sulphate 200mg', manufacturer: 'Merck', category: 'Supplement' },
  NEUROB: { name: 'Neurobion', manufacturer: 'Procter & Gamble', category: 'Vitamin B Complex' },
  SHELCAL: { name: 'Shelcal 500', manufacturer: 'Elder Pharma', category: 'Calcium Supplement' },
  LIV52: { name: 'Liv 52', manufacturer: 'Himalaya', category: 'Liver Support' },
  PUMPC: { name: 'Pumpkin C', manufacturer: 'Himalaya', category: 'Supplement' },
};

async function main() {
  let count = 0;
  for (const [code, med] of Object.entries(MEDICINES)) {
    const existing = await prisma.medicineRecord.findUnique({ where: { code } });
    if (!existing) {
      await prisma.medicineRecord.create({
        data: { code, name: med.name, manufacturer: med.manufacturer, composition: '', category: med.category, verified: true },
      });
      count += 1;
    } else {
      await prisma.medicineRecord.update({
        where: { code },
        data: { name: med.name, manufacturer: med.manufacturer, category: med.category },
      });
    }
  }
  console.log(`Seeded ${count} new medicines, ${Object.keys(MEDICINES).length} total in registry.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });