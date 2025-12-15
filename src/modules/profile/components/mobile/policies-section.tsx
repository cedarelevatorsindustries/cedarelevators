'use client'

import { Shield, Truck, RotateCcw, FileText } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

export default function PoliciesSection() {
  return (
    <>
      {/* Policies */}
      <MenuSection title="Policies">
        <MenuItem 
          icon={Shield} 
          label="Warranty Info" 
          href="/warranty" 
          bgColor="bg-indigo-100" 
          iconColor="text-indigo-600" 
        />
        <MenuItem 
          icon={Truck} 
          label="Shipping & Delivery" 
          href="/shipping" 
          bgColor="bg-cyan-100" 
          iconColor="text-cyan-600" 
        />
        <MenuItem 
          icon={RotateCcw} 
          label="Returns & Refunds" 
          href="/returns" 
          bgColor="bg-amber-100" 
          iconColor="text-amber-600" 
        />
      </MenuSection>

      {/* Legal */}
      <MenuSection title="Legal">
        <MenuItem 
          icon={FileText} 
          label="Privacy Policy" 
          href="/privacy" 
          bgColor="bg-gray-100" 
          iconColor="text-gray-600" 
        />
        <MenuItem 
          icon={FileText} 
          label="Terms of Service" 
          href="/terms" 
          bgColor="bg-gray-100" 
          iconColor="text-gray-600" 
        />
        <MenuItem 
          icon={FileText} 
          label="Payment Terms" 
          href="/payment-terms" 
          bgColor="bg-gray-100" 
          iconColor="text-gray-600" 
        />
      </MenuSection>
    </>
  )
}
