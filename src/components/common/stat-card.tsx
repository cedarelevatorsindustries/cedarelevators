"use client"

import { LucideIcon } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  bgColor: string
  trend?: string
  subtext?: string
  action?: string
  href?: string
  variant?: "mobile" | "desktop"
  onClick?: () => void
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  subtext,
  action,
  href,
  variant = "desktop",
  onClick
}: StatCardProps) {
  const content = (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 transition-all ${
      href || onClick ? 'hover:shadow-md hover:border-blue-300 cursor-pointer group' : ''
    }`}>
      <div className={`${bgColor} ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        href || onClick ? 'group-hover:scale-110 transition-transform' : ''
      }`}>
        <Icon size={24} />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-600">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <span className="text-xs font-medium text-green-600">{trend}</span>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-gray-500">{subtext}</p>
        )}
        {action && (
          <p className={`text-xs ${color} font-medium ${href || onClick ? 'group-hover:underline' : ''}`}>
            {action}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  if (onClick) {
    return <button onClick={onClick} className="w-full text-left">{content}</button>
  }

  return content
}

// Grid wrapper component for consistent layouts
interface StatGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5
  className?: string
}

export function StatGrid({ children, columns = 5, className = "" }: StatGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5"
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  )
}

