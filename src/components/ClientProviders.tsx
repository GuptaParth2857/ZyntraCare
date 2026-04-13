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

// Normal imports for components that use browser APIs
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import EmergencyBanner from '@/components/EmergencyBanner';
import EmergencyScrollMonitor from '@/components/EmergencyScrollMonitor';
import CanvasBackground from '@/components/CanvasBackground';
import ActiveTheoryCursor from '@/components/ActiveTheoryCursor';
import FeedbackModal from '@/components/FeedbackModal';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import EmergencyCallWidget from '@/components/EmergencyCallWidget';
import MedicalIDWidget from '@/components/MedicalIDWidget';
import MedicineReminder from '@/components/MedicineReminder';
import SymptomChecker from '@/components/SymptomChecker';
import CookieConsent from '@/components/CookieConsent';
import Analytics from '@/components/Analytics';
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
