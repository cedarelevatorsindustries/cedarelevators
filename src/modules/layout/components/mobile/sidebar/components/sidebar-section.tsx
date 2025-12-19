"use client"

import Link from "next/link"
import type { MenuItem } from "../../../common"

interface SidebarSectionProps {
  title: string
  icon: React.ReactNode
  items: MenuItem[]
  onItemClick: () => void
}

export function SidebarSection({ title, icon, items, onItemClick }: SidebarSectionProps) {
  return (
    <div className="py-2 border-t border-gray-200">
      <div className="px-4 py-2 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onItemClick}
        >
          <item.icon size={18} />
          <span className="text-sm">{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
