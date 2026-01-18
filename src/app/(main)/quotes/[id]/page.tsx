import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getQuoteById } from '@/lib/actions/quotes';
import { QuoteDetail } from '@/modules/quote/components/quote-detail';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Quote Details | Cedar Elevators',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: PageProps) {
    const { id } = await params;
    const { userId } = await auth();
    if (!userId) {
        redirect(`/sign-in?redirect_url=/quotes/${id}`);
    }

    const { success, quote, error } = await getQuoteById(id);

    if (!success || !quote) {
        if (error !== 'Unauthorized') {
            // Maybe 404
            if (!quote) notFound();
            return <div className="p-8 text-red-500">Error: {error}</div>;
        }
        return <div className="p-8 text-red-500">Could not load quote.</div>;
    }

    // Determine user type for role-based visibility
    const user = await currentUser();
    let userType: 'guest' | 'individual' | 'business' | 'verified' = 'individual';

    if (!user) {
        userType = 'guest';
    } else {
        // First check Clerk unsafeMetadata (most reliable source for account type)
        const unsafeMetadata = user.unsafeMetadata as any;
        const accountType = unsafeMetadata?.account_type || unsafeMetadata?.accountType;
        const verificationStatus = unsafeMetadata?.verification_status || unsafeMetadata?.verificationStatus;
        const isVerified = unsafeMetadata?.is_verified;

        console.log('Clerk metadata:', { accountType, verificationStatus, isVerified });

        if (user.publicMetadata?.role === 'admin') {
            userType = 'verified';
        } else if (verificationStatus === 'verified' || verificationStatus === 'approved' || isVerified === true) {
            userType = 'verified';
        } else if (accountType === 'business') {
            // Check businesses table for verification status
            const { createClerkSupabaseClient } = await import('@/lib/supabase/server');
            const supabase = await createClerkSupabaseClient();

            const { data: businessData } = await supabase
                .from('businesses')
                .select('verification_status')
                .eq('user_id', userId)
                .single();

            console.log('Business data from DB:', businessData);

            if (businessData?.verification_status === 'verified' || businessData?.verification_status === 'approved') {
                userType = 'verified';
            } else {
                userType = 'business';
            }
        } else {
            userType = 'individual';
        }
    }

    console.log('Final userType:', userType);

    return (
        <div className="container py-8 max-w-5xl mx-auto px-4">
            <div className="mb-6">
                <a href="/quotes" className="text-neutral-500 hover:text-industrial-blue text-sm flex items-center gap-1">
                    ← Back to Quotes
                </a>
            </div>
            <Suspense fallback={<div>Loading details...</div>}>
                <QuoteDetail quote={quote} userType={userType as any} />
            </Suspense>
        </div>
    )
}
