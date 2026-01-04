"use client"

import { X, Check, Minus } from "lucide-react"

interface PricingComparisonModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingComparisonModal({ isOpen, onClose }: PricingComparisonModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Account Type Comparison</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Guest</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-900">Individual</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600 bg-blue-50">Business</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Pricing Visibility</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                    <span className="text-xs text-gray-600 block mt-1">Hidden (XXX)</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                    <span className="text-xs text-gray-600 block mt-1">Hidden (XXX)</span>
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                    <span className="text-xs text-gray-600 block mt-1">Full visibility</span>
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Volume Discounts</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Bulk Pricing Tiers</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Direct Purchase</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-yellow-600 text-xs">Via quote</span>
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Quote Requests</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Credit Terms</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Dedicated Account Manager</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Priority Support</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>

                <tr>
                  <td className="py-4 px-4 text-gray-700">Bulk Order Upload (CSV)</td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Minus className="w-5 h-5 text-red-500 mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center bg-blue-50">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to unlock full pricing and benefits?
            </h3>
            <p className="text-gray-600 mb-4">
              Upgrade to a Business Account today and get instant access to competitive pricing, volume discounts, and dedicated support.
            </p>
            <div className="flex gap-3">
              <a
                href="/register/business"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Upgrade to Business
              </a>
              <a
                href="/contact"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

