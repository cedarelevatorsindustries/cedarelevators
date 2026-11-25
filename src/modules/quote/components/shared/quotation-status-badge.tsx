import React from 'react'
import { CheckCircle2, Clock, FileCheck2, AlertCircle, XCircle } from 'lucide-react'
import { getCustomerStatusInfo } from '@/lib/quote-state-machine'

interface QuotationStatusBadgeProps {
  status?: string | null
  labelOverride?: string
  toneOverride?: string
  size?: 'sm' | 'md'
}

export function QuotationStatusBadge({
  status,
  labelOverride,
  toneOverride,
  size = 'sm',
}: QuotationStatusBadgeProps) {
  const info = getCustomerStatusInfo(status)
  const label = labelOverride || info.label
  const tone = toneOverride || info.tone

  const toneStyles: Record<string, string> = {
    info: 'bg-orange-50 text-orange-800 border-orange-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    danger: 'bg-red-50 text-red-800 border-red-200/80',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const Icon = (() => {
    switch (tone) {
      case 'success':
        return CheckCircle2
      case 'warning':
        return Clock
      case 'danger':
        return XCircle
      case 'neutral':
        return AlertCircle
      default:
        return FileCheck2
    }
  })()

  const sizeClasses =
    size === 'md'
      ? 'px-3 py-1 text-xs gap-1.5'
      : 'px-2.5 py-0.5 text-xs gap-1'

  return (
    <span
      className={`inline-flex items-center rounded-full border whitespace-nowrap ${sizeClasses} ${toneStyles[tone] || toneStyles.neutral}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label}</span>
    </span>
  )
}
