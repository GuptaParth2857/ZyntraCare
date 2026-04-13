'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  
  const { gtag } = window;
  if (typeof gtag === 'function') {
    gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
}

export function trackPageView(url: string, title?: string) {
  if (typeof window === 'undefined') return;
  
  const { gtag } = window;
  if (typeof gtag === 'function') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: url,
      page_title: title,
    });
  }
}

export function trackConversion(label: string, value?: number) {
  trackEvent({
    action: 'conversion',
    category: 'conversion',
    label,
    value,
  });
}

export function trackBooking(doctorName: string, hospitalName: string) {
  trackEvent({
    action: 'booking',
    category: 'engagement',
    label: `${doctorName} - ${hospitalName}`,
  });
}

export function trackEmergencyCall() {
  trackEvent({
    action: 'emergency_call',
    category: 'emergency',
    label: 'emergency_widget_click',
  });
}

export function trackSubscription(plan: string, price: number) {
  trackEvent({
    action: 'subscription',
    category: 'payment',
    label: plan,
    value: price,
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: query,
    value: resultsCount,
  });
}

function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url, document.title);
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <PageTracker />
    </Suspense>
  );
}