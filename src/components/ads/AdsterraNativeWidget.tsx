'use client';

import { useEffect, useRef } from 'react';

interface AdsterraNativeWidgetProps {
  invokeUrl: string;
  containerId: string;
  className?: string;
}

export default function AdsterraNativeWidget({
  invokeUrl,
  containerId,
  className = '',
}: AdsterraNativeWidgetProps) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = invokeUrl;
    document.body.appendChild(script);

    return () => {
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = '';
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [invokeUrl, containerId]);

  return (
    <div className={`flex justify-center ${className}`}>
      <div id={containerId} />
    </div>
  );
}
