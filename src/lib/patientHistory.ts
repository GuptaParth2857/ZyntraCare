import { prisma } from '@/lib/prisma';

export interface TriageHistoryInput {
  userId: string;
  title: string;
  category: 'emergency' | 'diagnosis' | 'vitals';
  summary: string;
  symptoms?: string[];
  priority?: string;
  urgencyLevel?: string;
  recommendedAction?: string;
  possibleConditions?: string[];
  redFlags?: string[];
  source?: string;
  hospital?: string;
  doctor?: string;
}

export async function saveTriageToHistory(input: TriageHistoryInput): Promise<boolean> {
  if (!input.userId) return false;
  try {
    await prisma.healthTimelineEvent.create({
      data: {
        userId: input.userId,
        title: input.title.slice(0, 200),
        category: input.category,
        date: new Date().toISOString().slice(0, 10),
        hospital: (input.hospital ?? '').slice(0, 200),
        doctor: (input.doctor ?? '').slice(0, 200),
        description: input.summary.slice(0, 2000),
        attachments: '[]',
        metadata: JSON.stringify({
          symptoms: input.symptoms ?? [],
          priority: input.priority ?? null,
          urgencyLevel: input.urgencyLevel ?? null,
          recommendedAction: input.recommendedAction ?? null,
          possibleConditions: input.possibleConditions ?? [],
          redFlags: input.redFlags ?? [],
          source: input.source ?? null,
        }),
      },
    });
    return true;
  } catch (error) {
    console.error('saveTriageToHistory error:', error);
    return false;
  }
}
