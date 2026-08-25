'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { HACKATHON_MODE, PAGE_AD_PLACEMENTS, ADSTERRA_TOP_10_SLOTS, ADSTERRA_SLOTS, AD_NETWORK } from '@/lib/ads/config';
import type { AdPlacement } from '@/lib/ads/config';

export function useAdVisibility() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isPremium = session?.user?.role === 'premium';

  if (HACKATHON_MODE) {
    return { showAds: false, placements: [] as AdPlacement[], isPremium };
  }

  if (AD_NETWORK.NONE) {
    return { showAds: false, placements: [] as AdPlacement[], isPremium };
  }

  const applicable = PAGE_AD_PLACEMENTS[pathname] || [
    ADSTERRA_TOP_10_SLOTS[0],
    ADSTERRA_TOP_10_SLOTS[1],
  ] as AdPlacement[];

  const filtered = applicable.filter((id) => {
    const config = ADSTERRA_SLOTS[id];
    if (!config?.enabled) return false;
    if (config.maxPerPage <= 0) return false;
    return true;
  });

  return { showAds: filtered.length > 0, placements: filtered, isPremium };
}
