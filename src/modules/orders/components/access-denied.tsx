'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShieldAlert, ArrowRight } from 'lucide-react'

interface AccessDeniedProps {
    userType: 'guest' | 'individual' | 'business_unverified'
}

export default function AccessDenied({ userType }: AccessDeniedProps) {
    const content = {
        guest: {
            title: 'Sign In Required',
            message: 'Please sign in to view your orders. Orders are available for verified business accounts.',
            primaryCTA: { label: 'Sign In', href: '/sign-in?redirect=/profile/orders' },
            secondaryCTA: { label: 'Create Business Account', href: '/sign-up' }
        },
        individual: {
            title: 'Business Account Required',
            message: 'Orders are only available for business accounts. Upgrade to a business account to place and track orders.',
            primaryCTA: { label: 'Upgrade to Business', href: '/business-signup' },
            secondaryCTA: { label: 'Learn More', href: '/about' }
        },
        business_unverified: {
            title: 'Verification Required',
            message: 'Your business account needs to be verified before you can place and view orders. Complete your verification to get started.',
            primaryCTA: { label: 'Complete Verification', href: '/profile/approvals' },
            secondaryCTA: { label: 'Contact Support', href: '/contact' }
        }
    }

    const config = content[userType]

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Illustration */}
                <div className="mb-8">
                    <Image
                        src="/empty-states/no-result-found.png"
                        alt="Access Denied"
                        width={300}
                        height={300}
                        className="mx-auto"
                    />
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {config.title}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    {config.message}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={config.primaryCTA.href}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        {config.primaryCTA.label}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href={config.secondaryCTA.href}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        {config.secondaryCTA.label}
                    </Link>
                </div>
            </div>
        </div>
    )
}
