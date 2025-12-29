"use client"

import { useState } from "react"
import { Quote, QuoteStats, QuoteStatus, UserType } from "@/types/b2b/quote"
import { getQuotes } from "@/lib/actions/quotes"
import {
    FileText,
    Clock,
    CircleCheck,
    XCircle,
    Search,
    Filter,
    TrendingUp,
    Package,
    LoaderCircle,
    Plus,
    ChevronRight,
    AlertCircle,
    Send,
    Upload
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"

interface QuotesPageClientProps {
    initialQuotes: Quote[]
    initialStats: QuoteStats
    userType: UserType
    isVerified: boolean
    verificationStatus: string | null
    products?: any[]
}

const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Pending' }
        case 'in_review':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText, label: 'In Review' }
        case 'negotiation':
            return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileText, label: 'Negotiation' }
        case 'accepted':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CircleCheck, label: 'Accepted' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Package, label: 'Converted to Order' }
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: status }
    }
}

export default function QuotesPageClient({
    initialQuotes,
    initialStats,
    userType,
    isVerified,
    verificationStatus,
    products = []
}: QuotesPageClientProps) {
    const [activeTab, setActiveTab] = useState<'new' | 'list'>('list')
    const [quotes, setQuotes] = useState(initialQuotes)
    const [stats] = useState(initialStats)
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleFilterChange = async (status: QuoteStatus | 'all') => {
        setStatusFilter(status)
        setIsLoading(true)
        try {
            const result = await getQuotes({
                status,
                date_range: 'all',
                search: searchQuery
            })
            if (result.success) {
                setQuotes(result.quotes)
            }
        } catch (error) {
            console.error('Error filtering quotes:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.length >= 2 || query.length === 0) {
            setIsLoading(true)
            try {
                const result = await getQuotes({
                    status: statusFilter,
                    date_range: 'all',
                    search: query
                })
                if (result.success) {
                    setQuotes(result.quotes)
                }
            } catch (error) {
                console.error('Error searching quotes:', error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    // GUEST USER VIEW - Lead Capture Form
    if (userType === "guest") {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                    <div className="text-center mb-8">
                        <FileText className="w-16 h-16 text-[#ff3705] mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Quote</h1>
                        <p className="text-gray-600">
                            Get competitive pricing for elevator components. Our team will respond within 24 hours.
                        </p>
                    </div>

                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none"
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none"
                                    placeholder="ABC Elevators"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Requirements *
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none resize-none"
                                placeholder="Please describe the elevator components you need, quantities, and any specific requirements..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attachments (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff3705] transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3705] text-white rounded-lg font-medium hover:bg-[#e63305] transition-colors"
                        >
                            <Send className="w-5 h-5" />
                            Submit Quote Request
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-[#ff3705] hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        )
    }

    // LOGGED-IN USERS VIEW
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Verification Banner for Unverified Business Users */}
            {userType === "business" && !isVerified && (
                <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-orange-900 mb-1">
                            Business verification required
                        </h3>
                        <p className="text-sm text-orange-700 mb-3">
                            Complete verification to unlock pricing and checkout features
                        </p>
                        <Link
                            href="/profile?tab=business"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                            Complete Verification
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {userType === "business" ? "Business Quotes" : "My Quotes"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {activeTab === 'new' ? 'Request a new quote' : 'View and manage your quote requests'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === 'list'
                            ? 'text-[#ff3705] border-b-2 border-[#ff3705]'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    My Quotes
                </button>
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === 'new'
                            ? 'text-[#ff3705] border-b-2 border-[#ff3705]'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    New Quote
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'new' ? (
                // NEW QUOTE TAB
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="text-center py-8">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Create New Quote
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Use the request quote page to create your quote request
                        </p>
                        <Link
                            href="/request-quote"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff3705] text-white rounded-lg font-medium hover:bg-[#e63305] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Go to Request Quote
                        </Link>
                    </div>
                </div>
            ) : (
                // MY QUOTES TAB
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total_quotes}</p>
                                    <p className="text-sm text-gray-500">Total Quotes</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending_count}</p>
                                    <p className="text-sm text-gray-500">Pending</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CircleCheck className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.accepted_count}</p>
                                    <p className="text-sm text-gray-500">Accepted</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {isVerified && stats.total_value > 0 
                                            ? `₹${(stats.total_value / 1000).toFixed(1)}K` 
                                            : '-'}
                                    </p>
                                    <p className="text-sm text-gray-500">Total Value</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by quote number..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ff3705] focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Filter className="w-5 h-5 text-gray-400" />
                                {(['all', 'pending', 'in_review', 'accepted', 'rejected'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => handleFilterChange(status)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            statusFilter === status
                                                ? 'bg-[#ff3705] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quotes List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoaderCircle className="w-8 h-8 animate-spin text-[#ff3705]" />
                        </div>
                    ) : quotes.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quotes found</h3>
                            <p className="text-gray-500 mb-6">
                                {searchQuery || statusFilter !== 'all'
                                    ? "Try adjusting your search or filters"
                                    : "Start by requesting a quote for the products you need"}
                            </p>
                            <Link
                                href="/request-quote"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff3705] text-white rounded-lg font-medium hover:bg-[#e63305] transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Request Quote
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quotes.map((quote) => {
                                const statusConfig = getStatusConfig(quote.status)
                                const StatusIcon = statusConfig.icon

                                return (
                                    <Link
                                        key={quote.id}
                                        href={`/quotes/${quote.id}`}
                                        className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Status Icon */}
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusConfig.color.split(' ')[0]}`}>
                                                    <StatusIcon className={`w-6 h-6 ${statusConfig.color.split(' ')[1]}`} />
                                                </div>

                                                {/* Quote Info */}
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-semibold text-gray-900">Quote #{quote.quote_number}</h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>{quote.items?.length || 0} items</span>
                                                        <span>•</span>
                                                        <span>{formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}</span>
                                                        {quote.valid_until && (
                                                            <>
                                                                <span>•</span>
                                                                <span>Valid until {format(new Date(quote.valid_until), 'MMM d, yyyy')}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right side */}
                                            <div className="flex items-center gap-4">
                                                {isVerified && quote.estimated_total > 0 && (
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-900">
                                                            ₹{quote.estimated_total.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500">Estimated Total</p>
                                                    </div>
                                                )}
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
