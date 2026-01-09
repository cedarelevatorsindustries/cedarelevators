'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Quote, UserType } from '../types';
import { QuoteStatusBadge } from './quote-status-badge'; // We need to create this
import Image from 'next/image';

interface QuoteListProps {
    userType: UserType | 'verified';
    quotes: Quote[];
    isLoading?: boolean;
}

export function QuoteList({ userType, quotes, isLoading }: QuoteListProps) {
    const isVerified = userType === 'verified' || (userType === 'business' /* && check status */);
    // Simplified prop for now, assuming parent passes refined userType

    if (isLoading) {
        return <div className="p-8 text-center text-neutral-500">Loading quotes...</div>;
    }

    if (quotes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-lg bg-white">
                <div className="relative w-64 h-64 mb-6">
                    <Image
                        src="/empty-states/empty-quotes.png"
                        alt="No quotes found"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No quotes requested yet</h3>
                <p className="text-gray-500 mb-8 text-center max-w-sm">
                    It looks like you haven't requested any quotes. Browse our products and request a quote to get started.
                </p>
                <Link
                    href="/quotes/new"
                    className="bg-cedar-orange text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-none"
                >
                    Request a New Quote
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Unverified Business Banner */}
            {userType === 'business' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-md flex justify-between items-center text-orange-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-semibold">Business Verification Pending</p>
                            <p className="text-sm">Verify your business to unlock checkout and full features.</p>
                        </div>
                    </div>
                    <Link href="/profile" className="text-sm font-medium underline">Verify Now</Link>
                </div>
            )}

            {/* Filters (Verified Only) */}
            {userType === 'verified' && (
                <div className="flex gap-2 pb-2 overflow-x-auto">
                    <button className="px-3 py-1 bg-industrial-blue text-white rounded-full text-sm">All</button>
                    <button className="px-3 py-1 bg-white border border-neutral-300 text-neutral-600 rounded-full text-sm">Approved</button>
                    <button className="px-3 py-1 bg-white border border-neutral-300 text-neutral-600 rounded-full text-sm">Pending</button>
                    <button className="px-3 py-1 bg-white border border-neutral-300 text-neutral-600 rounded-full text-sm">Drafts</button>
                </div>
            )}

            {/* Quote Grid */}
            <div className="grid gap-4">
                {quotes.map((quote) => (
                    <Link
                        key={quote.id}
                        href={`/quotes/${quote.id}`}
                        className="block bg-white p-4 rounded-lg border border-neutral-200 hover:border-cedar-orange transition-colors group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold text-industrial-blue group-hover:text-cedar-orange transition-colors">
                                    Quote #{quote.quote_number || quote.id.substring(0, 8)}
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    {format(new Date(quote.created_at), 'MMM d, yyyy')}
                                </p>
                            </div>
                            {/* We need QuoteStatusBadge component */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                ${quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                {quote.status}
                            </span>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                            <div className="text-sm text-neutral-600">
                                {quote.items?.length || 0} item{(quote.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                            {(userType === 'business' || userType === 'verified') && quote.estimated_total && (
                                <div className="font-semibold text-industrial-blue">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(quote.estimated_total)}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

