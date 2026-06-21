'use client';

import { useEffect, useRef } from 'react';
import { ADSENSE_CONFIG } from '@/lib/ads/config';

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidth?: boolean;
  className?: string;
}

export default function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  fullWidth = true,
  className = '',
}: GoogleAdsenseProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled) return;
    if (initialized.current) return;

    try {
      const win = window as any;
      (win.adsbygoogle = win.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {
      // Ad blocker detected or not ready
    }
  }, []);

  if (!ADSENSE_CONFIG.enabled) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth}
      />
    </div>
  );
}
