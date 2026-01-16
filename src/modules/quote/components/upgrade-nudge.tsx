'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface UpgradeNudgeProps {
    currentTier: 'guest' | 'individual' | 'business';
    variant?: 'banner' | 'inline' | 'card';
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
}

export function UpgradeNudge({
    currentTier,
    variant = 'banner',
    dismissible = false,
    onDismiss,
    className = ''
}: UpgradeNudgeProps) {
    const getNudgeConfig = () => {
        switch (currentTier) {
            case 'guest':
                return {
                    title: 'Track this quote',
                    description: 'Create a free account to save quotes and track status',
                    cta: 'Create Account',
                    href: '/choose-type',
                    icon: Sparkles
                };

            case 'individual':
                return {
                    title: 'Buying for a business?',
                    description: 'Register as a business to access instant pricing and bulk discounts',
                    cta: 'Upgrade to Business',
                    href: '/profile',
                    icon: ArrowRight
                };

            case 'business':
                return {
                    title: 'Complete verification',
                    description: 'Get instant pricing, priority support, and exclusive business benefits',
                    cta: 'Start Verification',
                    href: '/profile/business',
                    icon: ArrowRight
                };

            default:
                return null;
        }
    };

    const config = getNudgeConfig();
    if (!config) return null;

    const Icon = config.icon;

    // Banner variant (full width, prominent)
    if (variant === 'banner') {
        return (
            <div className={`rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 p-4 ${className}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                        <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{config.title}</h4>
                            <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={config.href}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                            {config.cta}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        {dismissible && onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                aria-label="Dismiss"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Inline variant (compact, subtle)
    if (variant === 'inline') {
        return (
            <div className={`text-sm text-gray-600 ${className}`}>
                {config.description}{' '}
                <Link href={config.href} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                    {config.cta} →
                </Link>
            </div>
        );
    }

    // Card variant (standalone callout)
    return (
        <div className={`rounded-lg border border-gray-200 bg-white p-6 text-center ${className}`}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{config.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{config.description}</p>
            <Link
                href={config.href}
                className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
                {config.cta}
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
