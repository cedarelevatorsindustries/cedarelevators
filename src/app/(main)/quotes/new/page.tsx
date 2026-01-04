import { auth, currentUser } from '@clerk/nextjs/server';
import { QuoteForm } from '@/modules/quote/components/quote-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Request a Quote | Cedar Elevators',
    description: 'Get a custom quote for your elevator needs',
}

export default async function NewQuotePage() {
    const { userId } = await auth();

    let userType: 'guest' | 'individual' | 'business' | 'verified' = 'guest';
    let verificationStatus = null;

    if (userId) {
        const user = await currentUser();
        // Logic to determine role from metadata
        // e.g. publicMetadata: { role: 'admin', account_type: 'business', verification_status: 'verified' }

        const role = user?.publicMetadata?.role;
        const accountType = user?.publicMetadata?.account_type as string;
        const vStatus = user?.publicMetadata?.verification_status as string;

        if (role === 'admin' || vStatus === 'verified') {
            userType = 'verified';
            verificationStatus = 'verified';
        } else if (accountType === 'business') {
            userType = 'business';
            verificationStatus = vStatus || 'pending'; // 'unverified'
        } else {
            userType = 'individual';
        }
    }

    return (
        <div className="container py-8 pt-24 max-w-7xl mx-auto px-4">
            <QuoteForm userType={userType} verificationStatus={verificationStatus} />
        </div>
    )
}

