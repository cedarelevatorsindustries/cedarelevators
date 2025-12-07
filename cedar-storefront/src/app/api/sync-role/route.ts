import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { medusaClient } from "@/lib/medusa"
import { upsertCustomerMeta } from "@/lib/db"

export async function POST() {
  try {
    // 1. Get authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Get full user details from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    
    // 3. Get account type from metadata
    const accountType = (clerkUser.unsafeMetadata?.accountType as string) ||
                        (clerkUser.publicMetadata?.accountType as string) ||
                        "individual"

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      return NextResponse.json(
        { error: "No email found for user" },
        { status: 400 }
      )
    }

    // 4. Get or create Medusa customer using custom sync endpoint
    let medusaCustomer
    
    try {
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/customers/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          email,
          first_name: clerkUser.firstName || "",
          last_name: clerkUser.lastName || "",
          clerk_user_id: userId,
        }),
      })

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json()
        throw new Error(errorData.error || "Failed to sync customer")
      }

      const syncData = await syncResponse.json()
      medusaCustomer = syncData.customer
    } catch (syncError: any) {
      console.error("Error syncing Medusa customer:", syncError)
      return NextResponse.json(
        { error: `Failed to create customer in Medusa: ${syncError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    if (!medusaCustomer) {
      return NextResponse.json(
        { error: "Failed to get or create Medusa customer" },
        { status: 500 }
      )
    }

    // 5. Sync role to Neon DB (customer_meta table)
    const companyName = clerkUser.unsafeMetadata?.company as string | undefined
    const taxId = clerkUser.unsafeMetadata?.tax_id as string | undefined

    const customerMeta = await upsertCustomerMeta({
      customer_id: medusaCustomer.id,
      clerk_user_id: userId,
      account_type: accountType as "individual" | "business",
      company_name: companyName || null,
      tax_id: taxId || null,
      is_verified: false, // Can be updated later via admin panel
    })

    if (!customerMeta) {
      return NextResponse.json(
        { error: "Failed to sync customer metadata to database" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        customer_id: medusaCustomer.id,
        clerk_user_id: userId,
        account_type: accountType,
        synced_at: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error in sync-role API:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
