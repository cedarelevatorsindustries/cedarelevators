import { currentUser } from "@clerk/nextjs/server"

export type UserType = "guest" | "individual" | "business"

export interface AuthUser {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  accountType: UserType
}

/**
 * Get current authenticated user from Clerk
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  // Check both unsafeMetadata (set during signup) and publicMetadata
  const accountType = (user.unsafeMetadata?.accountType as string) || 
                      (user.publicMetadata?.accountType as string) || 
                      "individual"
  
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || null,
    firstName: user.firstName,
    lastName: user.lastName,
    accountType: accountType === "business" ? "business" : "individual"
  }
}

/**
 * Get user type (guest, individual, or business)
 */
export async function getUserType(): Promise<UserType> {
  const user = await currentUser()
  
  if (!user) {
    return "guest"
  }

  // Check both unsafeMetadata (set during signup) and publicMetadata
  const accountType = (user.unsafeMetadata?.accountType as string) || 
                      (user.publicMetadata?.accountType as string)
  
  return accountType === "business" ? "business" : "individual"
}

/**
 * Get company name for business users
 */
export async function getCompanyName(): Promise<string | null> {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  return (user.unsafeMetadata?.company as string) || null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await currentUser()
  return !!user
}

/**
 * Get business verification status for business users
 */
export async function getBusinessVerificationStatus(): Promise<{
  isVerified: boolean
  status: string | null
}> {
  const user = await currentUser()
  
  if (!user) {
    return { isVerified: false, status: null }
  }

  // Check if user is business type
  const accountType = (user.unsafeMetadata?.accountType as string) || 
                      (user.publicMetadata?.accountType as string)
  
  if (accountType !== "business") {
    return { isVerified: false, status: null }
  }

  try {
    // Query business profile for verification status
    const { createClerkSupabaseClient } = await import("@/lib/supabase/server")
    const supabase = await createClerkSupabaseClient()
    
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('verification_status')
      .eq('clerk_user_id', user.id)
      .single()
    
    if (!profile) {
      return { isVerified: false, status: 'unverified' }
    }

    return {
      isVerified: profile.verification_status === 'verified',
      status: profile.verification_status
    }
  } catch (error) {
    console.error('Error fetching verification status:', error)
    return { isVerified: false, status: null }
  }
}
