"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "motion/react"

interface ProductTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "basic-information", label: "1. Basic Info", step: 1 },
  { id: "media", label: "2. Media", step: 2 },
  { id: "product-details", label: "3. Details", step: 3 },
  { id: "variants", label: "4. Variants", step: 4 },
  { id: "classification", label: "5. Classification", step: 5 },
  { id: "pricing-inventory", label: "6. Pricing", step: 6 },
  { id: "seo", label: "7. SEO", step: 7 },
  { id: "review", label: "8. Review", step: 8 }
]

export function ProductTabs({ activeTab, onTabChange }: ProductTabsProps) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardContent className="p-4">
        <div className="w-full">
          <div className="flex items-center w-full dark:bg-orange-950/30 bg-orange-50 p-1 dark:text-white text-black rounded-md border border-orange-100/50 dark:border-orange-900/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id ? 'text-white' : 'text-orange-600/70 dark:text-orange-300/70 hover:text-orange-700 dark:hover:text-orange-200'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeProductTab"
                    className="absolute inset-0 bg-orange-600 dark:bg-orange-700 rounded-md shadow-sm"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                <span className="relative z-2 uppercase text-xs font-semibold">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}