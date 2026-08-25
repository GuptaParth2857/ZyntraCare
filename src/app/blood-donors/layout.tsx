import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blood Donors Directory | ZyntraCare',
  description: 'Find blood donors near you instantly. Register as blood donor, request blood in emergency. Save lives with blood donation.',
  keywords: 'blood donors, find blood donor, blood donation, register blood donor, emergency blood request, blood bank',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
