'use client'

import { Building2, ShieldCheck } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

interface BusinessSectionProps {
  verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'
}

export default function BusinessSection({ 
  verificationStatus = 'incomplete' 
}: BusinessSectionProps) {
  const isVerified = verificationStatus === 'approved'

  return (
    <MenuSection title="Business">
      <MenuItem 
        icon={Building2} 
        label="Business Profile" 
        href="/profile/account" 
        bgColor="bg-purple-100" 
        iconColor="text-purple-600" 
      />
      <MenuItem 
        icon={ShieldCheck} 
        label="Verification" 
        href="/profile/verification" 
        bgColor={isVerified ? "bg-green-100" : "bg-red-100"} 
        iconColor={isVerified ? "text-green-600" : "text-red-600"}
        badge={!isVerified ? "Required" : undefined}
      />
    </MenuSection>
  )
}
