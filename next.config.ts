import type { NextConfig } from "next";

// Bundle Analyzer (enable with ANALYZE=true)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hbkdbrxzqaraarivudej.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 year cache for images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  // Externalize large native packages to reduce serverless function size
  serverExternalPackages: [
    'sharp',
  ],
  // Exclude unnecessary files from serverless function traces to reduce cold start time
  outputFileTracingExcludes: {
    '/**': [
      'node_modules/@next/swc-linux-x64-gnu/**',
      'node_modules/@next/swc-linux-x64-musl/**',
      'node_modules/lightningcss-linux-x64-gnu/**',
      'node_modules/lightningcss-linux-x64-musl/**',
      'node_modules/@tailwindcss/oxide-linux-x64-gnu/**',
      'node_modules/@tailwindcss/oxide-linux-x64-musl/**',
      'node_modules/@unrs/**',
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Turbopack configuration
  turbopack: {},
  // Experimental features
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
      'date-fns',
      '@tanstack/react-query',
    ],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // SEO-safe redirects for routing refactor
  async redirects() {
    return [
      {
        source: '/categories/:handle',
        destination: '/catalog/categories/:handle',
        permanent: true,
      },
    ]
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withBundleAnalyzer(withPWA(nextConfig));
