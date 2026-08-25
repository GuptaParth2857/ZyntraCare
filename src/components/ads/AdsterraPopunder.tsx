'use client';

import { useEffect } from 'react';

interface AdsterraPopunderProps {
  slotId: string;
  frequency?: number;
}

export default function AdsterraPopunder({
  slotId,
  frequency = 1,
}: AdsterraPopunderProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      var _0x9e3f = ["${slotId}"];
      var _0x4b2a = [${frequency}];
      (function() {
        var pu = document.createElement('script');
        pu.type = 'text/javascript';
        pu.async = true;
        pu.src = '//www.highperformanceformat.com/' + _0x9e3f[0] + '/invoke.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(pu);
      })();
    `;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [slotId, frequency]);

  return null;
}
