"use client"

import { useEffect, useState, useRef } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import { FileText, CheckCircle2, Search, Gavel, Mail, Clock, Eye, Download, HelpCircle, ArrowRight, User, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

interface TimelineStep {
    icon: React.ReactNode
    title: string
    description: string
    status: 'completed' | 'current' | 'pending'
}

interface QuoteConfirmationProps {
    quoteId: string              // UUID for linking
    quoteNumber: string          // Formatted for display (e.g., CED-QT-BZ-260116-000123)
    submittedDate: string
    submittedTime: string
    accountType: string
    isVerified?: boolean
    itemsCount: number
    priority: string
    expectedResponseTime: string
}

export default function QuoteConfirmationPage({
    quoteId,
    quoteNumber,
    submittedDate,
    submittedTime,
    accountType,
    isVerified = false,
    itemsCount,
    priority,
    expectedResponseTime = '24–48 business hours',
}: QuoteConfirmationProps) {
    const [animationData, setAnimationData] = useState<any>(null)
    const [animationComplete, setAnimationComplete] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const lottieRef = useRef<LottieRefCurrentProps>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch('/animation/Tick Animation.json')
            .then(res => res.json())
            .then(data => setAnimationData(data))
            .catch(err => console.error('Failed to load animation:', err))

        // Show email confirmation toast
        const timer = setTimeout(() => {
            toast.success('We\'ve emailed the details to you', {
                duration: 4000,
            })
        }, 1500)

        // Sticky header on scroll (mobile)
        const handleScroll = () => {
            if (headerRef.current) {
                const headerBottom = headerRef.current.getBoundingClientRect().bottom
                setShowStickyHeader(headerBottom < 0)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(timer)
        }
    }, [])

    const copyToClipboard = () => {
        navigator.clipboard.writeText(quoteNumber)
        setCopied(true)
        toast.success('Quote ID copied to clipboard')
        setTimeout(() => setCopied(false), 2000)
    }

    const timelineSteps: TimelineStep[] = [
        {
            icon: <CheckCircle2 className="w-4 h-4" />,
            title: 'Quote Received',
            description: 'Application successfully logged in our system.',
            status: 'current',
        },
        {
            icon: <Search className="w-4 h-4" />,
            title: 'Internal Review',
            description: 'Pricing, bulk discounts, and tax verification.',
            status: 'pending',
        },
        {
            icon: <Gavel className="w-4 h-4" />,
            title: 'Final Approval',
            description: 'Sales manager sign-off on custom terms.',
            status: 'pending',
        },
        {
            icon: <Mail className="w-4 h-4" />,
            title: 'Notification',
            description: 'You will receive an email with the final PDF offer.',
            status: 'pending',
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 pt-36 pb-12 px-4">
            {/* Sticky Header - Mobile Only */}
            <div
                className={`fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-md transition-transform duration-300 lg:hidden ${showStickyHeader ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quote ID</p>
                        <p className="text-lg font-bold font-mono text-gray-900">#{quoteNumber}</p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Copy quote ID"
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-green-600" />
                        ) : (
                            <Copy className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                </div>
            </div>
            <div className="max-w-4xl mx-auto">
                {/* Success Icon */}
                <div ref={headerRef} className="flex flex-col items-center text-center mb-10">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                        {!animationComplete ? (
                            animationData && (
                                <Lottie
                                    lottieRef={lottieRef}
                                    animationData={animationData}
                                    loop={false}
                                    autoplay={true}
                                    style={{ width: 80, height: 80 }}
                                    onComplete={() => setAnimationComplete(true)}
                                />
                            )
                        ) : (
                            <img
                                src="/animation/tick.svg"
                                alt="Success"
                                className="w-12 h-12"
                            />
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900 mb-3">
                        Quote Request Submitted
                    </h1>
                    <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
                        Your quotation request has been received and is under review.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Quote Summary Card */}
                        <Card className="overflow-hidden shadow-sm">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-start gap-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                                Reference ID
                                            </p>
                                            <h2 className="text-2xl font-bold font-mono text-gray-900">#{quoteNumber}</h2>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            className="mt-6 p-1.5 hover:bg-gray-100 rounded-md transition-colors group"
                                            aria-label="Copy quote ID"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                            )}
                                        </button>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md border border-blue-100">
                                        IN REVIEW
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {submittedDate} • {submittedTime}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Account Type</p>
                                        <div className="flex items-center gap-1.5">
                                            {isVerified && (
                                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                            )}
                                            <p className="text-sm font-medium text-gray-900">{accountType}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Items Included</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {itemsCount} {itemsCount === 1 ? 'Product' : 'Products'} Requested
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Priority</p>
                                        <p className="text-sm font-medium text-gray-900">{priority}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Processing Timeline */}
                        <Card className="p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-8 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Processing Timeline
                            </h3>

                            <div className="relative space-y-0">
                                {timelineSteps.map((step, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            {/* Icon Circle */}
                                            <div
                                                className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'current'
                                                    ? 'bg-blue-600 text-white ring-4 ring-blue-50'
                                                    : step.status === 'completed'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 border-2 border-gray-200 text-gray-400'
                                                    }`}
                                            >
                                                {step.icon}
                                            </div>

                                            {/* Connecting Line */}
                                            {index < timelineSteps.length - 1 && (
                                                <div
                                                    className={`h-12 w-0.5 ${step.status === 'completed'
                                                        ? 'bg-blue-600'
                                                        : 'bg-gradient-to-b from-gray-200 via-gray-200 to-transparent bg-[length:2px_8px] bg-repeat-y'
                                                        }`}
                                                ></div>
                                            )}
                                        </div>

                                        <div className="pt-1">
                                            <h4
                                                className={`text-sm font-semibold ${step.status === 'current' ? 'text-gray-900' : 'text-gray-600'
                                                    }`}
                                            >
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                                            {step.status === 'current' && (
                                                <span className="text-[10px] font-bold text-blue-600 mt-1 inline-block">
                                                    CURRENT STEP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Expected Response Time */}
                            <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-900">Typical response time:</span>{' '}
                                    {expectedResponseTime}
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            {accountType === 'Guest' ? (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                                    <h4 className="font-semibold text-gray-900 mb-2">Want to track this quote?</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Create an account or log in to view detailed quote status, download PDFs, and manage your requests.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link href="/sign-in?redirect=/quotes" className="flex-1">
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link href="/sign-up?redirect=/quotes" className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Link href={`/quotes/${quoteId}`}>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 px-6 rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-3">
                                            <Eye className="w-5 h-5" />
                                            View Quote Details
                                        </Button>
                                    </Link>
                                    <Link href={`/quotes/${quoteId}`}>
                                        <Button
                                            variant="outline"
                                            className="w-full font-semibold py-6 px-6 rounded-xl flex items-center justify-center gap-3"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download PDF Summary
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>


                    </div>
                </div>


            </div>
        </div>
    )
}
