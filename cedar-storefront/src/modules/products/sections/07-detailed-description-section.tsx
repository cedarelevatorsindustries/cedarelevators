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

      {features.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
