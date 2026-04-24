import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zyntracare.app',
  appName: 'ZyntraCare',
  webDir: 'out',
  server: {
    url: 'https://zyntracare.vercel.app',
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;