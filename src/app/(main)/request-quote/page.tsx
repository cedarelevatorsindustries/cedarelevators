import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts } from "@/lib/data"
import { getUserQuotes, formatQuotesForTemplate, formatCurrency } from "@/lib/actions/get-user-quotes"
import { Wallet, TrendingUp } from "lucide-react"
import {
  GuestQuoteTemplate,
  IndividualQuoteTemplate,
  BusinessQuoteTemplate
} from "@/modules/quote/templates"

export const metadata: Metadata = {
  title: "Request Quote - Cedar Elevators",
  description: "Get a quote for elevator components",
}

interface RequestQuotePageProps {
  searchParams: {
    productId?: string
    variantId?: string
    quantity?: string
    source?: string
  }
}

export default async function RequestQuotePage({ searchParams }: RequestQuotePageProps) {
  const userType = await getUserType()

  // Extract URL params for pre-filling
  const productId = searchParams.productId
  const variantId = searchParams.variantId
  const quantity = searchParams.quantity ? parseInt(searchParams.quantity) : undefined
  const source = searchParams.source

  // Fetch products for best selling carousel (guest) or recommendations
  let products: any[] = []
  try {
    const { response } = await listProducts({
      queryParams: { limit: 10 }
    })
    products = response.products
  } catch (error) {
    console.error("Error fetching products:", error)
  }

  // Fetch pre-filled product if productId is provided
  let prefilledProduct = null
  if (productId) {
    try {
      // Find product from products list or fetch it separately
      prefilledProduct = products.find(p => p.id === productId)

      // If not found in list, you might want to fetch it separately
      // For now, we'll just use what we have
    } catch (error) {
      console.error("Error fetching prefilled product:", error)
    }
  }

  // Fetch quote data for individual/business users
  let quoteData: any = null
  if (userType === "individual" || userType === "business") {
    const { quotes, stats } = await getUserQuotes()

    // Format quotes for template
    const formattedQuotes = formatQuotesForTemplate(quotes)

    // Format stats for template
    const formattedStats = [
      {
        label: "Total Spent",
        value: formatCurrency(stats.totalSpent),
        subtext: "Last 30 days",
        icon: Wallet,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100"
      },
      {
        label: "Total Saved",
        value: formatCurrency(stats.totalSaved),
        subtext: "With quotes",
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-100"
      }
    ]

    quoteData = {
      stats: formattedStats,
      quotes: formattedQuotes,
      pendingCount: stats.pendingCount
    }
  }

  const templateProps = {
    products,
    ...quoteData,
    prefilledProduct: prefilledProduct ? {
      id: productId!,
      variantId,
      quantity,
      source
    } : undefined
  }

  // Render based on user type
  if (userType === "guest") {
    return <GuestQuoteTemplate {...templateProps} />
  }

  if (userType === "business") {
    return <BusinessQuoteTemplate {...templateProps} />
  }

  // Individual user
  return <IndividualQuoteTemplate {...templateProps} />
}
