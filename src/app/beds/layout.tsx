import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hospital Bed Availability | ZyntraCare',
  description: 'Check real-time hospital bed availability including ICU, general, and emergency beds across hospitals in India.',
  keywords: 'hospital bed availability, ICU beds, emergency beds, general ward beds, real-time bed status, hospital capacity',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
