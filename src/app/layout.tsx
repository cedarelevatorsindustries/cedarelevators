import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import "@/styles/globals.css"
import { RoleSyncProvider } from "@/components/providers"

export const metadata: Metadata = {
  title: "Cedar Elevators - Premium Lift Components",
  description: "India's leading B2B marketplace for premium elevator components",
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
        <body className={spaceGrotesk.variable}>
          <RoleSyncProvider>
            {children}
          </RoleSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
