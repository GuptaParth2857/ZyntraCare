'use client';

import { createContext, useContext, useMemo } from 'react';
import { HACKATHON_MODE, AD_NETWORK, ADSTERRA_TOP_10_SLOTS } from '@/lib/ads/config';
import type { AdPlacement } from '@/lib/ads/config';

interface AdContextValue {
  enabled: boolean;
  network: 'adsense' | 'adsterra' | 'none';
  isHackathon: boolean;
  globalPlacements: AdPlacement[];
}

const AdContext = createContext<AdContextValue>({
  enabled: false,
  network: 'none',
  isHackathon: false,
  globalPlacements: [],
});

export function AdProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AdContextValue>(() => ({
    enabled: !HACKATHON_MODE && !AD_NETWORK.NONE,
    network: AD_NETWORK.GOOGLE_ADSENSE ? 'adsense' : AD_NETWORK.ADSTERRA ? 'adsterra' : 'none',
    isHackathon: HACKATHON_MODE,
    globalPlacements: ADSTERRA_TOP_10_SLOTS.slice(0, 2),
  }), []);

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
}

export function useAdContext() {
  return useContext(AdContext);
}
