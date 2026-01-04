"use client"

interface Specification {
  label: string
  value: string
}

interface KeySpecTableSectionProps {
  specifications: Specification[]
}

export default function KeySpecTableSection({ specifications }: KeySpecTableSectionProps) {
  if (specifications.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-6 lg:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {specifications.map((spec, index) => (
          <div 
            key={index}
            className="flex justify-between py-3 border-b border-gray-200 last:border-0"
          >
            <span className="font-medium text-gray-700">{spec.label}</span>
            <span className="text-gray-900 font-semibold text-right">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

