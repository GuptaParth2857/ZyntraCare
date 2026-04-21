// next.config.js — Production-ready, Vercel-compatible, Lighthouse-optimised
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  output: 'standalone',

  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  typescript: { ignoreBuildErrors: false },

  experimental: {
    optimizeCss: false,
    // Optimize package imports — avoids importing entire libraries
    optimizePackageImports: [
      'framer-motion',
      'react-icons',
      'recharts',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      'lucide-react',
    ],
  },

  webpack: (config, { isServer, dev }) => {
    // Client-side polyfill fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      'react-is': require.resolve('react-is'),
    };

    // Production-only bundle optimizations
    if (!dev && !isServer) {
      // Better chunk splitting strategy
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            // Separate large 3D libraries into their own chunk (lazy-loaded anyway)
            three: {
              test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
              name: 'vendor-three',
              chunks: 'async', // Only async — they're already dynamically imported
              priority: 40,
            },
            // Separate chart library (heavy, lazy loaded)
            charts: {
              test: /[\\/]node_modules[\\/](recharts|d3[-/])[\\/]/,
              name: 'vendor-charts',
              chunks: 'async',
              priority: 35,
            },
            // Separate map library
            maps: {
              test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
              name: 'vendor-maps',
              chunks: 'async',
              priority: 35,
            },
            // Framer Motion — keep but in own chunk
            framerMotion: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'vendor-framer',
              chunks: 'all',
              priority: 30,
            },
            // General vendor chunk (remaining node_modules)
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },

  turbopack: {
    resolveAlias: {
      'react-is': 'react-is',
    },
    root: __dirname,
  },

  // Security + performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(self)' },
        ],
      },
      {
        source: '/(.*)\\.(js|css|woff|woff2|ttf|eot|svg|ico|jpg|jpeg|png|webp|avif|gif|mp4|webm)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
