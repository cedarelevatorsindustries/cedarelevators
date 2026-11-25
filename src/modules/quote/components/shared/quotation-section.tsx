import React from 'react'

interface QuotationSectionProps {
  stepNumber?: string
  title: string
  description?: string
  rightSlot?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}

export function QuotationSection({
  stepNumber,
  title,
  description,
  rightSlot,
  children,
  className = '',
  id,
}: QuotationSectionProps) {
  return (
    <section
      id={id}
      className={`bg-white rounded-xl border border-gray-200/90 shadow-[0_1px_2px_rgba(17,24,39,0.03)] p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-5 border-b border-gray-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5">
            {stepNumber && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-700 text-xs tabular-nums shrink-0">
                {stepNumber}
              </span>
            )}
            <h2 className="type-subsection text-gray-900">{title}</h2>
          </div>
          {description && (
            <p className="type-body-sm text-gray-500">{description}</p>
          )}
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {children}
    </section>
  )
}
