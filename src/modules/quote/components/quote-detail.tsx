'use client';

import React from 'react';
import { format } from 'date-fns';
import { Quote, UserType } from '../types';
import { QuoteStatusBadge } from './quote-status-badge';

interface QuoteDetailProps {
    quote: Quote;
    userType: UserType | 'verified';
}

export function QuoteDetail({ quote, userType }: QuoteDetailProps) {
    const isVerified = userType === 'verified' || (userType === 'business' /* verify status */);
    const canSeePricing = userType === 'business' || userType === 'verified';
    const canCheckout = isVerified && quote.status === 'approved';

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-industrial-blue mb-1">
                        Quote #{quote.quote_number || quote.id.substring(0, 8)}
                    </h1>
                    <p className="text-neutral-500 text-sm">
                        Requested on {format(new Date(quote.created_at), 'MMMM d, yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <QuoteStatusBadge status={quote.status} className="text-sm px-3 py-1" />
                    {canCheckout && (
                        <button className="bg-cedar-orange text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600 transition-colors">
                            Convert to Order
                        </button>
                    )}
                </div>
            </div>

            {/* Verification Banner */}
            {userType === 'business' && !isVerified && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                    <div className="text-xl">🔒</div>
                    <div>
                        <h3 className="font-semibold text-orange-900">Verification Required</h3>
                        <p className="text-orange-800 text-sm mt-1">
                            You can view your quote pricing, but you need to complete business verification to place an order.
                        </p>
                        <button className="mt-2 text-sm font-medium underline text-orange-900">
                            Complete Verification
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Response */}
            {quote.admin_response && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Message from Admin</h3>
                    <p className="text-blue-800 whitespace-pre-wrap">{quote.admin_response.response_note}</p>
                    <p className="text-xs text-blue-600 mt-4">
                        Responded on {format(new Date(quote.admin_response.responded_at), 'MMM d, yyyy')}
                    </p>
                </div>
            )}

            {/* Items Table */}
            <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                    <h3 className="font-semibold text-neutral-700">Quote Items</h3>
                    <span className="text-sm text-neutral-500">{quote.items?.length || 0} items</span>
                </div>
                <table className="w-full">
                    <thead className="bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 text-center">Quantity</th>
                            {canSeePricing && <th className="px-6 py-3 text-right">Unit Price</th>}
                            {canSeePricing && <th className="px-6 py-3 text-right">Total</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {quote.items?.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-neutral-900">{item.product_name || 'Product Name'}</div>
                                    <div className="text-sm text-neutral-500">Variant info</div>
                                </td>
                                <td className="px-6 py-4 text-center text-neutral-600">
                                    {item.quantity}
                                </td>
                                {canSeePricing && (
                                    <td className="px-6 py-4 text-right tabular-nums text-neutral-600">
                                        {item.unit_price ?
                                            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.unit_price) :
                                            '-'}
                                    </td>
                                )}
                                {canSeePricing && (
                                    <td className="px-6 py-4 text-right tabular-nums font-medium text-neutral-900">
                                        {item.unit_price ?
                                            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.unit_price * item.quantity) :
                                            '-'}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    {canSeePricing && quote.estimated_total && (
                        <tfoot className="bg-neutral-50">
                            <tr>
                                <td colSpan={2}></td>
                                <td className="px-6 py-4 text-right font-semibold text-neutral-700">Estimated Total</td>
                                <td className="px-6 py-4 text-right font-bold text-industrial-blue text-lg">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(quote.estimated_total)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* Notes & Attachments */}
            {quote.notes && (
                <div className="bg-white p-6 rounded-lg border border-neutral-200">
                    <h3 className="font-semibold text-neutral-700 mb-2">Your Notes</h3>
                    <p className="text-neutral-600 whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}
        </div>
    );
}
