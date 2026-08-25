import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Online Pharmacy & Medicine Delivery | ZyntraCare',
  description: 'Order medicines online from verified pharmacies near you. Medicine delivery, health products, and prescription management.',
  keywords: 'online pharmacy, medicine delivery, order medicines online, verified pharmacies, prescription management, health products',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
