"use client"

import { useState } from "react"
import Image from "next/image"

interface Specification {
  label: string
  value: string
}

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified?: boolean
}

interface ProductTabsSectionProps {
  description: string
  features?: string[]
  specifications: Specification[]
  reviews?: Review[]
  onScrollToReviews?: () => void
}

export default function ProductTabsSection({
  description,
  features = [],
  specifications,
  reviews = [],
  onScrollToReviews
}: ProductTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'attributes' | 'reviews'>('description')

  const handleReviewsClick = () => {
    onScrollToReviews?.()
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 text-base font-semibold transition-all relative ${activeTab === 'description'
              ? 'text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Description
            {activeTab === 'description' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`px-6 py-4 text-base font-semibold transition-all relative ${activeTab === 'attributes'
              ? 'text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Attributes
            {activeTab === 'attributes' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            onClick={handleReviewsClick}
            className="px-6 py-4 text-base font-semibold transition-all relative text-gray-600 hover:text-gray-900"
          >
            Reviews ({reviews.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 lg:p-8">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === 'attributes' && (
          <div className="animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Key Attributes</h3>
            {specifications.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {specifications.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-3 font-medium text-gray-700 border-b border-gray-200 last:border-0 w-1/3">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3 text-gray-900 border-b border-gray-200 last:border-0">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src="/empty-states/no-attributes.png"
                    alt="No attributes available"
                    fill
                    className="object-contain opacity-80"
                  />
                </div>
                <p className="text-gray-500 font-medium">No specifications available</p>
                <p className="text-sm text-gray-400 mt-1">This product has no additional attributes listed.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

