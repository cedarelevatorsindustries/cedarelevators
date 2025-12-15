'use client'

import { Download } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

export default function DownloadSection() {
  return (
    <MenuSection>
      <MenuItem 
        icon={Download} 
        label="Download Center" 
        href="/resources" 
        bgColor="bg-purple-100" 
        iconColor="text-purple-600" 
      />
    </MenuSection>
  )
}
