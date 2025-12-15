"use client"

import { CheckCircle } from "lucide-react"

const BulkOrderSection = () => {
  return (
    <section className="w-full bg-blue-600 text-white py-16 md:py-24">
      <div className="pl-12 pr-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em]">
            Need Bulk Quantities? Get Contractor Pricing.
          </h2>
          <p className="text-lg text-gray-300">
            Unlock exclusive benefits tailored for our B2B partners. We provide the parts and support you need to keep your projects on schedule and under budget.
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold">Volume Discounts</h4>
                <p className="text-gray-200">Competitive pricing on large orders to maximize your project's profitability.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold">Dedicated Account Manager</h4>
                <p className="text-gray-200">Personalized service from an expert who understands your business needs.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-500 mt-1 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-bold">Custom Solutions & Sourcing</h4>
                <p className="text-gray-200">Access to custom-fabricated parts and our extensive sourcing network.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Form */}
        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="company-name">
                Company Name
              </label>
              <input
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                id="company-name"
                name="company-name"
                placeholder="Your Company Inc."
                type="text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="contact-name">
                Contact Name
              </label>
              <input
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                id="contact-name"
                name="contact-name"
                placeholder="John Doe"
                type="text"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                id="email"
                name="email"
                placeholder="you@company.com"
                type="email"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="product-interest">
                Product(s) of Interest
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                id="product-interest"
                name="product-interest"
                placeholder="e.g., EcoDrive+ Motors, Steel Ropes (Part #12345)"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="quantity">
                Estimated Quantity
              </label>
              <input
                className="w-full rounded-md border border-gray-300 bg-white text-gray-900 px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                id="quantity"
                name="quantity"
                placeholder="e.g., 50 units"
                type="text"
              />
            </div>
            
            <div className="md:col-span-2">
              <button
                className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-orange-500 text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:bg-orange-600 hover:scale-105"
                type="submit"
              >
                <span className="truncate">Request My Bulk Quote</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default BulkOrderSection
