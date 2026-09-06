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
import { AdProvider, AdSlot, AdsterraMobileBanner, AdsterraNativeWidget, PageAdsInjector } from '@/components/ads';
import { AD_PLACEMENTS, ADSTERRA_CONFIG } from '@/lib/ads/config';

// Suppress harmless Three.js warnings (deprecations, shader precision, etc.)
if (typeof console !== 'undefined') {
  const _warn = console.warn;
  console.warn = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('THREE.Clock: This module has been deprecated')) return;
    if (msg.includes('THREE.WebGLProgram: Program Info Log')) return;
    if (msg.includes('warning X4122')) return;
    _warn(...args);
  };
}

// AI Self-Healing System
const SelfHealingSystem = dynamic(() => import('@/components/SelfHealingSystem'), { ssr: false });
const GlobalErrorHandler = dynamic(() => import('@/components/GlobalErrorHandler'), { ssr: false });

// ── TIER 1: Load immediately (visible/critical on first paint)
const Navbar           = dynamic(() => import('@/components/Navbar'),           { ssr: false });
const Footer           = dynamic(() => import('@/components/Footer'),           { ssr: false });
const EmergencyBanner  = dynamic(() => import('@/components/EmergencyBanner'),  { ssr: false });
const EmergencyCallWidget = dynamic(() => import('@/components/EmergencyCallWidget'), { ssr: false });
const VoiceEmergencyAssistant = dynamic(() => import('@/components/VoiceEmergencyAssistant'), { ssr: false });
const CanvasBackground = dynamic(() => import('@/components/CanvasBackground'), { ssr: false });
const ServiceWorkerRegistration = dynamic(() => import('@/components/ServiceWorkerRegistration'), { ssr: false });
const Analytics        = dynamic(() => import('@/components/Analytics'),        { ssr: false });
const CookieConsent    = dynamic(() => import('@/components/CookieConsent'),    { ssr: false });

// ── TIER 2: Defer 1.5s (interactive but not immediately visible)
const Chatbot               = dynamic(() => import('@/components/Chatbot'),               { ssr: false });
const EmergencyScrollMonitor= dynamic(() => import('@/components/EmergencyScrollMonitor'),{ ssr: false });
const FeedbackModal         = dynamic(() => import('@/components/FeedbackModal'),         { ssr: false });
const ActiveTheoryCursor    = dynamic(() => import('@/components/ActiveTheoryCursor'),    { ssr: false });


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
  // Tracks signed-in visitors as "online" for the admin dashboard.
  // One stable session row per browser tab (upsert), not per beat.
  useActiveUserHeartbeat();
  const loadTier = useStagedLoad();

  // Suppress JSON fetch errors globally (not next-auth)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : args[0]?.toString() || '';
      if (msg.includes('Failed to execute') || msg.includes('Unexpected end of JSON')) {
        return;
      }
      originalError(...args);
    };
    return () => { console.error = originalError; };
  }, []);

  return (
    <>
      <SplashScreen />
      <ServiceWorkerRegistration />

      {/* Canvas runs on RAF — defer past first paint for better LCP */}
      <ClientOnly>
        <CanvasBackground />
      </ClientOnly>

      {/* Adsterra Mobile Banner (#10) — sticky bottom on mobile */}
      <AdsterraMobileBanner />

      {/* Tier 1: Always-visible chrome */}
      <EmergencyBanner />
      <Navbar />
      <AdSlot placement={AD_PLACEMENTS.GLOBAL_HEADER} size="LEADERBOARD" className="py-2" />
      <EmergencyCallWidget />
      <VoiceEmergencyAssistant />
      <main id="main-content" className="flex-1 relative z-10" role="main">
        {children}
        <PageAdsInjector />
      </main>
      <AdSlot placement={AD_PLACEMENTS.GLOBAL_FOOTER} size="LEADERBOARD" className="py-2" />
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
          <AdsterraNativeWidget
            invokeUrl={ADSTERRA_CONFIG.nativeWidgetInvoke}
            containerId={ADSTERRA_CONFIG.nativeWidgetContainer}
            className="my-4"
          />
        </ClientOnly>
      )}


    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <LanguageProvider>
        <NotificationProvider>
          <SelfHealingSystem>
            <GlobalErrorHandler>
              <AdProvider>
                <AppShell>{children}</AppShell>
              </AdProvider>
            </GlobalErrorHandler>
          </SelfHealingSystem>
        </NotificationProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
