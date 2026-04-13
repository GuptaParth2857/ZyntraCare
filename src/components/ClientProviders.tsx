'use client';

/**
 * ClientProviders — wraps all client-side context providers.
 * This lets layout.tsx remain a Server Component (for proper Next.js metadata/SEO).
 */
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';
import { useActiveUserHeartbeat } from '@/hooks/useActiveUserHeartbeat';
import ClientOnly from './ClientOnly';

const Navbar = dynamic(() => import('@/components/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });
const EmergencyBanner = dynamic(() => import('@/components/EmergencyBanner'), { ssr: false });
const EmergencyScrollMonitor = dynamic(() => import('@/components/EmergencyScrollMonitor'), { ssr: false });
const CanvasBackground = dynamic(() => import('@/components/CanvasBackground'), { ssr: false });
const ActiveTheoryCursor = dynamic(() => import('@/components/ActiveTheoryCursor'), { ssr: false });
const FeedbackModal = dynamic(() => import('@/components/FeedbackModal'), { ssr: false });
const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), { ssr: false });
const EmergencyCallWidget = dynamic(() => import('@/components/EmergencyCallWidget'), { ssr: false });
const MedicalIDWidget = dynamic(() => import('@/components/MedicalIDWidget'), { ssr: false });
const MedicineReminder = dynamic(() => import('@/components/MedicineReminder'), { ssr: false });
const SymptomChecker = dynamic(() => import('@/components/SymptomChecker'), { ssr: false });
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const Analytics = dynamic(() => import('@/components/Analytics'), { ssr: false });

import { NotificationProvider } from '@/components/Notifications';

/** Inner component — needs session context for the heartbeat hook */
function AppShell({ children }: { children: React.ReactNode }) {
  // Sends periodic heartbeats so admin can track who is online
  useActiveUserHeartbeat();

  return (
    <>
      <ServiceWorkerRegistration />
      <ClientOnly>
        <CanvasBackground />
      </ClientOnly>
      <EmergencyBanner />
      <Navbar />
      <main id="main-content" className="flex-1 relative z-10" role="main">
        {children}
      </main>
      <Footer />
      <ClientOnly>
        <Chatbot />
        <EmergencyScrollMonitor />
        <ActiveTheoryCursor />
        <FeedbackModal />
      </ClientOnly>
      
      {/* Floating Widgets - Positioned on LEFT side */}
      <EmergencyCallWidget />
      <MedicalIDWidget />
      <MedicineReminder />
      <SymptomChecker />
      
      {/* GDPR Cookie Consent */}
      <CookieConsent />
      
      {/* Analytics Tracking */}
      <Analytics />
    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <NotificationProvider>
          <AppShell>{children}</AppShell>
        </NotificationProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
