import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Symptom Checker & Health Guide | ZyntraCare',
  description: 'Check your symptoms, find possible conditions, and get health guidance. AI-powered symptom analysis.',
  keywords: 'symptom checker, health guide, symptom analysis, AI symptom checker, possible conditions, health guidance',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
