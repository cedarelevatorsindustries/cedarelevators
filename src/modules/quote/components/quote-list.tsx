'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Quote, UserType } from '../types';
import { QuoteStatusBadge } from './quote-status-badge';
import Image from 'next/image';
import DynamicCollectionSection from '@/components/common/DynamicCollectionSection';
import { LayoutDashboard, Plus, Clock, CheckCircle2, AlertCircle, ChevronRight, Package, FileText } from 'lucide-react';

interface QuoteListProps {
    userType: UserType | 'verified';
    quotes: Quote[];
    isLoading?: boolean;
    collections?: any[];
}

export function QuoteList({ userType, quotes, isLoading, collections = [] }: QuoteListProps) {
    // 1. Calculate Stats
    const stats = {
        total: quotes.length,
        approved: quotes.filter(q => q.status === 'approved').length,
        pending: quotes.filter(q => ['pending', 'submitted', 'reviewing'].includes(q.status)).length,
        rejected: quotes.filter(q => q.status === 'rejected').length
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500">
                <div className="animate-spin w-8 h-8 border-4 border-industrial-blue border-t-transparent rounded-full mb-4"></div>
                <p>Loading your quote hub...</p>
            </div>
        );
    }

    // Empty State
    if (quotes.length === 0) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-white border border-dashed border-gray-300">
                    <div className="relative w-48 h-48 mb-6 opacity-80">
                        <Image
                            src="/empty-states/empty-quotes.png"
                            alt="No quotes found"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Quote Hub Empty</h3>
                    <p className="text-gray-500 mb-8 text-center max-w-sm">
                        You haven't requested any quotes yet. Build your project list and request a custom quote today.
                    </p>
                    <Link
                        href="/quotes/new"
                        className="flex items-center gap-2 bg-industrial-blue hover:bg-industrial-blue-dark text-white px-8 py-3 rounded-lg font-medium shadow-md transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Request New Quote
                    </Link>
                </div>

                {/* Mobile Collections Fallback */}
                {collections.length > 0 && (
                    <div className="pt-8 border-t border-gray-100 md:hidden">
                        <div className="space-y-8">
                            {collections.map((collection) => (
                                <DynamicCollectionSection
                                    key={collection.id}
                                    collection={{
                                        ...collection,
                                        isActive: true,
                                        products: mapCollectionProducts(collection.products)
                                    }}
                                    variant="mobile"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        Quote Hub
                    </h1>
                    <p className="text-gray-500 mt-1">Manage, track, and approve your quote requests.</p>
                </div>
                <Link
                    href="/quotes/new"
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Request Quote
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Requests"
                    value={stats.total}
                    icon={<FileText className="w-5 h-5 text-gray-500" />}
                    bg="bg-gray-50"
                />
                <StatCard
                    label="Pending Action"
                    value={stats.pending}
                    icon={<Clock className="w-5 h-5 text-amber-500" />}
                    bg="bg-amber-50"
                    textColor="text-amber-700"
                />
                <StatCard
                    label="Approved"
                    value={stats.approved}
                    icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                    bg="bg-green-50"
                    textColor="text-green-700"
                />
                <StatCard
                    label="Rejected"
                    value={stats.rejected}
                    icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                    bg="bg-red-50"
                    textColor="text-red-700"
                />
            </div>

            {/* Quote List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Requests</h2>
                <div className="grid gap-4">
                    {quotes.map((quote) => (
                        <QuoteCard key={quote.id} quote={quote} userType={userType} />
                    ))}
                </div>
            </div>

            {/* Mobile Collections Footer */}
            {collections.length > 0 && (
                <div className="pt-12 md:hidden">
                    <div className="border-t border-gray-200 pt-8">
                        <div className="space-y-8">
                            {collections.map((collection) => (
                                <DynamicCollectionSection
                                    key={collection.id}
                                    collection={{
                                        ...collection,
                                        isActive: true,
                                        products: mapCollectionProducts(collection.products)
                                    }}
                                    variant="mobile"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components for cleaner code ---

function StatCard({ label, value, icon, bg, textColor = 'text-gray-900' }: any) {
    return (
        <div className={`${bg} p-4 rounded-xl border border-transparent hover:border-gray-200 transition-colors`}>
            <div className="flex items-start justify-between mb-2">
                <div className={textColor}>{icon}</div>
                <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
    );
}

function QuoteCard({ quote, userType }: { quote: Quote, userType: any }) {
    const firstItem = quote.items?.[0];
    const itemCount = quote.items?.length || 0;
    const remainingItems = itemCount > 1 ? itemCount - 1 : 0;

    // Only show price if approved/business
    const showPrice = (userType === 'business' || userType === 'verified' || quote.status === 'approved') && quote.estimated_total;

    return (
        <Link
            href={`/quotes/${quote.id}`}
            className="group block bg-white rounded-xl border border-gray-200 hover:border-industrial-blue hover:shadow-md transition-all overflow-hidden"
        >
            <div className="flex flex-row">
                {/* Left: Image Preview */}
                <div className="relative w-32 md:w-48 bg-gray-50 flex-shrink-0 border-r border-gray-100 min-h-[140px] md:min-h-0">
                    {firstItem?.product_thumbnail ? (
                        <Image
                            src={firstItem.product_thumbnail}
                            alt={firstItem.product_name || 'Product'}
                            fill
                            className="object-contain p-2 md:p-4 group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="w-8 h-8" />
                        </div>
                    )}
                    {remainingItems > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                            +{remainingItems} more
                        </div>
                    )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 p-3 md:p-5 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] md:text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {quote.quote_number || '#' + quote.id.substring(0, 8).toUpperCase()}
                                </span>
                                <span className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(quote.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>

                            <h3 className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-industrial-blue transition-colors line-clamp-2 md:line-clamp-1">
                                {firstItem?.product_name || 'Untitled Quote Request'}
                            </h3>

                            <p className="text-xs md:text-sm text-gray-500 mt-1">
                                {itemCount} item{itemCount !== 1 ? 's' : ''} requested
                            </p>
                        </div>

                        <div className="self-start">
                            <QuoteStatusBadge status={quote.status} />
                        </div>
                    </div>

                    <div className="mt-2 md:mt-4 flex items-center justify-between border-t border-gray-50 pt-2 md:pt-4">
                        <div>
                            {showPrice ? (
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Estimated Total</span>
                                    <span className="text-lg font-bold text-industrial-blue">
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(quote.estimated_total!)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic">
                                    Price pending approval
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1 text-sm font-semibold text-industrial-blue group-hover:translate-x-1 transition-transform">
                            View Details <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Helper for mapping collection products safely
function mapCollectionProducts(products: any[]) {
    return products.map((pc: any) => {
        const p = pc.product || pc;
        return {
            id: p.id,
            title: p.name || p.title,
            name: p.name || p.title,
            slug: p.slug,
            handle: p.slug,
            thumbnail: p.thumbnail_url || p.thumbnail,
            price: p.price ? { amount: p.price, currency_code: 'INR' } : undefined,
            compare_at_price: p.compare_at_price,
            variants: p.variants || p.product_variants || [],
            product_variants: p.product_variants || [],
            metadata: p.metadata || {}
        };
    });
}

