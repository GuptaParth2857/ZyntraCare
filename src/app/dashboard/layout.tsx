import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ZyntraCare',
  description: 'Manage your medical records, book appointments, and view real-time hospital beds securely from your ZyntraCare Dashboard.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
