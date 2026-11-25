import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import "@/styles/globals.css"
import { JsonLd } from "@/components/seo/json-ld"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data"
import { Toaster } from "@/components/ui/sonner"
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt"
import { QueryProvider } from "@/components/providers/query-provider"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cedarelevators.in'

export const metadata: Metadata = {
  title: {
    default: "Cedar Elevators - Elevator Components & Parts",
    template: "%s | Cedar Elevators"
  },
  description: "Shop quality elevator components and spare parts online. Find safety gear, door operators, controllers, and more for your elevator maintenance and installation needs.",
  keywords: "elevator components, lift parts, elevator safety gear, door operators, controllers, elevator maintenance, spare parts, elevator installation",
  authors: [{ name: "Cedar Elevators" }],
  creator: "Cedar Elevators",
  publisher: "Cedar Elevators",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Cedar Elevators',
    title: 'Cedar Elevators - Elevator Components & Parts',
    description: 'Quality elevator components and parts for maintenance, repair, and installation',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Cedar Elevators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cedar Elevators - Elevator Components & Parts',
    description: 'Quality elevator components and parts for maintenance, repair, and installation',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@cedarelevators',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  category: 'E-commerce',
  // PWA Configuration
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cedar Elevators',
  },
  applicationName: 'Cedar Elevators',
  icons: {
    icon: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  // Mobile-specific format detection
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  // Enhanced mobile web app support
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

// Viewport configuration for mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F97316' },
    { media: '(prefers-color-scheme: dark)', color: '#EA580C' },
  ],
}

// GeistSans is self-hosted locally via the official `geist` package (variable font supporting 200, 300, 400)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#F97316" }
      }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      dynamic={true}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
        <head>
          {/* Structured Data */}
          <JsonLd data={generateOrganizationSchema()} />
          <JsonLd data={generateWebSiteSchema()} />

          {/* PWA Meta Tags */}
          <meta name="theme-color" content="#F97316" />
          <meta name="mobile-web-app-capable" content="yes" />
          <link rel="apple-touch-icon" href="/web-app-manifest-192x192.png" />

          {/* Preconnect to external domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://img.clerk.com" />

          {/* Service Worker & Cache Purger to prevent stale bundle retention across browser profiles */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  if (typeof window !== 'undefined') {
                    if ('serviceWorker' in navigator) {
                      navigator.serviceWorker.getRegistrations().then(function(registrations) {
                        for (var i = 0; i < registrations.length; i++) {
                          registrations[i].unregister();
                        }
                      });
                    }
                    if ('caches' in window) {
                      caches.keys().then(function(names) {
                        for (var i = 0; i < names.length; i++) {
                          caches.delete(names[i]);
                        }
                      });
                    }
                  }
                })();
              `,
            }}
          />
        </head>
        <body className={`${GeistSans.className} antialiased`}>
          <QueryProvider>
            {children}
            <PwaInstallPrompt />
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}

