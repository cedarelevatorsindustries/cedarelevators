"use client"

import { useState, useEffect } from "react"
import { FileText, Package, LoaderCircle } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"
import { getQuotes } from "@/lib/actions/quotes"
import { Quote } from "@/types/b2b/quote"

interface SnapshotItem {
  label: string
  count: number
  href: string
}

export default function QuotesOrdersSnapshot() {
  const [quotesData, setQuotesData] = useState<{ pending: number; approved: number }>({ pending: 0, approved: 0 })
  const [ordersData, setOrdersData] = useState<{ active: number; completed: number }>({ active: 0, completed: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch quotes data
        const quotesResult = await getQuotes({ status: 'all' })

        if (quotesResult.success && quotesResult.quotes) {
          const pending = quotesResult.quotes.filter(q => q.status === 'pending' || q.status === 'reviewing').length
          const approved = quotesResult.quotes.filter(q => q.status === 'approved').length
          setQuotesData({ pending, approved })
        }

        // TODO: Fetch orders data from Supabase when implemented
        // For now, using placeholder data
        setOrdersData({ active: 0, completed: 0 })
      } catch (error) {
        console.error('Error loading snapshot data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoaderCircle className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </section>
    )
  }

  const quotesItems: SnapshotItem[] = [
    { label: "Pending", count: quotesData.pending, href: "/profile/quotes?status=pending" },
    { label: "Approved", count: quotesData.approved, href: "/profile/quotes?status=accepted" }
  ]

  const ordersItems: SnapshotItem[] = [
    { label: "Active", count: ordersData.active, href: "/profile/orders?status=active" },
    { label: "Completed", count: ordersData.completed, href: "/profile/orders?status=completed" }
  ]

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quotes & Orders</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quotes Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-900">Quotes</h3>
          </div>
          <div className="space-y-2">
            {quotesItems.map((item) => (
              <LocalizedClientLink
                key={item.label}
                href={item.href}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-gray-900">• {item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </LocalizedClientLink>
            ))}
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-gray-900">Orders</h3>
          </div>
          <div className="space-y-2">
            {ordersItems.map((item) => (
              <LocalizedClientLink
                key={item.label}
                href={item.href}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <span className="text-sm text-gray-700 group-hover:text-gray-900">• {item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {quotesData.pending === 0 && quotesData.approved === 0 && ordersData.active === 0 && ordersData.completed === 0 && (
        <div className="text-center py-4 mt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">No quotes or orders yet</p>
          <LocalizedClientLink
            href="/quotes/new"
            className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Request your first quote →
          </LocalizedClientLink>
        </div>
      )}
    </section>
  )
}

