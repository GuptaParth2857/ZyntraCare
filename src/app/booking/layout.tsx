import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book Doctor Appointment Online | ZyntraCare',
  description: 'Book doctor appointments online in India. Choose from top specialists across hospitals. Same-day appointments, instant confirmation, and digital prescriptions.',
  keywords: 'book doctor appointment, online doctor appointment, doctor appointment India, specialist appointment, medical booking',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
