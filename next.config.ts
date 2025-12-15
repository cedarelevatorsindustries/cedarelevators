import type { NextConfig } from "next";

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
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Externalize large native packages to reduce serverless function size
  serverExternalPackages: [
    'sharp',
  ],
  // Exclude unnecessary files from serverless function traces
  // This targets all API routes and pages to exclude large native binaries
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
};

export default nextConfig;


