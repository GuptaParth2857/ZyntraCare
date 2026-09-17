import { prisma } from '@/lib/prisma';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface ChainSource {
  id: string;
  createdAt: Date;
  title: string;
  type: string;
  fileUrl: string;
  notes: string;
  date: string;
  hospital: string;
  doctor: string;
  hash?: string | null;
  previousHash?: string | null;
}

export function contentValue(
  r: Pick<ChainSource, 'id' | 'createdAt' | 'title' | 'type' | 'fileUrl' | 'notes' | 'date' | 'hospital' | 'doctor'>,
  previousHash: string
): string {
  return `${r.id}|${r.createdAt.getTime()}|${r.title}|${r.type}|${r.fileUrl}|${r.notes}|${r.date}|${r.hospital}|${r.doctor}|${previousHash}`;
}

export async function computeChainedHashes(records: ChainSource[]): Promise<
  { id: string; hash: string; previousHash: string; storedHash: string; storedPreviousHash: string }[]
> {
  let prev = GENESIS_HASH;
  const chain: { id: string; hash: string; previousHash: string; storedHash: string; storedPreviousHash: string }[] = [];
  for (const r of records) {
    const hash = await sha256(contentValue(r, prev));
    chain.push({
      id: r.id,
      hash,
      previousHash: prev,
      storedHash: r.hash || '',
      storedPreviousHash: r.previousHash || '',
    });
    prev = hash;
  }
  return chain;
}

export async function verifyChain(userId: string) {
  const records = await prisma.healthRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  const chain = await computeChainedHashes(records);
  const links = records.map((r, i) => ({ record: r, link: chain[i] }));
  const verified = links.map(({ record, link }) => ({
    record,
    verified: link.storedHash === link.hash && link.storedPreviousHash === link.previousHash,
  }));
  const chainValid = verified.every((v) => v.verified);

  return { records, links, verified, chainValid };
}

export async function backfillMissingHashes(userId: string) {
  const { links } = await verifyChain(userId);
  const missing = links.filter(({ record, link }) => (record.hash || '') === '' || (record.previousHash || '') === '');
  for (const { record, link } of missing) {
    await prisma.healthRecord.update({
      where: { id: record.id },
      data: { hash: link.hash, previousHash: link.previousHash },
    });
  }
  return missing.length;
}

export async function rechainAllHashes(userId: string) {
  const { links } = await verifyChain(userId);
  for (const { record, link } of links) {
    if ((record.hash || '') !== link.hash || (record.previousHash || '') !== link.previousHash) {
      await prisma.healthRecord.update({
        where: { id: record.id },
        data: { hash: link.hash, previousHash: link.previousHash },
      });
    }
  }
}