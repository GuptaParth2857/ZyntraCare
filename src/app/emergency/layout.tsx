import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Services | ZyntraCare',
  description: 'Emergency medical services in India. Find emergency rooms, call ambulance, get real-time hospital bed availability and emergency care near you.',
  keywords: 'emergency services, emergency room, urgent care, emergency hospital, ambulance, emergency number India, 108, 102',
};

export default function EmergencyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
