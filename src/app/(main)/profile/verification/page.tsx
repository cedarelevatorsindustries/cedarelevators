import BusinessVerificationSection from '@/modules/profile/components/sections/business-verification-section'
import { redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'

export const metadata = {
  title: 'Business Verification | Cedar B2B Storefront',
  description: 'Complete your business verification to unlock B2B features',
}

export default async function VerificationPage() {
  // Check Clerk authentication
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect=/profile/verification')
  }

  // Get user from Clerk
  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  if (!user) {
    redirect('/sign-in?redirect=/profile/verification')
  }

  // Get account type and verification status from Clerk metadata
  const accountType = user.publicMetadata?.accountType as string ||
    user.unsafeMetadata?.accountType as string ||
    'individual'

  // Only business accounts can access verification
  if (accountType !== 'business') {
    redirect('/profile')
  }

  const verificationStatus = (user.publicMetadata?.verificationStatus as string ||
    user.unsafeMetadata?.verificationStatus as string ||
    'incomplete') as 'pending' | 'approved' | 'rejected' | 'incomplete'

  const rejectionReason = user.publicMetadata?.verificationRejectedReason as string ||
    user.unsafeMetadata?.verificationRejectedReason as string

  return <BusinessVerificationSection />
}

