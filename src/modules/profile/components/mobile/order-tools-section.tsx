'use client'

import { Package, Truck, Heart, RotateCcw } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

interface OrderToolsSectionProps {
  accountType: 'individual' | 'business'
}

export default function OrderToolsSection({ accountType }: OrderToolsSectionProps) {
  return (
    <MenuSection title="Order Management">
      <MenuItem 
        icon={Package} 
        label="My Orders" 
        href="/profile/orders" 
        bgColor="bg-blue-100" 
        iconColor="text-blue-600" 
      />
      <MenuItem 
        icon={Truck} 
        label="Track Order" 
        href="/track-order" 
        bgColor="bg-cyan-100" 
        iconColor="text-cyan-600" 
      />
      <MenuItem 
        icon={Heart} 
        label="Saved Items" 
        href="/profile/wishlist" 
        bgColor="bg-pink-100" 
        iconColor="text-pink-600" 
      />
      <MenuItem 
        icon={RotateCcw} 
        label="Quick Reorder" 
        href="/profile/orders" 
        bgColor="bg-green-100" 
        iconColor="text-green-600" 
      />
    </MenuSection>
  )
}
