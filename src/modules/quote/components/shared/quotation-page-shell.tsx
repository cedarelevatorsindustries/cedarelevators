import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface QuotationPageShellProps {
  children: React.ReactNode
  maxWidth?: 'narrow' | 'default' | 'wide'
  className?: string
}

const MAX_WIDTH_MAP = {
  narrow: 'max-w-[540px]',
  default: 'max-w-[1000px]',
  wide: 'max-w-[1120px]',
}

export function QuotationPageShell({
  children,
  maxWidth = 'default',
  className = '',
}: QuotationPageShellProps) {
  return (
    <div className={`min-h-screen bg-[#FAFAF9] pt-20 sm:pt-24 pb-24 md:pb-16 ${className}`}>
      <div className={`w-full mx-auto px-4 sm:px-6 ${MAX_WIDTH_MAP[maxWidth]}`}>
        {children}
      </div>
    </div>
  )
}

interface QuotationPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
  reassurance?: React.ReactNode
}

export function QuotationPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
  reassurance,
}: QuotationPageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      {backHref && backLabel && (
        <div className="mb-4">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          {eyebrow && (
            <p className="type-eyebrow text-orange-600">{eyebrow}</p>
          )}
          <h1 className="type-section text-gray-900">{title}</h1>
          {description && (
            <p className="type-body text-gray-600">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">{actions}</div>
        )}
      </div>

      {reassurance && (
        <div className="mt-4">{reassurance}</div>
      )}
    </header>
  )
}
