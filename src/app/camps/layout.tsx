import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Camps Near You | ZyntraCare',
  description: 'Find free and paid health camps in your area. Blood donation camps, vaccination drives, and health checkup camps.',
  keywords: 'health camps, blood donation camps, vaccination drives, health checkup camps, free health camps, medical camps',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
