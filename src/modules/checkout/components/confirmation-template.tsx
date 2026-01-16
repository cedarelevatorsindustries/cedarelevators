"use client"

import { CheckCircle, Package, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ConfirmationStep {
    number: number
    title: string
    description: string
    badge?: string
    badgeColor?: 'orange' | 'gray' | 'green'
}

interface ConfirmationAction {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'default' | 'outline'
    icon?: React.ReactNode
}

interface SummaryDetail {
    label: string
    value: string
    icon?: React.ReactNode
}

interface ConfirmationTemplateProps {
    type: 'order' | 'quote'
    id: string
    title: string
    subtitle: string
    summaryDetails: SummaryDetail[]
    steps: ConfirmationStep[]
    actions: ConfirmationAction[]
    helpLink?: string
}

/**
 * Unified Confirmation Template
 * 
 * Displays order or quote confirmation with consistent structure:
 * - Success icon and headings
 * - Summary card with details
 * - "What Happens Next" / "What's Next" steps
 * - Action buttons
 * - Help link
 */
export default function ConfirmationTemplate({
    type,
    id,
    title,
    subtitle,
    summaryDetails,
    steps,
    actions,
    helpLink,
}: ConfirmationTemplateProps) {
    const getBadgeStyles = (color?: 'orange' | 'gray' | 'green') => {
        switch (color) {
            case 'orange':
                return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'green':
                return 'bg-green-100 text-green-700 border-green-200'
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 pt-20">
            <div className="max-w-xl mx-auto">
                {/* Success Icon */}
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        {subtitle}
                    </p>
                </div>

                {/* Summary Card */}
                <Card className="mb-8 overflow-hidden">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 relative">
                        {/* Decorative illustration */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                            <div className="relative">
                                <Package className="w-32 h-32 text-orange-300" strokeWidth={1} />
                                <div className="absolute -bottom-4 -left-2 w-8 h-12 border-l-2 border-orange-300 rounded-bl-full" />
                                <div className="absolute -bottom-2 left-4 w-6 h-6 border-2 border-orange-300 rounded-full" />
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="relative z-10">
                            <div className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4">
                                Reference Summary
                            </div>

                            <div className="space-y-3">
                                {summaryDetails.map((detail, index) => (
                                    <div key={index}>
                                        <div className="flex items-start gap-2">
                                            {detail.icon && (
                                                <div className="text-gray-600 mt-0.5">
                                                    {detail.icon}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-0.5">
                                                    {detail.label}
                                                </p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {detail.value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* What's Next Section */}
                <Card className="mb-6 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-orange-500 text-xl">📋</span>
                        <h2 className="text-xl font-bold text-gray-900">
                            What{type === 'order' ? ' Happens' : '\'s'} Next
                        </h2>
                    </div>

                    <div className="space-y-5">
                        {steps.map((step) => (
                            <div key={step.number} className="flex gap-4">
                                {/* Number Badge */}
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                                        {step.number}
                                    </div>
                                </div>

                                {/* Step Content */}
                                <div className="flex-1 pt-0.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900">{step.title}</h3>
                                        {step.badge && (
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getBadgeStyles(step.badgeColor)}`}>
                                                {step.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Expected turnaround for quotes */}
                    {type === 'quote' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-orange-600">Expected turnaround:</span> Our team typically responds within <span className="font-semibold">24 hours</span>. For urgent inquiries, please contact our priority support.
                            </p>
                        </div>
                    )}
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {actions.map((action, index) => {
                        if (action.href) {
                            return (
                                <Link key={index} href={action.href} className="flex-1">
                                    <Button
                                        className={`w-full ${action.variant === 'default' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                                        size="lg"
                                        variant={action.variant || 'default'}
                                    >
                                        {action.icon && <span className="mr-2">{action.icon}</span>}
                                        {action.label}
                                    </Button>
                                </Link>
                            )
                        }

                        return (
                            <div key={index} className="flex-1">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    variant={action.variant || 'default'}
                                    onClick={action.onClick}
                                >
                                    {action.icon && <span className="mr-2">{action.icon}</span>}
                                    {action.label}
                                </Button>
                            </div>
                        )
                    })}
                </div>

                {/* Help Link */}
                {helpLink && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Need help with your {type}?{' '}
                            <Link href={helpLink} className="text-orange-600 font-semibold hover:text-orange-700 underline">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
