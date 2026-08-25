import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | ZyntraCare',
  description: 'Get in touch with ZyntraCare support. Customer service, feedback, partnership inquiries, and helpline information.',
  keywords: 'contact ZyntraCare, customer support, helpline, feedback, partnership inquiries, customer service',
};

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
