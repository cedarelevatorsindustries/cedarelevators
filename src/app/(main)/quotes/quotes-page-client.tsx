"use client"

import { useState } from "react"
import { Quote, QuoteStats, QuoteStatus, UserType } from "@/types/b2b/quote"
import { getQuotes } from "@/lib/actions/quotes"
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    TrendingUp,
    Package,
    Loader2,
    Plus,
    ChevronRight
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, format } from "date-fns"

interface QuotesPageClientProps {
    initialQuotes: Quote[]
    initialStats: QuoteStats
    userType: UserType
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
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Accepted' }
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
    userType
}: QuotesPageClientProps) {
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

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
                    <p className="text-gray-600 mt-1">View and manage your quote requests</p>
                </div>
                <Link
                    href="/request-quote"
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    New Quote
                </Link>
            </div>

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
                            <CheckCircle className="w-5 h-5 text-green-600" />
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
                                ₹{stats.total_value > 0 ? (stats.total_value / 1000).toFixed(1) + 'K' : '0'}
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
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-400" />
                        {(['all', 'pending', 'in_review', 'accepted', 'rejected'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterChange(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                        ? 'bg-blue-600 text-white'
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
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
                                        {quote.estimated_total > 0 && (
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
        </div>
    )
}
