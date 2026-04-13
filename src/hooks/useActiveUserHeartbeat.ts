// src/hooks/useActiveUserHeartbeat.ts
'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

/**
 * useActiveUserHeartbeat
 *
 * Sends a heartbeat POST to /api/admin/active-users every 60s so the
 * admin dashboard can display who is currently online.
 * Sends a DELETE on component unmount (tab close).
 */
export function useActiveUserHeartbeat() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');

  // Generate a stable session ID (per browser tab)
  useEffect(() => {
    if (!sessionIdRef.current) {
      sessionIdRef.current =
        typeof window !== 'undefined'
          ? (sessionStorage.getItem('hh_sid') ??
             (() => {
               const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
               sessionStorage.setItem('hh_sid', id);
               return id;
             })())
          : `ssr_${Math.random()}`;
    }
  }, []);

  useEffect(() => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    const payload = {
      sessionId: sid,
      name:  session?.user?.name  || 'Anonymous',
      email: session?.user?.email || '',
      page:  pathname,
    };

    const beat = () =>
      fetch('/api/admin/active-users', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }).catch(() => {/* silent */});

    // Immediate first beat + then every 60s
    beat();
    const timer = setInterval(beat, 60_000);

    // Clean up on tab close / component unmount
    const onUnload = () => {
      navigator.sendBeacon(
        '/api/admin/active-users',
        JSON.stringify({ ...payload, _method: 'DELETE' })
      );
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [session, pathname]);
}
