import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diagnostic Labs Near You | ZyntraCare',
  description: 'Find diagnostic labs, book lab tests online, home collection available. Compare prices and get reports digitally.',
  keywords: 'diagnostic labs, book lab tests online, home sample collection, pathology labs, compare lab test prices',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
