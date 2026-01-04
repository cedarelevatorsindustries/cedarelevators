'use client'

import { User, MapPin, Lock } from 'lucide-react'
import MenuItem from './menu-item'
import MenuSection from './menu-section'

export default function AccountSection() {
  return (
    <MenuSection title="Account Management">
      <MenuItem 
        icon={User} 
        label="Edit Profile" 
        href="/profile/account" 
        bgColor="bg-blue-100" 
        iconColor="text-blue-600" 
      />
      <MenuItem 
        icon={MapPin} 
        label="My Addresses" 
        href="/profile/addresses" 
        bgColor="bg-purple-100" 
        iconColor="text-purple-600" 
      />
      <MenuItem 
        icon={Lock} 
        label="Change Password" 
        href="/profile/password" 
        bgColor="bg-gray-100" 
        iconColor="text-gray-600" 
      />
    </MenuSection>
  )
}

