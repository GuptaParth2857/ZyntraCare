// useDeviceCapability.ts - Device Detection Hook for Performance Optimization
// ZyntraCare BEAST Upgrade

import { useState, useEffect, useMemo } from 'react';

export interface DeviceCapability {
  quality: 'high' | 'medium' | 'low';
  canUse3D: boolean;
  canUseBloom: boolean;
  canUseBloomHeavy: boolean;
  particleCount: number;
  dpr: number;
  fpsTarget: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  prefersReducedMotion: boolean;
  isSlowConnection: boolean;
  memoryGB: number | null;
}

export function useDeviceCapability(): DeviceCapability {
  const [capabilities, setCapabilities] = useState<DeviceCapability>({
    quality: 'high',
    canUse3D: true,
    canUseBloom: true,
    canUseBloomHeavy: true,
    particleCount: 500,
    dpr: 2,
    fpsTarget: 60,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    prefersReducedMotion: false,
    isSlowConnection: false,
    memoryGB: null,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      // Check for reduced motion preference
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const prefersReducedMotion = mq.matches;

      // Check for slow connection
      const conn = (navigator as any).connection;
      const isSlowConnection = conn?.saveData || 
        conn?.effectiveType === 'slow-2g' || 
        conn?.effectiveType === '2g' ||
        conn?.effectiveType === 'slow-3g';

      // Get device memory (if available)
      const memory = (navigator as any).deviceMemory;
      const memoryGB = memory || null;

      // Detect if device is low-power (no GPU acceleration hints)
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const isLowPowerDevice = !gl;

      // Determine quality level
      let quality: 'high' | 'medium' | 'low';
      let particleCount: number;
      let dpr: number;
      let fpsTarget: number;
      let canUse3D: boolean;
      let canUseBloom: boolean;
      let canUseBloomHeavy: boolean;

      if (isMobile || isLowPowerDevice || isSlowConnection || prefersReducedMotion) {
        quality = 'low';
        particleCount = 100;
        dpr = 1;
        fpsTarget = 30;
        canUse3D = false;
        canUseBloom = false;
        canUseBloomHeavy = false;
      } else if (isTablet || (memoryGB && memoryGB <= 4)) {
        quality = 'medium';
        particleCount = 200;
        dpr = 1.5;
        fpsTarget = 30;
        canUse3D = true;
        canUseBloom = true;
        canUseBloomHeavy = false;
      } else {
        quality = 'high';
        particleCount = 500;
        dpr = Math.min(window.devicePixelRatio, 2);
        fpsTarget = 60;
        canUse3D = true;
        canUseBloom = true;
        canUseBloomHeavy = true;
      }

      setCapabilities({
        quality,
        canUse3D,
        canUseBloom,
        canUseBloomHeavy,
        particleCount,
        dpr,
        fpsTarget,
        isMobile,
        isTablet,
        isDesktop,
        prefersReducedMotion,
        isSlowConnection,
        memoryGB,
      });
    };

    detectCapabilities();

    // Listen for screen size changes
    window.addEventListener('resize', detectCapabilities, { passive: true });

    // Listen for reduced motion changes
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', detectCapabilities);

    return () => {
      window.removeEventListener('resize', detectCapabilities);
      mq.removeEventListener('change', detectCapabilities);
    };
  }, []);

  return capabilities;
}

// Hook for Intersection Observer based 3D loading (lazy mount)
export function useLazyLoad3D(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isVisible };
}

// FPS Cap utility for canvas-based animations
export function createFPSLimiter(targetFPS: number) {
  let lastTime = 0;
  const frameInterval = 1000 / targetFPS;

  return (callback: (deltaTime: number) => void) => {
    return (currentTime: number) => {
      const elapsed = currentTime - lastTime;
      
      if (elapsed >= frameInterval) {
        lastTime = currentTime - (elapsed % frameInterval);
        callback(elapsed);
      }
    };
  };
}