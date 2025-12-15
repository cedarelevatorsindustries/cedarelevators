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
    '@next/swc-linux-x64-gnu',
    '@next/swc-linux-x64-musl',
    'lightningcss',
    'lightningcss-linux-x64-gnu',
    'lightningcss-linux-x64-musl',
    '@tailwindcss/oxide',
    '@tailwindcss/oxide-linux-x64-gnu',
    '@tailwindcss/oxide-linux-x64-musl',
    'sharp',
  ],
  // Exclude unnecessary files from the trace
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@next/swc-*',
      'node_modules/lightningcss-*',
      'node_modules/@tailwindcss/oxide-*',
      'node_modules/@unrs/*',
    ],
  },
};

export default nextConfig;
