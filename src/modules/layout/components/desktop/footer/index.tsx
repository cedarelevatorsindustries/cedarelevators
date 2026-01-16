"use client"

import { AboutSection } from "./components/about-section"
import { FooterContent } from "./components/footer-content"
import { TrustBadges } from "./components/trust-badges"
import { FooterBottom } from "./components/footer-bottom"

interface FooterProps {
  isAuthenticated?: boolean
}

export default function Footer({ isAuthenticated = false }: FooterProps) {
  return (
    <>
      {/* Desktop Only - About Cedar Elevators Section */}
      <div className="footer-about-section">
        <AboutSection />
      </div>

      {/* Desktop Only - Modern Premium Footer */}
      <footer className="hidden md:block bg-white">
        {/* Main Footer Content - 5-Column Layout */}
        <FooterContent isAuthenticated={isAuthenticated} />

        {/* Trust Badges Bar - Light Blue Background */}
        <TrustBadges />

        {/* Bottom Copyright Bar - White Background */}
        <FooterBottom />
      </footer>
    </>
  )
}

