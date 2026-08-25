import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pet Care - Pet Clinics, Pet Shops Near You | ZyntraCare',
  description: 'Find pet clinics and pet shops near you. Track your pet health, vaccinations, and find nearby pet care services.',
  keywords: 'pet clinics, pet shops near me, pet care, pet vaccination, veterinary clinics, pet health tracking',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
