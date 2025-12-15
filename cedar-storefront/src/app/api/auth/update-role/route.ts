import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { accountType, companyName } = body

    if (!accountType || !["individual", "business"].includes(accountType)) {
      return NextResponse.json(
        { error: "Invalid account type. Must be 'individual' or 'business'" },
        { status: 400 }
      )
    }

    // Update user metadata in Clerk
    const client = await clerkClient()
    const updatedUser = await client.users.updateUser(userId, {
      unsafeMetadata: {
        accountType,
        ...(companyName && accountType === "business" ? { company: companyName } : {}),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        userId: updatedUser.id,
        accountType,
      },
    })
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
