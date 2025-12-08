"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"

interface HeroLiteProps {
  type: "category" | "application"
  title: string
  description?: string
  subcategories?: Array<{ id: string; name: string; handle?: string }>
  metadata?: Record<string, unknown>
}

export function HeroLite({ type, title, description, subcategories, metadata }: HeroLiteProps) {
  const subcategoriesSection: React.ReactNode = subcategories && subcategories.length > 0 ? (
    <div className="mt-6">
      <div className="text-sm text-gray-400 mb-3">Browse by:</div>
      <div className="flex flex-wrap gap-2">
        {subcategories.map((sub) => (
          <a
            key={sub.id}
            href={`/catalog?type=category&category=${sub.handle || sub.id}`}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {sub.name}
          </a>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl overflow-hidden mb-8">
      <div className="px-8 py-12">
        <div className="max-w-4xl">
          <div className="text-sm text-orange-400 font-semibold mb-2 uppercase tracking-wide">
            {type === "category" ? "Category" : "Application"}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
          
          {description && (
            <p className="text-gray-300 text-lg mb-6">{description}</p>
          )}

          {/* Subcategories */}
          {subcategoriesSection}

          {/* Application Info */}
          {type === "application" && metadata?.applicationInfo ? (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-sm">{metadata.applicationInfo as string}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
