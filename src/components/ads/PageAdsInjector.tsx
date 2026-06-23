'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import AdSlot from './AdSlot';
import {
  PAGE_AD_PLACEMENTS,
  ADSTERRA_SLOTS,
  HACKATHON_MODE,
  AD_NETWORK,
  AD_PLACEMENTS,
} from '@/lib/ads/config';
import type { AdPlacement } from '@/lib/ads/config';

const GLOBAL_PLACEMENTS = new Set<string>([
  AD_PLACEMENTS.GLOBAL_HEADER,
  AD_PLACEMENTS.GLOBAL_FOOTER,
]);

function matchPathname(pathname: string): AdPlacement[] {
  if (PAGE_AD_PLACEMENTS[pathname]) {
    return PAGE_AD_PLACEMENTS[pathname];
  }

  const prefixes = Object.keys(PAGE_AD_PLACEMENTS).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (prefix.endsWith('*')) {
      const base = prefix.slice(0, -1);
      if (pathname.startsWith(base)) {
        return PAGE_AD_PLACEMENTS[prefix];
      }
    }
  }

  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix + '/') || pathname === prefix) {
      if (prefix !== '/' && prefix.includes('/')) {
        const placements = PAGE_AD_PLACEMENTS[prefix];
        if (placements) return placements;
      }
    }
  }

  const parent = '/' + pathname.split('/')[1];
  if (parent !== '/' && PAGE_AD_PLACEMENTS[parent]) {
    return PAGE_AD_PLACEMENTS[parent];
  }

  return [];
}

export default function PageAdsInjector() {
  const pathname = usePathname();

  const visiblePlacements = useMemo(() => {
    if (HACKATHON_MODE) return [];
    if (AD_NETWORK.NONE) return [];

    const raw = matchPathname(pathname);
    return raw.filter((id): id is AdPlacement => {
      if (GLOBAL_PLACEMENTS.has(id)) return false;
      const config = ADSTERRA_SLOTS[id as AdPlacement];
      return config?.enabled !== false;
    });
  }, [pathname]);

  if (visiblePlacements.length === 0) return null;

  return (
    <div className="space-y-6 py-4">
      {visiblePlacements.map((placement: AdPlacement) => {
        const config = ADSTERRA_SLOTS[placement];
        return (
          <AdSlot
            key={placement}
            placement={placement}
            size={config?.defaultSize}
            className="flex justify-center"
          />
        );
      })}
    </div>
  );
}
