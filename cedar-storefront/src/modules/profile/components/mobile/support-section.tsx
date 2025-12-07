'use client'

import { HelpCircle, Phone, MessageCircle } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

export default function SupportSection() {
  return (
    <MenuSection title="Support & Help">
      <MenuItem 
        icon={HelpCircle} 
        label="Help & FAQ" 
        href="/help" 
        bgColor="bg-orange-50" 
        iconColor="text-orange-500" 
      />
      <MenuItem 
        icon={Phone} 
        label="Contact Sales" 
        href="tel:+911234567890" 
        bgColor="bg-green-100" 
        iconColor="text-green-600" 
      />
      <MenuItem 
        icon={MessageCircle} 
        label="WhatsApp Support" 
        href="https://wa.me/911234567890" 
        bgColor="bg-green-100" 
        iconColor="text-green-600" 
      />
    </MenuSection>
  )
}
