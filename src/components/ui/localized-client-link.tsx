"use client"

import Link from "next/link"
import { ComponentProps } from "react"

interface LocalizedClientLinkProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string
}

/**
 * Wrapper around Next.js Link component for future internationalization support
 * Currently passes through to Link, but can be extended for locale prefixing
 */
export default function LocalizedClientLink({ href, children, ...props }: LocalizedClientLinkProps) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}
