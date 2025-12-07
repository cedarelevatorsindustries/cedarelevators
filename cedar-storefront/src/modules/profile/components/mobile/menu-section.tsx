'use client'

interface MenuSectionProps {
  title?: string
  children: React.ReactNode
}

export default function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <div className="mt-2 text-left w-full">
      {title && (
        <div className="px-6 py-4">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        </div>
      )}
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  )
}
