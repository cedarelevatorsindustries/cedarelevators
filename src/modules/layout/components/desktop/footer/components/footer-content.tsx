"use client"

import { CompanyColumn } from "./company-column"
import { SupportColumn } from "./support-column"
import { CompanyResourcesColumn } from "./company-resources-column"
import { QuickLinksColumn } from "./quick-links-column"
import { PoliciesSocialColumn } from "./policies-social-column"

export function FooterContent() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Logo & Company Details (33% width - 4 cols) */}
        <CompanyColumn />

        {/* Column 2: Support (16.7% width - 2 cols) */}
        <SupportColumn />

        {/* Column 3: Company + Resources (16.7% width - 2 cols) */}
        <CompanyResourcesColumn />

        {/* Column 4: Quick Links (16.7% width - 2 cols) */}
        <QuickLinksColumn />

        {/* Column 5: Policies + Social (16.7% width - 2 cols) */}
        <PoliciesSocialColumn />
      </div>
    </div>
  )
}
