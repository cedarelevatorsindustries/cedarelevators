"use client"

import Link from "next/link"

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  isActive: boolean
  showBadge?: boolean // Green dot indicator for verified business users
}

export function NavItem({ href, icon: Icon, label, isActive, showBadge = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center transition-colors relative ${
        isActive ? "text-[#ff3705]" : "text-gray-600"
      }`}
    >
      <div className="relative">
        <Icon size={20} />
        {showBadge && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
        )}
      </div>
      <span className={`text-xs mt-1 ${isActive ? "font-bold" : ""}`}>{label}</span>
    </Link>
  )
}

