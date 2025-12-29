import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { createClerkSupabaseClient } from "@/lib/supabase/server"

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

    // 4. Create/update user profile in Supabase
    const supabase = await createClerkSupabaseClient()

    const companyName = clerkUser.unsafeMetadata?.company as string | undefined
    const taxId = clerkUser.unsafeMetadata?.tax_id as string | undefined

    const profileData = {
      clerk_user_id: userId,
      email: email,
      first_name: clerkUser.firstName || "",
      last_name: clerkUser.lastName || "",
      account_type: accountType,
      company_name: companyName || null,
      tax_id: taxId || null,
      is_verified: false,
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || null,
      updated_at: new Date().toISOString()
    }

    console.log("Syncing user profile to Supabase:", { clerk_user_id: userId, email, account_type: accountType })

    // Upsert user profile (insert or update if exists)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (profileError) {
      console.error("Error upserting user profile:", profileError)
      return NextResponse.json(
        { error: `Failed to sync user profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    console.log("User profile synced successfully:", profile)

    return NextResponse.json({
      success: true,
      data: {
        profile_id: profile.id,
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
