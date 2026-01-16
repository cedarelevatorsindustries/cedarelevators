'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface PricingVisibilityProps {
    userType: string;
    verificationStatus?: string | null;
    price?: number;
    showPrice?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export function PricingVisibility({
    userType,
    verificationStatus,
    price,
    showPrice,
    children,
    className = ''
}: PricingVisibilityProps) {
    // Determine if user can see prices
    const canSeePrices = showPrice || (userType === 'business' && verificationStatus === 'verified');

    // If price should be shown and we have a price
    if (canSeePrices && price !== undefined) {
        return (
            <div className={className}>
                {children || (
                    <div className="text-lg font-semibold text-gray-900">
                        ₹{price.toLocaleString()}
                    </div>
                )}
            </div>
        );
    }

    // Show locked state for guests, individuals, and unverified businesses
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
                {userType === 'business' && verificationStatus !== 'verified'
                    ? 'Unlocks after verification'
                    : 'Price shared after review'}
            </span>
        </div>
    );
}

// Utility hook for price visibility logic
export function useCanSeePrices(userType: string, verificationStatus?: string | null) {
    return userType === 'business' && verificationStatus === 'verified';
}
