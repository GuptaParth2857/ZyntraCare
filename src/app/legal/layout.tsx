import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Legal | ZyntraCare',
    template: '%s | ZyntraCare',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
