import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { Metadata, Viewport } from 'next';

// Removed dynamic imports from Server Component

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0ea5e9',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://zyntracare.com'),
  title: {
    default: "ZyntraCare — India's #1 Healthcare Platform",
    template: "%s | ZyntraCare",
  },
  description:
    "Find the best hospitals, specialists, and healthcare services across India. Book appointments instantly, view real-time bed availability, and get AI-powered health guidance.",
  keywords: [
    "hospitals india",
    "book doctor appointment",
    "healthcare platform",
    "emergency services",
    "bed availability",
    "health camps",
    "specialist doctors india",
    "online doctor consultation",
  ],
  authors: [{ name: "ZyntraCare Team" }],
  creator: "ZyntraCare",
  publisher: "ZyntraCare",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "ZyntraCare — India's #1 Healthcare Platform",
    description: "Find hospitals, book specialists, real-time bed availability across India.",
    type: "website",
    locale: "en_IN",
    siteName: "ZyntraCare",
    url: "https://zyntracare.com",
    images: [{ url: "/images/publiczyntracare-logo.png", width: 512, height: 512, alt: "ZyntraCare Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZyntraCare — India's #1 Healthcare Platform",
    description: "Find hospitals, book specialists, real-time bed availability.",
    images: ["/images/publiczyntracare-logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
      <head>
        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />

        {/* Premium fonts — display=swap for performance */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Leaflet CSS — loaded after fonts */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin="anonymous"
        />

        {/* Favicon - ZyntraCare Logo */}
        <link
          rel="icon"
          href="/images/publiczyntracare-logo.png"
          type="image/png"
        />

{/* Apple touch icon */}
        <link
          rel="apple-touch-icon"
          href="/images/publiczyntracare-logo.png"
        />

        {/* iOS Smart App Banner - Shows "Download on App Store" prompt */}
        <meta name="apple-itunes-app" content="app-id=123456789, affiliate-data=partner=zyntracare" />
        
        {/* Android/Play Store - TWA support */}
        <link rel="manifest" href="/manifest.json" />

        {/* Color scheme */}
        <meta name="color-scheme" content="dark light" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-inter antialiased bg-slate-950">
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-to-content focus:top-4">
          Skip to main content
        </a>

        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}