"use client"

interface ShortDescriptionSectionProps {
  description: string
}

export default function ShortDescriptionSection({ description }: ShortDescriptionSectionProps) {
  if (!description) return null

  return (
    <div className="py-4 border-y">
      <p className="text-gray-700 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
