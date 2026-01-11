"use client"

import { useState, useEffect } from "react"
import { Quote, QuoteStatus } from "@/types/b2b/quote"
import { getAdminQuotes, updateQuoteStatus } from "@/lib/actions/admin-quotes"
import {
    FileText,
    Clock,
    CircleCheck,
    XCircle,
    Search,
    LoaderCircle,
    RefreshCw,
    User,
    Building2,
    Star,
    Eye
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Status configuration
const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case 'pending':
            return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Pending' }
        case 'reviewing':
            return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Eye, label: 'Reviewing' }
        case 'approved':
            return { color: 'bg-green-100 text-green-700 border-green-200', icon: CircleCheck, label: 'Approved' }
        case 'rejected':
            return { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Rejected' }
        case 'converted':
            return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CircleCheck, label: 'Converted' }
        case 'expired':
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Expired' }
        default:
            return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileText, label: status }
    }
}

// User type configuration
const getUserTypeConfig = (userType: string) => {
    switch (userType) {
        case 'guest':
            return { icon: User, label: 'Guest', color: 'text-gray-500' }
        case 'individual':
            return { icon: User, label: 'Individual', color: 'text-blue-500' }
        case 'business':
            return { icon: Building2, label: 'Business', color: 'text-purple-500' }
        case 'verified':
            return { icon: Star, label: 'Verified', color: 'text-green-500' }
        default:
            return { icon: User, label: userType, color: 'text-gray-500' }
    }
}

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<Quote[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Filters
    const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all')
    const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'guest' | 'individual' | 'business' | 'verified'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const loadQuotes = async () => {
        try {
            const result = await getAdminQuotes({
                status: statusFilter,
                priority: 'all',
                user_type: userTypeFilter,
                date_range: 'all',
                search: searchQuery
            })

            if (result.success) {
                setQuotes(result.quotes || [])
            } else {
                setQuotes([])
                console.error('Error loading quotes:', result.error)
            }
        } catch (error) {
            console.error('Error loading quotes:', error)
            setQuotes([])
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadQuotes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, userTypeFilter, searchQuery])

    const handleRefresh = () => {
        setIsRefreshing(true)
        loadQuotes()
    }

    const handleStartReview = async (quoteId: string) => {
        try {
            const result = await updateQuoteStatus(quoteId, 'reviewing')
            if (result.success) {
                toast.success('Quote moved to reviewing')
                loadQuotes()
            } else {
                toast.error(result.error || 'Failed to update status')
            }
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <LoaderCircle className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6" data-testid="admin-quotes-page">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quote Requests</h1>
                    <p className="text-gray-600 mt-1">Review and manage customer quote requests</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by quote number, email, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'all')}
                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="converted">Converted</option>
                        </select>

                        {/* User Type Filter */}
                        <select
                            value={userTypeFilter}
                            onChange={(e) => setUserTypeFilter(e.target.value as typeof userTypeFilter)}
                            className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Users</option>
                            <option value="guest">Guest</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                            <option value="verified">Verified Business</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Quotes Table */}
            {quotes.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No quotes found</h3>
                        <p className="text-gray-500">
                            {searchQuery || statusFilter !== 'all' || userTypeFilter !== 'all'
                                ? "Try adjusting your search or filters"
                                : "Quote requests will appear here"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Quote #</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User Type</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {quotes.map((quote) => {
                                    const statusConfig = getStatusConfig(quote.status)
                                    const userTypeConfig = getUserTypeConfig(quote.account_type)
                                    const UserTypeIcon = userTypeConfig.icon

                                    return (
                                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                            {/* Quote Number */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/quotes/${quote.id}`}
                                                    className="font-medium text-gray-900 hover:text-orange-600"
                                                >
                                                    #{quote.quote_number}
                                                </Link>
                                            </td>

                                            {/* User Type */}
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1.5 ${userTypeConfig.color}`}>
                                                    <UserTypeIcon className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{userTypeConfig.label}</span>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">
                                                        {quote.guest_name || quote.company_details?.company_name || 'User'}
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        {quote.guest_email || quote.company_details?.contact_phone || '—'}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Items */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">{quote.items?.length || 0} items</span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                                    {statusConfig.label}
                                                </span>
                                            </td>

                                            {/* Created */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-500">
                                                    {formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {quote.status === 'pending' ? (
                                                        <Button
                                                            size="sm"
                                                            className="bg-orange-600 hover:bg-orange-700 text-white"
                                                            onClick={() => handleStartReview(quote.id)}
                                                        >
                                                            Review
                                                        </Button>
                                                    ) : (
                                                        <Link href={`/admin/quotes/${quote.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}
