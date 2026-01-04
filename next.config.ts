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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Externalize large native packages to reduce serverless function size
  serverExternalPackages: [
    'sharp',
  ],
  // Exclude unnecessary files from serverless function traces
  // This targets all API routes and pages to exclude large native binaries
  // outputFileTracingExcludes: {
  //   '/**': [
  //     'node_modules/@next/swc-linux-x64-gnu/**',
  //     'node_modules/@next/swc-linux-x64-musl/**',
  //     'node_modules/lightningcss-linux-x64-gnu/**',
  //     'node_modules/lightningcss-linux-x64-musl/**',
  //     'node_modules/@tailwindcss/oxide-linux-x64-gnu/**',
  //     'node_modules/@tailwindcss/oxide-linux-x64-musl/**',
  //     'node_modules/@unrs/**',
  //   ],
  // },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Turbopack configuration
  turbopack: {},
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
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

export default withBundleAnalyzer(nextConfig);


