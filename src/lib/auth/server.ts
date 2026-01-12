import { currentUser } from "@clerk/nextjs/server"
import { getUserWithProfile, type UserWithProfile } from "@/lib/services/auth-sync"

export type UserType = "guest" | "individual" | "business" | "verified"

export interface BusinessDetails {
  id: string
  name: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  verified_at: string | null
  verified_by: string | null
}

export interface EnhancedAuthUser {
  // Clerk data
  clerkUser: {
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
  }
  // Supabase data
  user: {
    id: string
    clerk_user_id: string
    email: string
    phone: string | null
    name: string | null
  }
  // Active profile
  activeProfile: {
    id: string
    profile_type: 'individual' | 'business'
    is_active: boolean
  }
  // Business (if applicable)
  business?: BusinessDetails
  // Derived properties
  userType: UserType
  isVerified: boolean
}

/**
 * Get current authenticated user with full context
 * This is the main auth function - use this instead of getAuthUser
 */
export async function getAuthUser(): Promise<EnhancedAuthUser | null> {
  const clerkUser = await currentUser()

  if (!clerkUser) {
    return null
  }

  // Sync with Supabase and get profile
  const userWithProfile = await getUserWithProfile(clerkUser.id)

  if (!userWithProfile) {
    return null
  }

  const { user, activeProfile, business } = userWithProfile

  // Derive user type
  let userType: UserType = 'guest'
  let isVerified = false

  if (activeProfile.profile_type === 'individual') {
    userType = 'individual'
  } else if (activeProfile.profile_type === 'business') {
    if (business?.verification_status === 'verified') {
      userType = 'verified'
      isVerified = true
    } else {
      userType = 'business'
    }
  }

  return {
    clerkUser: {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName
    },
    user: {
      id: user.id,
      clerk_user_id: user.clerk_user_id,
      email: user.email,
      phone: user.phone,
      name: user.name
    },
    activeProfile: {
      id: activeProfile.id,
      profile_type: activeProfile.profile_type,
      is_active: activeProfile.is_active
    },
    business: business ? {
      id: business.id,
      name: business.name,
      verification_status: business.verification_status,
      verified_at: business.verified_at,
      verified_by: business.verified_by,
    } : undefined,
    userType,
    isVerified
  }
}

/**
 * Get user type (guest, individual, business, or verified)
 * Derived from active profile, not Clerk metadata
 */
export async function getUserType(): Promise<UserType> {
  const authUser = await getAuthUser()

  if (!authUser) {
    return "guest"
  }

  return authUser.userType
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await currentUser()
  return !!user
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<EnhancedAuthUser> {
  const authUser = await getAuthUser()

  if (!authUser) {
    throw new Error('Authentication required')
  }

  return authUser
}

/**
 * Require business profile (throws if not business)
 */
export async function requireBusinessProfile(): Promise<EnhancedAuthUser> {
  const authUser = await requireAuth()

  if (authUser.activeProfile.profile_type !== 'business') {
    throw new Error('Business profile required')
  }

  return authUser
}

/**
 * Require verified business (throws if not verified)
 */
export async function requireVerifiedBusiness(): Promise<EnhancedAuthUser> {
  const authUser = await requireBusinessProfile()

  if (!authUser.isVerified) {
    throw new Error('Verified business account required')
  }

  return authUser
}

/**
 * Get business verification status
 */
export async function getBusinessVerificationStatus(): Promise<{
  isVerified: boolean
  status: string | null
}> {
  const authUser = await getAuthUser()

  if (!authUser || !authUser.business) {
    return { isVerified: false, status: null }
  }

  return {
    isVerified: authUser.business.verification_status === 'verified',
    status: authUser.business.verification_status
  }
}

/**
 * Get company name for business users
 */
export async function getCompanyName(): Promise<string | null> {
  const authUser = await getAuthUser()

  if (!authUser || !authUser.business) {
    return null
  }

  return authUser.business.name
}

/**
 * Check if user has business profile
 */
export async function hasBusinessProfile(): Promise<boolean> {
  const authUser = await getAuthUser()

  if (!authUser) {
    return false
  }

  // Check if user has a business in their context
  return !!authUser.business
}

