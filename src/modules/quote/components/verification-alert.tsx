'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VerificationAlertProps {
    verificationStatus: string | null | undefined;
    className?: string;
}

export function VerificationAlert({ verificationStatus, className = '' }: VerificationAlertProps) {
    if (!verificationStatus || verificationStatus === 'verified') {
        return null;
    }

    const getAlertConfig = () => {
        switch (verificationStatus) {
            case 'pending':
                return {
                    icon: Clock,
                    title: 'Business Verification Pending',
                    description: 'Your verification is under review. You\'ll receive an email once approved.',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                    textColor: 'text-amber-900',
                    iconColor: 'text-amber-600',
                    showAction: false
                };

            case 'rejected':
                return {
                    icon: XCircle,
                    title: 'Verification Requires Attention',
                    description: 'Additional information needed for verification.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-900',
                    iconColor: 'text-red-600',
                    showAction: true,
                    actionText: 'Update Information',
                    actionHref: '/profile/business'
                };

            default: // unverified
                return {
                    icon: AlertTriangle,
                    title: 'Complete Business Verification',
                    description: 'Unlock instant pricing, bulk discounts, and priority support.',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-900',
                    iconColor: 'text-blue-600',
                    showAction: true,
                    actionText: 'Start Verification',
                    actionHref: '/profile/business'
                };
        }
    };

    const config = getAlertConfig();
    const Icon = config.icon;

    return (
        <div className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4 ${className}`}>
            <div className="flex gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                <div className="flex-1">
                    <h3 className={`font-semibold ${config.textColor} mb-1`}>
                        {config.title}
                    </h3>
                    <p className={`text-sm ${config.textColor} opacity-90`}>
                        {config.description}
                    </p>
                    {config.showAction && config.actionHref && (
                        <Link
                            href={config.actionHref}
                            className={`inline-flex items-center mt-3 text-sm font-medium ${config.textColor} hover:underline`}
                        >
                            {config.actionText} →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// Verified business success banner
export function VerifiedBadge({ className = '' }: { className?: string }) {
    return (
        <div className={`rounded-lg border bg-green-50 border-green-200 p-3 ${className}`}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-900">Verified Business Pricing Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700">
                    <span className="px-2 py-0.5 bg-green-100 rounded border border-green-300 font-medium">
                        High Priority
                    </span>
                    <span className="text-xs">• Est. response: 4-8 hours</span>
                </div>
            </div>
        </div>
    );
}
