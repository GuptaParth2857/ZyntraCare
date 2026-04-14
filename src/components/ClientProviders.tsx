'use client';

/**
 * ClientProviders — wraps all client-side context providers.
 * This lets layout.tsx remain a Server Component (for proper Next.js metadata/SEO).
 *
 * PERF OPTIMIZATIONS:
 *  - Critical widgets (Navbar, Footer) load immediately
 *  - Secondary widgets (Chatbot, EmergencyScroll, Cursor, Feedback) defer 1.5s
 *  - Non-critical widgets (MedicalID, MedicineReminder, SymptomChecker) defer 3s
 *  → Avoids all 12 dynamic components competing for main thread on first paint
 */
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';
import { useActiveUserHeartbeat } from '@/hooks/useActiveUserHeartbeat';
import ClientOnly from './ClientOnly';
import SplashScreen from './SplashScreen';
import { useState, useEffect } from 'react';

import { NotificationProvider } from '@/components/Notifications';

// ── TIER 1: Load immediately (visible/critical on first paint)
const Navbar           = dynamic(() => import('@/components/Navbar'),           { ssr: false });
const Footer           = dynamic(() => import('@/components/Footer'),           { ssr: false });
const EmergencyBanner  = dynamic(() => import('@/components/EmergencyBanner'),  { ssr: false });
const CanvasBackground = dynamic(() => import('@/components/CanvasBackground'), { ssr: false });
const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), { ssr: false });
const Analytics        = dynamic(() => import('@/components/Analytics'),        { ssr: false });
const CookieConsent    = dynamic(() => import('@/components/CookieConsent'),    { ssr: false });

// ── TIER 2: Defer 1.5s (interactive but not immediately visible)
const Chatbot               = dynamic(() => import('@/components/Chatbot'),               { ssr: false });
const EmergencyScrollMonitor= dynamic(() => import('@/components/EmergencyScrollMonitor'),{ ssr: false });
const FeedbackModal         = dynamic(() => import('@/components/FeedbackModal'),         { ssr: false });
const EmergencyCallWidget   = dynamic(() => import('@/components/EmergencyCallWidget'),   { ssr: false });
const ActiveTheoryCursor    = dynamic(() => import('@/components/ActiveTheoryCursor'),    { ssr: false });

// ── TIER 3: Defer 3s (floating widgets — user won't need immediately)
const MedicalIDWidget   = dynamic(() => import('@/components/MedicalIDWidget'),   { ssr: false });
const MedicineReminder  = dynamic(() => import('@/components/MedicineReminder'),  { ssr: false });
const SymptomChecker    = dynamic(() => import('@/components/SymptomChecker'),    { ssr: false });

/** Staged loading hook — returns which tier is ready */
function useStagedLoad() {
  const [tier, setTier] = useState(0); // 0 = critical only

  useEffect(() => {
    // Tier 2: after page is interactive
    const t1 = setTimeout(() => setTier(1), 1500);
    // Tier 3: after user has had time to scroll/interact
    const t2 = setTimeout(() => setTier(2), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return tier;
}

/** Inner component — needs session context for the heartbeat hook */
function AppShell({ children }: { children: React.ReactNode }) {
  useActiveUserHeartbeat();
  const loadTier = useStagedLoad();

  return (
    <>
      <SplashScreen />
      <ServiceWorkerRegistration />

      {/* Canvas runs on RAF — defer past first paint for better LCP */}
      <ClientOnly>
        <CanvasBackground />
      </ClientOnly>

      {/* Tier 1: Always-visible chrome */}
      <EmergencyBanner />
      <Navbar />
      <main id="main-content" className="flex-1 relative z-10" role="main">
        {children}
      </main>
      <Footer />
      <Analytics />
      <CookieConsent />

      {/* Tier 2: Interactive tools — load after 1.5s */}
      {loadTier >= 1 && (
        <ClientOnly>
          <Chatbot />
          <EmergencyScrollMonitor />
          <ActiveTheoryCursor />
          <FeedbackModal />
          <EmergencyCallWidget />
        </ClientOnly>
      )}

      {/* Tier 3: Floating widgets — load after 3s */}
      {loadTier >= 2 && (
        <>
          <MedicalIDWidget />
          <MedicineReminder />
          <SymptomChecker />
        </>
      )}
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
