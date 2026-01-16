"use client"

import { CompanyColumn } from "./company-column"
import { CompanyResourcesColumn } from "./company-resources-column"
import { QuickLinksColumn } from "./quick-links-column"
import { PoliciesSocialColumn } from "./policies-social-column"
import { FollowUsColumn } from "./follow-us-column"

interface FooterContentProps {
  isAuthenticated?: boolean
}

export function FooterContent({ isAuthenticated = false }: FooterContentProps) {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Logo & Company Details (33% width - 4 cols) */}
        <CompanyColumn />

        {/* Column 2: Company (16.7% width - 2 cols) */}
        <CompanyResourcesColumn />

        {/* Column 3: Quick Links (16.7% width - 2 cols) */}
        <QuickLinksColumn />

        {/* Column 4: Policies (16.7% width - 2 cols) */}
        <PoliciesSocialColumn />

        {/* Column 5: Follow Us (16.7% width - 2 cols) */}
        <FollowUsColumn />
      </div>
    </div>
  )
}

