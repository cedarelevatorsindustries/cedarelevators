"use client"

interface DetailedDescriptionSectionProps {
  description: string
  features?: string[]
}

export default function DetailedDescriptionSection({
  description,
  features = []
}: DetailedDescriptionSectionProps) {
  return (
    <div className="bg-white rounded-xl p-6 lg:p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Product Description</h2>

      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  )
}

