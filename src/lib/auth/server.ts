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
