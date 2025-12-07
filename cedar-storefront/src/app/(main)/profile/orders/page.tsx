import { redirect } from "next/navigation"
import { getCustomerOrders, getOrderSummary } from "@/lib/data/orders"
import OrderHistoryTemplate from "@/modules/orders/templates/order-history-template"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Order History | Cedar B2B Storefront",
  description: "View your order history and track your purchases",
}

export default async function OrderHistoryPage() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      redirect("/sign-in?redirect=/profile/orders")
    }

    const supabase = await createClient()

    // Get user profile to check if business user and get medusa_customer_id
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    // If no profile or no Medusa customer ID, show empty state
    if (profileError || !profile || !profile.medusa_customer_id) {
      return (
        <OrderHistoryTemplate 
          orders={[]}
          summary={{
            totalOrders: 0,
            delivered: 0,
            inTransit: 0,
            totalSpent: 0,
          }}
          isBusinessUser={profile?.account_type === 'business'}
        />
      )
    }

    // Fetch orders from Medusa
    const orders = await getCustomerOrders(profile.medusa_customer_id)
    const summary = await getOrderSummary(profile.medusa_customer_id)

    return (
      <OrderHistoryTemplate 
        orders={orders}
        summary={summary}
        isBusinessUser={profile?.account_type === 'business'}
      />
    )
  } catch (error) {
    console.error("Error loading order history:", error)
    
    // Show empty state on error
    return (
      <OrderHistoryTemplate 
        orders={[]}
        summary={{
          totalOrders: 0,
          delivered: 0,
          inTransit: 0,
          totalSpent: 0,
        }}
        isBusinessUser={false}
      />
    )
  }
}
