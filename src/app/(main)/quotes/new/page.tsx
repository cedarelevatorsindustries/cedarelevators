import { auth, currentUser } from '@clerk/nextjs/server';
import { QuoteForm } from '@/modules/quote/components/quote-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Request a Quote | Cedar Elevators',
    description: 'Get a custom quote for your elevator needs',
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NewQuotePage(props: PageProps) {
    const { userId } = await auth();

    // Await searchParams as it's a Promise in Next.js 15
    const searchParams = await props.searchParams;

    // Parse search params for prefilling
    const productId = typeof searchParams.productId === 'string' ? searchParams.productId : undefined;
    const productName = typeof searchParams.productName === 'string' ? searchParams.productName : undefined;
    // Get quantity from URL params (passed from product detail page)
    const quantityParam = typeof searchParams.quantity === 'string' ? parseInt(searchParams.quantity, 10) : undefined;
    const prefillQuantity = quantityParam && !isNaN(quantityParam) ? quantityParam : 1;

    // Get variantId from URL params if provided
    const variantId = typeof searchParams.variantId === 'string' ? searchParams.variantId : undefined;

    // Optional: Get price from params if needed, but safer to let it be fetched or optional
    const prefilledProduct = productId && productName ? {
        id: productId,
        name: productName,
        quantity: prefillQuantity,
        variantId: variantId // Include variant if provided from PDP
    } : null;

    let userType: 'guest' | 'individual' | 'business' | 'verified' = 'guest';
    let verificationStatus = null;
    let userProfile = null;

    if (userId) {
        const user = await currentUser();

        // Use unsafeMetadata to match the rest of the codebase
        const accountType = user?.unsafeMetadata?.accountType as string | undefined;
        const isVerified = user?.unsafeMetadata?.is_verified === true;
        // Get actual verification status from metadata - check BOTH camelCase and snake_case for backward compatibility
        const actualVerificationStatus = (user?.unsafeMetadata as any)?.verificationStatus as string | undefined ||
            (user?.unsafeMetadata as any)?.verification_status as string | undefined;

        // Check if user is verified either by is_verified boolean OR verificationStatus = 'approved'
        if (isVerified || actualVerificationStatus === 'approved') {
            userType = 'verified';
            verificationStatus = 'approved';
        } else if (accountType === 'business') {
            userType = 'business';
            // Use actual verification status instead of defaulting to 'pending'
            verificationStatus = actualVerificationStatus || 'unverified';
        } else if (accountType === 'individual') {
            userType = 'individual';
        }

        // Extract user profile data for auto-population
        userProfile = {
            name: user?.unsafeMetadata?.full_name as string || user?.firstName || '',
            email: user?.emailAddresses?.[0]?.emailAddress || '',
            phone: user?.unsafeMetadata?.phone_number as string || ''
        };
    }

    return (
        <div className="container py-8 pt-24 max-w-7xl mx-auto px-4">
            <QuoteForm
                userType={userType}
                verificationStatus={verificationStatus}
                prefilledProduct={prefilledProduct}
                userProfile={userProfile}
            />
        </div>
    )
}

