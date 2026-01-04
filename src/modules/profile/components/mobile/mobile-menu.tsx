'use client'

import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import * as Icons from 'lucide-react'
import MenuSection from './menu-section'
import MenuItem from './menu-item'
import { getMobileProfileMenu } from '@/lib/utils/profile-mobile'
import { AccountType } from '@/lib/constants/profile'

interface MobileMenuProps {
  accountType: AccountType
  isVerified?: boolean
}

/**
 * Mobile Menu Component
 * 
 * Renders role-specific menu sections using the menu configuration
 * from profile-mobile.ts utility
 * 
 * Handles:
 * - Navigation to profile pages
 * - Logout action
 * - Badge display
 * - Icon rendering
 */
export default function MobileMenu({ accountType, isVerified = false }: MobileMenuProps) {
  const router = useRouter()
  const { signOut } = useClerk()
  
  const menuSections = getMobileProfileMenu(accountType, isVerified)
  
  const handleMenuItemClick = async (item: any) => {
    if (item.onClick === 'logout') {
      await signOut()
      router.push('/')
    } else if (item.href) {
      router.push(item.href)
    }
  }
  
  return (
    <div className="flex flex-col">
      {menuSections.map((section, sectionIndex) => (
        <MenuSection key={sectionIndex} title={section.title}>
          {section.items.map((item, itemIndex) => {
            // Dynamically get icon component
            const IconComponent = (Icons as any)[item.icon] || Icons.Circle
            
            return (
              <MenuItem
                key={itemIndex}
                icon={IconComponent}
                label={item.label}
                href={item.href || '#'}
                bgColor="bg-gray-100"
                iconColor="text-gray-600"
                badge={item.badge}
                onClick={item.onClick === 'logout' ? () => handleMenuItemClick(item) : undefined}
                showChevron={item.chevron !== false}
              />
            )
          })}
        </MenuSection>
      ))}
    </div>
  )
}

