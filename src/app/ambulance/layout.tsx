import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ambulance Services | Book Emergency Ambulance | ZyntraCare',
  description: 'Book ambulance services in India. 24/7 emergency ambulance, ICU ambulance, patient transport. Track ambulance in real-time.',
  keywords: 'ambulance services, book ambulance, emergency ambulance, ICU ambulance, patient transport, ambulance tracking',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
