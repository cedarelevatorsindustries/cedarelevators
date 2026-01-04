"use client"

import Image from "next/image"
import LocalizedClientLink from "@components/ui/localized-client-link"

interface NavbarLogoProps {
  isTransparent: boolean
}

export function NavbarLogo({ isTransparent }: NavbarLogoProps) {
  return (
    <LocalizedClientLink
      href="/"
      className="flex items-center hover:opacity-80 transition-opacity"
      aria-label="Cedar Elevators - Return to homepage"
    >
      <Image
        src="/logo/cedarelevatorstypo.png"
        alt="Cedar Elevators"
        width={240}
        height={80}
        className={`h-8 w-auto transition-all duration-300 ${
          isTransparent ? 'brightness-0 invert' : ''
        }`}
        priority
      />
    </LocalizedClientLink>
  )
}

