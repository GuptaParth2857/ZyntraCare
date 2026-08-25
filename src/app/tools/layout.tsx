import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Tools & Calculators | ZyntraCare',
  description: 'BMI calculator, water intake tracker, medicine reminder, blood donor finder, emergency QR card, and first aid guides.',
  keywords: 'health tools, BMI calculator, water intake calculator, medicine reminder, blood donor, emergency card, first aid',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
