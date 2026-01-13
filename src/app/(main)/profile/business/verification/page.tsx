import BusinessVerificationSection from '@/modules/profile/components/sections/business-verification-section'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const metadata = {
    title: 'Business Verification | Cedar B2B Storefront',
    description: 'Complete your business verification to unlock B2B features',
}

export default async function BusinessVerificationPage() {
    // Check Clerk authentication
    const { userId } = await auth()

    if (!userId) {
        redirect('/sign-in?redirect=/profile/business/verification')
    }

    // Get user from Clerk
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user) {
        redirect('/sign-in?redirect=/profile/business/verification')
    }

    // Get account type from Clerk metadata - check multiple possible keys
    const accountType = user.publicMetadata?.accountType as string ||
        user.unsafeMetadata?.accountType as string ||
        user.publicMetadata?.account_type as string ||
        user.unsafeMetadata?.account_type as string ||
        'individual'

    // Only individual accounts should be blocked from verification
    if (accountType === 'individual') {
        redirect('/profile')
    }

    // Use shared utility to get user profile and verification status
    // this ensures consistency with the rest of the application
    const { getUserWithProfile } = await import('@/lib/services/auth-sync')
    const userWithProfile = await getUserWithProfile(userId)

    if (userWithProfile?.business?.verification_status === 'verified') {
        // Already verified, redirect to profile with success message
        redirect('/profile?verified=true')
    }

    return <BusinessVerificationSection />
}
