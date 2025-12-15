"use client"

/**
 * Sign out the current user
 * This function should be called from client components
 * It uses Clerk's useClerk hook to sign out
 */
export async function signOut() {
  // This is a placeholder - actual implementation should use useClerk().signOut()
  // The component should import useClerk from @clerk/nextjs and call signOut directly
  if (typeof window !== 'undefined') {
    window.location.href = '/sign-out'
  }
}
