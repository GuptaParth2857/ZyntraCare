import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'First Aid Guide & Emergency Response | ZyntraCare',
  description: 'Learn essential first aid techniques - CPR, choking response, bleeding control, burn treatment. Life-saving guide for emergencies.',
  keywords: 'first aid, CPR, choking response, bleeding control, burn treatment, emergency response, life-saving techniques',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
