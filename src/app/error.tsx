'use client'

import { useEffect } from 'react'
import { Home, Package } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f6]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-10 lg:px-40 py-10 w-full">
        <div className="w-full max-w-[960px] flex flex-col gap-10">
          <div className="flex flex-col-reverse lg:flex-row gap-10 items-center">
            {/* Text Content */}
            <div className="flex flex-col gap-6 flex-1 text-center lg:text-left">
              <div className="flex flex-col gap-4">
                <span className="text-orange-500 font-black text-6xl md:text-8xl tracking-tighter">500</span>
                <h1 className="text-[#1c140d] text-3xl md:text-4xl font-black leading-tight tracking-tight">
                  Server Stuck Between Floors
                </h1>
                <p className="text-[#897961] text-base md:text-lg font-normal leading-relaxed max-w-[600px] lg:mx-0 mx-auto">
                  We are experiencing a technical malfunction. Our maintenance team has been notified and is currently servicing the lift to get things moving again.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/"
                  className="flex min-w-[140px] items-center justify-center rounded-lg h-12 px-6 bg-orange-500 hover:bg-orange-600 transition-colors text-white text-base font-bold shadow-sm"
                >
                  Go to Homepage
                </Link>
                <Link
                  href="/catalog"
                  className="flex min-w-[140px] items-center justify-center rounded-lg h-12 px-6 bg-white hover:bg-[#f4ede7] transition-colors border border-[#e6dbd1] text-[#1c140d] text-base font-bold"
                >
                  Browse Products
                </Link>
              </div>

              {/* Support Link */}
              <p className="text-[#897961] text-sm pt-2">
                Need urgent help?{' '}
                <Link href="/contact" className="underline decoration-orange-500 hover:text-orange-500 transition-colors">
                  Contact Support Team
                </Link>
              </p>
            </div>

            {/* Image Content */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-full max-w-[480px] aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-[#f4ede7]">
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80")'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent mix-blend-overlay" />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#e6dbd1] mt-auto">
        <div className="px-4 md:px-10 lg:px-40 flex justify-center py-8">
          <div className="flex flex-col gap-6 max-w-[960px] w-full text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link href="/privacy" className="text-[#897961] hover:text-orange-500 transition-colors text-sm font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#897961] hover:text-orange-500 transition-colors text-sm font-medium">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-[#897961] hover:text-orange-500 transition-colors text-sm font-medium">
                Support
              </Link>
              <Link href="/sitemap" className="text-[#897961] hover:text-orange-500 transition-colors text-sm font-medium">
                Sitemap
              </Link>
            </div>
            <p className="text-[#6e6150] text-sm">
              © 2024 Cedar Elevators Industries. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

