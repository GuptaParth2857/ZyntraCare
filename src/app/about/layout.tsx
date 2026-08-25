import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | ZyntraCare',
  description:
    'ZyntraCare is India\'s leading healthcare platform connecting millions of patients with hospitals, doctors, labs, pharmacies, and emergency services across the country.',
  keywords:
    'about ZyntraCare, healthcare platform India, our mission, health services, company story, ZyntraCare team',
  openGraph: {
    title: 'About ZyntraCare — India\'s Healthcare Platform',
    description:
      'Our mission, story, and the team behind India\'s most comprehensive healthcare platform.',
    type: 'website',
    url: 'https://zyntracare.com/about',
  },
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
