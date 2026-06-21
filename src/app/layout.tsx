import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Metadata, Viewport } from 'next';

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
  const isHackathon = process.env.NEXT_PUBLIC_HACKATHON_MODE === 'true';
  const adNetwork = process.env.NEXT_PUBLIC_AD_NETWORK || 'adsense';

  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning={true}>
      <head>
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="googlee966699af55c42fa" />

        {/* Critical resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />

        {/* Premium fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin="anonymous"
        />

        {/* Favicon */}
        <link rel="icon" href="/images/publiczyntracare-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/publiczyntracare-logo.png" />

        {/* iOS Smart App Banner */}
        <meta name="apple-itunes-app" content="app-id=123456789, affiliate-data=partner=zyntracare" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="color-scheme" content="dark light" />

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5241033119281791"
          crossOrigin="anonymous"
        />

        {/* Adsterra Popunder (#4) — 1 per page visit */}
        {!isHackathon && adNetwork === 'adsterra' && (
          <script src="https://pl29830215.effectivecpmnetwork.com/6b/3c/a8/6b3ca83ac9d45dd570e4569136f825eb.js" />
        )}

        {/* Schema.org Healthcare Organization + LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["MedicalOrganization", "LocalBusiness"],
              name: "ZyntraCare",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://zyntracare.com",
              logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://zyntracare.com"}/images/publiczyntracare-logo.png`,
              description:
                "India's leading healthcare platform connecting patients with hospitals, specialists, labs, pharmacies, and emergency services.",
              areaServed: { "@type": "Country", name: "India" },
              availableLanguage: ["English", "Hindi"],
              medicalSpecialty: [
                "Cardiology",
                "Neurology",
                "Orthopedics",
                "Pediatrics",
                "Gynecology",
                "Dermatology",
                "Ophthalmology",
                "Psychiatry",
              ],
              makesOffer: [
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Doctor Appointment Booking" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hospital Bed Availability" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Lab Test Booking" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Online Doctor Consultation" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Emergency Services" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pharmacy Services" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ambulance Services" } },
              ],
              sameAs: [
                "https://zyntracare.com",
                "https://twitter.com/zyntracare",
                "https://facebook.com/zyntracare",
                "https://instagram.com/zyntracare",
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col font-inter antialiased bg-slate-950">
        <a href="#main-content" className="skip-to-content focus:top-4">
          Skip to main content
        </a>

        <AnimatedBackground />

        <ClientProviders>
          <ServiceWorkerRegistration />
          {children}
        </ClientProviders>

        {/* Adsterra Social Bar (#1) — before closing body */}
        {!isHackathon && (
          <script src="https://pl29830212.effectivecpmnetwork.com/99/54/2a/99542a03d87e169a60f1448534ab29e9.js" />
        )}
      </body>
    </html>
  );
}
