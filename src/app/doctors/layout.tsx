import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Doctors & Specialists | ZyntraCare',
  description: 'Search and book top doctors in India. Browse specialists, check availability, and book appointments instantly.',
  keywords: 'find doctors, book doctor appointment, specialists in India, top doctors, online doctor booking',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
