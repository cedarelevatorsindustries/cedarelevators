"use client"

import Link from "next/link"

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  isActive: boolean
}

export function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center transition-colors ${
        isActive ? "text-[#ff3705]" : "text-gray-600"
      }`}
    >
      <Icon size={20} />
      <span className={`text-xs mt-1 ${isActive ? "font-bold" : ""}`}>{label}</span>
    </Link>
  )
}
