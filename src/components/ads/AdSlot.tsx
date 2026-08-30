'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import {
  AD_NETWORK,
  ADSTERRA_SLOTS,
  AD_SIZES,
  ADSENSE_CONFIG,
  ADSTERRA_CONFIG,
} from '@/lib/ads/config';
import type { AdPlacement, AdSize } from '@/lib/ads/config';

const GoogleAdsense = dynamic(() => import('./GoogleAdsense'), { ssr: false });
const AdsterraBanner = dynamic(() => import('./AdsterraBanner'), { ssr: false });

interface AdSlotProps {
  placement: AdPlacement;
  size?: AdSize;
  className?: string;
  label?: string;
}

function AdLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="h-px flex-1 bg-white/5" />
      <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest select-none">
        {text}
      </span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

export default function AdSlot({
  placement,
  size,
  className = '',
  label,
}: AdSlotProps) {
  const pathname = usePathname();

  // No configured/serving ad network -> render nothing (avoids ugly empty
  // "Advertisement" gaps). Real ads only appear once AdSense/Adsterra is set up.
  const hasRealAdNetwork = ADSENSE_CONFIG.enabled || ADSTERRA_CONFIG.isProduction;
  if (!hasRealAdNetwork) {
    return null;
  }

  const config = ADSTERRA_SLOTS[placement];
  const adSize = size || config?.defaultSize || 'BANNER';
  const dimensions = AD_SIZES[adSize];

  const content = useMemo(() => {
    // Adsterra manual placements run alongside Google Auto Ads (head script)
    if (AD_NETWORK.ADSTERRA && config?.adsterraKey) {
      return (
        <AdsterraBanner
          slotId={config.adsterraKey}
          width={dimensions.width}
          height={dimensions.height}
          className={className}
        />
      );
    }

    if (AD_NETWORK.GOOGLE_ADSENSE) {
      return (
        <GoogleAdsense
          adSlot={placement}
          adFormat={adSize === 'LEADERBOARD' ? 'horizontal' : 'rectangle'}
          className={`mx-auto ${className}`}
        />
      );
    }

    return null;
  }, [placement, adSize, dimensions, config, className]);

  const showLabel = label !== undefined ? label : 'Advertisement';

  return (
    <div
      className={`ad-slot ad-slot-${placement} ${className}`}
      data-ad-placement={placement}
      data-ad-size={adSize}
      role="complementary"
      aria-label={showLabel}
    >
      {content && <AdLabel text={showLabel} />}
      {content || (
        <div
          className="flex items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl"
          style={{
            width: Math.min(dimensions.width, 728),
            minHeight: dimensions.height,
          }}
        >
          <span className="text-[11px] font-medium text-white/15 uppercase tracking-widest select-none">
            {showLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function AdInFeed({
  index,
  placement,
  frequency = 6,
  size = 'MEDIUM_RECTANGLE',
}: {
  index: number;
  placement: AdPlacement;
  frequency?: number;
  size?: AdSize;
}) {
  if (index <= 0) return null;
  if (index % frequency !== 0) return null;

  return (
    <div className="col-span-full flex justify-center my-4">
      <AdSlot placement={placement} size={size} label="Sponsored" />
    </div>
  );
}
