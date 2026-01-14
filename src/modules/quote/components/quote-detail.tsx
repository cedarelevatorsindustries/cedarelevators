'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Quote, UserType } from '../types';
import { QuoteStatusBadge } from './quote-status-badge';
import { Package, Download, BadgeCheck, Mail, ArrowRight, Check, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { convertQuoteToOrder } from '@/lib/actions/quotes';
import { toast } from 'sonner';

interface QuoteDetailProps {
    quote: Quote;
    userType: UserType | 'verified' | 'guest';
}

/**
 * QuoteDetail Component - Role-Based Visibility
 * 
 * Visibility Matrix:
 * | Section          | Guest | Individual | Business (Unverified) | Business (Verified) |
 * |------------------|-------|------------|----------------------|---------------------|
 * | Header           | ✅    | ✅          | ✅                    | ✅                   |
 * | Requester Info   | ❌    | ❌          | ❌                    | ❌                   |
 * | Quote Items      | ✅    | ✅          | ✅                    | ✅                   |
 * | Pricing          | ❌    | ❌          | ✅                    | ✅                   |
 * | Notes/Attachments| ✅    | ✅          | ✅                    | ✅                   |
 * | Actions          | ❌    | ❌          | ⚠️ Verify CTA only   | ✅ Convert          |
 */
export function QuoteDetail({ quote, userType }: QuoteDetailProps) {
    const router = useRouter();
    const [isConverting, setIsConverting] = useState(false);

    // Role-based visibility flags
    const isGuest = userType === 'guest';
    const isIndividual = userType === 'individual';
    const isBusiness = userType === 'business';
    const isVerified = userType === 'verified';

    // What each role can see
    const canSeePricing = isVerified; // Only verified business users can see pricing
    const canConvert = isVerified && quote.status === 'approved';
    const showVerifyCTA = isBusiness && !isVerified && quote.status === 'approved';
    const showBusinessUpgrade = isIndividual && quote.status === 'approved';

    // Admin response (visible to all users except guest)
    const adminResponse = (quote as any).admin_response_message || quote.admin_response?.response_note;

    // Handle quote to cart conversion
    const handleConvertToCart = async () => {
        setIsConverting(true);
        try {
            const result = await convertQuoteToOrder(quote.id);
            if (result.success) {
                toast.success('Quote items added to cart!');
                router.push('/cart');
            } else {
                toast.error(result.error || 'Failed to convert quote');
                setIsConverting(false);
            }
        } catch (error) {
            toast.error('An error occurred');
            setIsConverting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* === SECTION 1: HEADER (All users) === */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Quote #{quote.quote_number || quote.id.substring(0, 8)}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Requested on {format(new Date(quote.created_at), 'MMMM d, yyyy')}
                    </p>
                    {quote.valid_until && quote.status === 'approved' && (
                        <p className="text-amber-600 text-sm mt-1">
                            Valid until {format(new Date(quote.valid_until), 'MMMM d, yyyy')}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <QuoteStatusBadge status={quote.status} className="text-sm px-3 py-1.5" />
                    {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <BadgeCheck className="w-3 h-3" />
                            Verified
                        </span>
                    )}
                </div>
            </div>

            {/* === STATUS TIMELINE === */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-6">Quote Timeline</h3>
                <div className="space-y-4">
                    {/* Submitted */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                        </div>
                        <div className="pb-8 flex-1">
                            <p className="font-medium text-gray-900">Quote Submitted</p>
                            <p className="text-sm text-gray-500">
                                {format(new Date(quote.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                        </div>
                    </div>

                    {/* Pending/Awaiting Review */}
                    {(quote.status === 'pending' || quote.status === 'submitted') && !quote.approved_at && !quote.rejected_at && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Awaiting Review</p>
                                <p className="text-sm text-gray-500">
                                    We'll review your quote and get back to you soon
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Approved */}
                    {(quote.approved_at || quote.status === 'approved') && (
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                {quote.converted_at && <div className="w-0.5 flex-1 bg-gray-200 mt-2" />}
                            </div>
                            <div className={`flex-1 ${quote.converted_at ? 'pb-8' : ''}`}>
                                <p className="font-medium text-gray-900">Quote Approved</p>
                                <p className="text-sm text-gray-500">
                                    {quote.approved_at ? format(new Date(quote.approved_at), 'MMM d, yyyy h:mm a') : 'Approved'}
                                </p>
                                {quote.valid_until && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Valid until {format(new Date(quote.valid_until), 'MMM d, yyyy')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rejected */}
                    {(quote.rejected_at || quote.status === 'rejected') && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Quote Rejected</p>
                                <p className="text-sm text-gray-500">
                                    {quote.rejected_at ? format(new Date(quote.rejected_at), 'MMM d, yyyy h:mm a') : 'Rejected'}
                                </p>
                                {quote.rejected_reason && (
                                    <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                                        {quote.rejected_reason}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Converted to Order */}
                    {quote.converted_at && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Converted to Order</p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(quote.converted_at), 'MMM d, yyyy h:mm a')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* === ACTIONS SECTION (Role-specific) === */}

            {/* Guest: Contact info message */}
            {isGuest && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="text-blue-800">
                            Thank you for your quote request. We'll contact you via email with pricing details.
                        </p>
                    </div>
                </div>
            )}

            {/* Individual: Show checkout button if approved, else show upgrade prompt */}
            {isIndividual && quote.status === 'approved' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-emerald-900">Quote Approved! Ready to Order</h3>
                        <p className="text-emerald-800 text-sm mt-1">
                            Your quote has been approved. You can now proceed to checkout.
                        </p>
                    </div>
                    <button
                        onClick={handleConvertToCart}
                        disabled={isConverting}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConverting ? 'Adding to cart...' : 'Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Individual: Show upgrade prompt only if NOT approved */}
            {isIndividual && quote.status !== 'approved' && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-1">Want to see pricing and place orders?</h3>
                    <p className="text-purple-800 text-sm mb-3">
                        Register as a business to view pricing and convert quotes to orders.
                    </p>
                    <Link
                        href="/profile/upgrade"
                        className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-900"
                    >
                        Upgrade to Business Account <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {/* Business (Unverified): Verification CTA */}
            {showVerifyCTA && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex items-start gap-3">
                    <div className="text-xl">🔒</div>
                    <div>
                        <h3 className="font-semibold text-orange-900">Verify to Place Order</h3>
                        <p className="text-orange-800 text-sm mt-1">
                            Your quote is approved! Complete business verification to convert this quote to an order.
                        </p>
                        <Link
                            href="/profile/verification"
                            className="mt-3 inline-flex items-center gap-1 bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                            Complete Verification <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Verified: Convert to Order button */}
            {canConvert && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-emerald-900">Ready to Order</h3>
                        <p className="text-emerald-800 text-sm mt-1">
                            Your quote has been approved. You can now convert it to an order.
                        </p>
                    </div>
                    <button
                        onClick={handleConvertToCart}
                        disabled={isConverting}
                        className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConverting ? 'Adding to cart...' : 'Convert to Order'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* === ADMIN RESPONSE (All logged-in users) === */}
            {adminResponse && !isGuest && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Response from Cedar Team</h3>
                    <p className="text-blue-800 whitespace-pre-wrap">{adminResponse}</p>
                    {quote.admin_response?.responded_at && (
                        <p className="text-xs text-blue-600 mt-4">
                            {format(new Date(quote.admin_response.responded_at), 'MMM d, yyyy')}
                        </p>
                    )}

                    {/* Convert to Order Button - Show after admin approves */}
                    {canConvert && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold text-blue-900">Ready to Place Order</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Your quote has been approved. Convert it to an order now.
                                    </p>
                                </div>
                                <button
                                    onClick={handleConvertToCart}
                                    disabled={isConverting}
                                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isConverting ? 'Adding to cart...' : 'Convert to Order'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === SECTION 3: QUOTE ITEMS (All users) === */}
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Requested Items
                    </h3>
                    <span className="text-sm text-gray-500">{quote.items?.length || 0} items</span>
                </div>
                <table className="w-full">
                    <thead className="bg-neutral-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 text-center">Quantity</th>
                            {/* Pricing columns only for business/verified */}
                            {canSeePricing && <th className="px-6 py-3 text-right">Unit Price</th>}
                            {canSeePricing && <th className="px-6 py-3 text-right">Total</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                        {quote.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                            {item.product_thumbnail ? (
                                                <img src={item.product_thumbnail} alt="" className="w-full h-full object-cover rounded" />
                                            ) : (
                                                <Package className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.product_name || 'Product'}</div>
                                            {item.product_sku && (
                                                <div className="text-xs text-gray-500">SKU: {item.product_sku}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600 font-medium">
                                    {item.quantity}
                                </td>
                                {canSeePricing && (
                                    <td className="px-6 py-4 text-right tabular-nums text-gray-600">
                                        {item.unit_price
                                            ? `₹${item.unit_price.toLocaleString()}`
                                            : '—'}
                                    </td>
                                )}
                                {canSeePricing && (
                                    <td className="px-6 py-4 text-right tabular-nums font-medium text-gray-900">
                                        {item.unit_price
                                            ? `₹${(item.unit_price * item.quantity).toLocaleString()}`
                                            : '—'}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    {/* === SECTION 4: PRICING (Only business/verified) === */}
                    {canSeePricing && (quote.estimated_total ?? 0) > 0 && (
                        <tfoot className="bg-neutral-50">
                            <tr>
                                <td colSpan={2}></td>
                                <td className="px-6 py-4 text-right font-semibold text-gray-700">Estimated Total</td>
                                <td className="px-6 py-4 text-right font-bold text-orange-600 text-lg">
                                    ₹{(quote.estimated_total ?? 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* === SECTION 5: NOTES & ATTACHMENTS (All users) === */}
            {quote.notes && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <h3 className="font-semibold text-gray-700 mb-2">Your Notes</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                </div>
            )}

            {quote.attachments && quote.attachments.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <h3 className="font-semibold text-gray-700 mb-3">Attachments</h3>
                    <div className="space-y-2">
                        {quote.attachments.map((attachment: any) => (
                            <a
                                key={attachment.id}
                                href={attachment.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <Download className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{attachment.file_name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Converted Order Link */}
            {quote.converted_order_id && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-emerald-900">Order Created</h3>
                        <p className="text-emerald-800 text-sm mt-1">
                            This quote has been converted to an order.
                        </p>
                    </div>
                    <Link
                        href={`/orders/${quote.converted_order_id}`}
                        className="text-emerald-700 hover:text-emerald-900 font-medium text-sm flex items-center gap-1"
                    >
                        View Order <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}
