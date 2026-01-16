'use client';

import React from 'react';
import { CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';

type UserTier = 'guest' | 'individual' | 'business' | 'verified';

interface UserTierBadgeProps {
    userType: string;
    verificationStatus?: string | null;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

export function UserTierBadge({
    userType,
    verificationStatus,
    size = 'md',
    showIcon = true
}: UserTierBadgeProps) {
    const getTierConfig = () => {
        // Verified business
        if (userType === 'business' && verificationStatus === 'verified') {
            return {
                label: 'Verified Business',
                icon: CheckCircle,
                className: 'bg-green-50 text-green-700 border-green-200',
                iconClassName: 'text-green-600'
            };
        }

        // Unverified business
        if (userType === 'business') {
            return {
                label: 'Business (Pending Verification)',
                icon: Clock,
                className: 'bg-amber-50 text-amber-700 border-amber-200',
                iconClassName: 'text-amber-600'
            };
        }

        // Individual
        if (userType === 'individual') {
            return {
                label: 'Individual Account',
                icon: User,
                className: 'bg-blue-50 text-blue-700 border-blue-200',
                iconClassName: 'text-blue-600'
            };
        }

        // Guest
        return {
            label: 'Guest',
            icon: AlertTriangle,
            className: 'bg-gray-50 text-gray-700 border-gray-200',
            iconClassName: 'text-gray-600'
        };
    };

    const config = getTierConfig();
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}>
            {showIcon && <Icon className={`${iconSizes[size]} ${config.iconClassName}`} />}
            <span>{config.label}</span>
        </div>
    );
}
