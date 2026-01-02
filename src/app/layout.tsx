import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import "@/styles/globals.css"
import { JsonLd } from "@/components/seo/json-ld"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/structured-data"
import { Toaster } from "@/components/ui/sonner"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cedarelevators.com'

export const metadata: Metadata = {
  title: {
    default: "Cedar Elevators - Premium Lift Components",
    template: "%s | Cedar Elevators"
  },
  description: "India's leading B2B marketplace for premium elevator components. Shop high-quality lift parts, motors, controllers, and accessories with competitive wholesale pricing.",
  keywords: "elevator components, lift parts, elevator motors, lift controllers, elevator accessories, B2B marketplace, wholesale elevator parts, India",
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
    title: 'Cedar Elevators - Premium Lift Components',
    description: "India's leading B2B marketplace for premium elevator components",
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
    title: 'Cedar Elevators - Premium Lift Components',
    description: "India's leading B2B marketplace for premium elevator components",
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
}

import { Space_Grotesk } from "next/font/google"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

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
      <html lang="en">
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
        </head>
        <body className={spaceGrotesk.variable}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
