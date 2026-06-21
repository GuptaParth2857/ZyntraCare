import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hospitals in India | ZyntraCare',
  description: 'Find best hospitals near you with real-time bed availability, doctor booking, and emergency services across India.',
  keywords: 'hospitals in India, best hospitals near me, hospital bed availability, emergency services, hospital directory',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
