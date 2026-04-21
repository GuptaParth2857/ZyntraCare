// Global type declarations — no Three.js/R3F dependency needed since all 3D is Canvas 2D

declare global {
  interface Window {
    __NEXT_DATA__?: unknown;
  }

  // Navigator connection API (non-standard, supported in Chrome)
  interface Navigator {
    connection?: {
      saveData: boolean;
      effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    };
  }
}

export {};