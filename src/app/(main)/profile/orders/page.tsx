import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'
import { getCustomerOrders, getOrderSummary } from "@/lib/data/orders"
import OrderHistoryTemplate from "@/modules/orders/templates/order-history-template"
import { auth } from "@clerk/nextjs/server"
import { getUserWithProfile } from "@/lib/services/auth-sync"


export const metadata = {
  title: "Order History | Cedar B2B Storefront",
  description: "View your order history and track your purchases",
}

export default async function OrderHistoryPage() {
  try {
    const { userId } = await auth()

    // Redirect guests to sign-in
    if (!userId) {
      redirect("/sign-in?redirect=/profile/orders")
    }

    // Get user with profile using the same method as the working profile page
    const userWithProfile = await getUserWithProfile(userId)

    // Default values
    let accountType: 'individual' | 'business' = 'individual'
    let isVerified = false
    let orders: any[] = []
    let summary = {
      totalOrders: 0,
      delivered: 0,
      inTransit: 0,
      totalSpent: 0,
    }

    if (userWithProfile) {
      const { activeProfile, business } = userWithProfile

      // Determine account type from active profile
      accountType = activeProfile.profile_type === 'business' ? 'business' : 'individual'

      // Check verification status from business data
      isVerified = business?.verification_status === 'verified'

      console.log('[Orders Page] User:', userWithProfile.user.clerk_user_id)
      console.log('[Orders Page] Active Profile Type:', activeProfile.profile_type)
      console.log('[Orders Page] Business Verification:', business?.verification_status)
      console.log('[Orders Page] Account Type:', accountType)
      console.log('[Orders Page] Is Verified:', isVerified)

      // Fetch orders for individual OR verified business users
      if (accountType === 'individual' || (accountType === 'business' && isVerified)) {
        try {
          orders = await getCustomerOrders(userWithProfile.user.clerk_user_id)
          summary = await getOrderSummary(userWithProfile.user.clerk_user_id)
        } catch (error) {
          console.error("Error fetching orders:", error)
        }
      }
    } else {
      console.error('[Orders Page] getUserWithProfile returned null')
    }

    // Show orders page for:
    // 1. Individual users (with upgrade prompt)
    // 2. Verified business users (full access)
    return (
      <OrderHistoryTemplate
        orders={orders}
        summary={summary}
        accountType={accountType}
        isVerified={isVerified}
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
        accountType="individual"
        isVerified={false}
      />
    )
  }
}

