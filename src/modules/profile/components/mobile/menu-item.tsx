'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface MenuItemProps {
  icon: any
  label: string
  href: string
  bgColor: string
  iconColor: string
  badge?: string | number
}

export default function MenuItem({ 
  icon: Icon, 
  label, 
  href, 
  bgColor, 
  iconColor, 
  badge 
}: MenuItemProps) {
  return (
    <Link 
      href={href} 
      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="text-gray-900 font-medium text-[15px]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
            {badge}
          </span>
        )}
        <ChevronRight className="h-5 w-5 text-gray-400" strokeWidth={2} />
      </div>
    </Link>
  )
}
