import { Metadata } from "next"
import { getUserType } from "@/lib/auth/server"
import { listProducts } from "@/lib/data"
import {
  GuestQuoteTemplate,
  IndividualQuoteTemplate,
  BusinessQuoteTemplate
} from "@/modules/quote/templates"

export const metadata: Metadata = {
  title: "Request Quote - Cedar Elevators",
  description: "Get a quote for elevator components",
}

export default async function RequestQuotePage() {
  const userType = await getUserType()

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

  // Render based on user type
  if (userType === "guest") {
    return <GuestQuoteTemplate products={products} />
  }

  if (userType === "business") {
    return <BusinessQuoteTemplate products={products} />
  }

  // Individual user
  return <IndividualQuoteTemplate products={products} />
}
