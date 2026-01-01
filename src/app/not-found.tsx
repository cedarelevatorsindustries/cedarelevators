"use client"

import Link from 'next/link'
import { Home, Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f5]">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6">
        <div className="w-full max-w-3xl flex flex-col items-center text-center space-y-8">
          {/* Hero Illustration */}
          <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80")'
              }}
            />
            <div className="absolute inset-0 bg-orange-500/80 mix-blend-multiply" />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-white text-6xl mb-2 opacity-80">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                  <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
                </svg>
              </div>
              <h1 className="text-8xl font-black text-white tracking-tighter drop-shadow-md">404</h1>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1c140d] tracking-tight">
              Out of Service
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Looks like you're stuck between floors. The page you are looking for might have been moved, deleted, or possibly never existed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-orange-500 text-white text-base font-bold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-white border border-[#e6dbd1] text-[#1c140d] text-base font-semibold hover:bg-[#f4ede7] transition-all shadow-sm"
            >
              <Package className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e6dbd1] py-8">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">© 2024 Cedar Elevators Industries. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
