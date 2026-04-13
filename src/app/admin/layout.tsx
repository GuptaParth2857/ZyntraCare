import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Command Center | ZyntraCare',
  description: 'Manage real-time hospital beds, AI predictions, and active connections.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
