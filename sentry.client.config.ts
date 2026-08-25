import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while it's setting up.
  debug: false,
  
  // replaysSessionSampleRate and replaysOnErrorSampleRate
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  
  // If you use sentry options
  integrations: [],
});
