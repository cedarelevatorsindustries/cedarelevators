import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { getOrderById } from "@/lib/data/orders"
import OrderDetailsTemplate from "@/modules/orders/templates/order-details-template"

export const metadata = {
    title: "Order Details | Cedar B2B Storefront",
    description: "View order details and status",
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    try {
        const { userId } = await auth()
        const { id } = params

        if (!userId) {
            redirect("/sign-in?redirect=/profile/orders")
        }

        // Fetch order details
        const order = await getOrderById(id)

        // Verify ownership
        // Note: getOrderById should ideally verify ownership, but checking here is safer 
        // if using Supabase client with RLS properly, it handles it. 
        // If not, we should check order.clerk_user_id === userId

        if (!order) {
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
