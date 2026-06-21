'use client';

import { useEffect } from 'react';
import { HACKATHON_MODE } from '@/lib/ads/config';

export default function AdsterraMobileBanner() {
  useEffect(() => {
    if (HACKATHON_MODE) return;

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;background:rgba(2,6,23,0.95);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.1);padding:4px 0;display:flex;justify-content:center;';

    const atScript = document.createElement('script');
    atScript.type = 'text/javascript';
    atScript.innerHTML = `
      atOptions = {
        'key' : '6c8951fea444054bd4f05dc5e19ce294',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/6c8951fea444054bd4f05dc5e19ce294/invoke.js';
    invokeScript.async = true;

    container.appendChild(atScript);
    container.appendChild(invokeScript);
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.textContent = `@media (max-width:767px){body{padding-bottom:60px!important}}`;
    document.head.appendChild(style);

    return () => {
      if (container.parentNode) container.parentNode.removeChild(container);
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  return null;
}
