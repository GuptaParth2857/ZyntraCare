'use client';

import { useEffect, useRef } from 'react';

interface AdsterraBannerProps {
  slotId: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function AdsterraBanner({
  slotId,
  width = 728,
  height = 90,
  className = '',
}: AdsterraBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const atScript = document.createElement('script');
    atScript.type = 'text/javascript';
    atScript.innerHTML = `
      atOptions = {
        'key' : '${slotId}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `https://www.highperformanceformat.com/${slotId}/invoke.js`;
    invokeScript.async = true;

    container.innerHTML = '';
    container.appendChild(atScript);
    container.appendChild(invokeScript);

    return () => {
      container.innerHTML = '';
    };
  }, [slotId, width, height]);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
      style={{ minHeight: height, maxWidth: '100%' }}
    />
  );
}
