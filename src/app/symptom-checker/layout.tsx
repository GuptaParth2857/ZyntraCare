import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Symptom Checker | ZyntraCare',
  description: 'Check your symptoms with our AI-powered analysis. Get possible causes, precautions, and when to see a doctor.',
  keywords: 'symptom checker, AI diagnosis, health analysis, symptom analysis, medical symptoms, health checker',
};

export default function SymptomCheckerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
