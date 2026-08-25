import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Specialists in India | ZyntraCare',
  description: 'Find medical specialists across all departments - cardiologists, neurologists, orthopedics, and more. Book appointments online.',
  keywords: 'medical specialists, cardiologists, neurologists, orthopedics, specialist doctors India, department specialists',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
