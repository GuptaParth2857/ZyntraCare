import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Doctor Consultation | Telehealth | ZyntraCare',
  description: 'Consult doctors online via video, voice, or chat. Get prescriptions, lab test referrals, and medical advice from home.',
  keywords: 'online doctor consultation, telehealth, video consultation, online prescription, chat with doctor, telemedicine',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
