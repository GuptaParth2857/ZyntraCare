'use client';

import { useEffect, useRef } from 'react';

interface AdsterraNativeProps {
  slotId: string;
}

export default function AdsterraNative({ slotId }: AdsterraNativeProps) {
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
        'height' : 250,
        'width' : 300,
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
  }, [slotId]);

  return (
    <div
      ref={containerRef}
      className="my-4"
      style={{ minHeight: 250, maxWidth: '100%' }}
    />
  );
}
