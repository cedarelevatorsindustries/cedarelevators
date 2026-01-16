import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/server"
import { getOrderById } from "@/lib/data/orders"
import OrderDetailsTemplate from "@/modules/orders/templates/order-details-template"
import AccessDenied from "@/modules/orders/components/access-denied"

export const metadata = {
    title: "Order Details | Cedar B2B Storefront",
    description: "View order details and status",
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    try {
        const { userId } = await auth()
        const { id } = params

        // Redirect guests to sign-in
        if (!userId) {
            redirect("/sign-in?redirect=/profile/orders")
        }

        // Use admin client to get user profile data
        const supabase = createAdminClient()

        // Get user profile from business_profiles (joined with users)
        const { data: businessProfile } = await supabase
            .from("business_profiles")
            .select("*, users!inner(clerk_user_id)")
            .eq("clerk_user_id", userId)
            .single()

        // Check if business is verified
        const isVerified = businessProfile?.verification_status === 'verified'
        const isBusiness = !!businessProfile

        // Allow access for verified business users OR all individual users
        if (!isVerified) {
            // Check if individual user (no business profile is OK)
            if (!businessProfile) {
                // Individual user - can view their own orders
            } else {
                // Business user but not verified
                return <AccessDenied userType="business_unverified" />
            }
        }

        // Fetch order details
        const order = await getOrderById(id)

        // Verify ownership - order should belong to this user
        if (!order || order.clerk_user_id !== userId) {
            return (
                <div className="container mx-auto py-12 px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Order Not Found</h1>
                    <p className="text-gray-600 mt-2">The order you are looking for does not exist or you don't have permission to view it.</p>
                    <a href="/profile/orders" className="text-[#F97316] hover:underline mt-4 inline-block">Back to Orders</a>
                </div>
            )
        }

        return <OrderDetailsTemplate order={order} />

    } catch (error) {
        console.error("Error loading order details:", error)
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Error Loading Order</h1>
                <p className="text-gray-600 mt-2">There was an error loading your order details. Please try again later.</p>
                <a href="/profile/orders" className="text-[#F97316] hover:underline mt-4 inline-block">Back to Orders</a>
            </div>
        )
    }
}
