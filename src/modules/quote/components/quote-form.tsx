'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Upload, AlertCircle, Loader2, Info, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createQuote } from '@/lib/actions/quotes';
import {
    guestQuoteSchema,
    individualQuoteSchema,
    businessUnverifiedQuoteSchema,
    businessVerifiedQuoteSchema
} from '../forms/quote-schema';
import { QuoteItemsInput } from './quote-items-input';
import { getQuotePermissions } from '../utils/quote-permissions';

interface QuoteFormProps {
    userType?: 'guest' | 'individual' | 'business' | 'verified';
    verificationStatus?: string | null;
}

export function QuoteForm({ userType = 'guest', verificationStatus = null }: QuoteFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const router = useRouter();

    const getSchema = () => {
        switch (userType) {
            case 'individual': return individualQuoteSchema;
            case 'business': return businessUnverifiedQuoteSchema;
            case 'verified': return businessVerifiedQuoteSchema;
            default: return guestQuoteSchema;
        }
    };

    const schema = getSchema();
    const permissions = getQuotePermissions(userType, verificationStatus);

    const { register, control, handleSubmit, formState: { errors } } = useForm<any>({
        resolver: zodResolver(schema),
        defaultValues: userType === 'guest'
            ? { product_id: "", quantity: 1, name: "", email: "", notes: "" }
            : { items: [{ product_id: "", quantity: 1 }], bulk_pricing_requested: false, notes: "" }
    });

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Transform data to match createQuote input format
            const quoteData = userType === 'guest'
                ? {
                    items: [{ product_id: data.product_id, quantity: data.quantity }],
                    account_type: 'guest' as const,
                    notes: data.notes,
                    name: data.name,
                    email: data.email,
                }
                : {
                    items: data.items,
                    account_type: userType === 'verified' ? 'business' as const : userType as 'individual' | 'business',
                    notes: data.notes,
                    bulk_pricing_requested: data.bulk_pricing_requested,
                };

            const result = await createQuote(quoteData);

            if (result.success) {
                // Redirect to success page or quotes list
                if (userType === 'guest') {
                    router.push(`/quotes/success?id=${result.id}`);
                } else {
                    router.push('/quotes');
                }
            } else {
                setSubmitError(result.error || 'Failed to submit quote');
            }
        } catch (error: any) {
            setSubmitError(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {userType === 'guest' ? 'Get a Custom Quote' :
                                userType === 'verified' ? 'Create Bulk Quote' : 'Request New Quote'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {userType === 'guest' ? 'Tell us what you need and we\'ll get back to you within 24 hours.' :
                                'Fill out the details below to receive a formal quotation.'}
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* User Type Specific Prompts */}
                {userType === 'guest' && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900">Want to track your quotes?</p>
                            <p className="text-sm text-blue-700 mt-1">
                                Create an account to view quote history, save drafts, and get faster responses.
                            </p>
                            <Link
                                href="/sign-up"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                )}

                {userType === 'individual' && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-purple-900">Upgrade to Business Account</p>
                            <p className="text-sm text-purple-700 mt-1">
                                Get access to bulk pricing, priority support, credit terms, and exclusive business features.
                            </p>
                            <Link
                                href="/profile?tab=business"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                                Upgrade to Business
                            </Link>
                        </div>
                    </div>
                )}

                {userType === 'business' && verificationStatus !== 'verified' && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-900">Complete Business Verification</p>
                            <p className="text-sm text-orange-700 mt-1">
                                Verify your business to unlock checkout, view pricing, convert quotes to orders, and access credit terms.
                            </p>
                            <Link
                                href="/profile?tab=business"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                            >
                                Complete Verification
                            </Link>
                        </div>
                    </div>
                )}

                {userType === 'verified' && (
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">Verified Business Account</p>
                            <p className="text-sm text-green-700 mt-1">
                                You have access to all premium features including bulk pricing, instant checkout, and credit terms.
                            </p>
                        </div>
                    </div>
                )}

                {/* Items Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Select the products you need</p>
                    </div>
                    <div className="p-6">
                        <QuoteItemsInput
                            control={control}
                            register={register}
                            errors={errors}
                            userType={userType}
                        />
                    </div>
                </div>

                {/* Contact Information (Guest Only) */}
                {userType === 'guest' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                            <p className="text-sm text-gray-600 mt-1">How can we reach you?</p>
                        </div>
                        <div className="p-6 grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register("name")}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                                    placeholder="John Doe"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.name.message as string}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register("email")}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                                    placeholder="john@example.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.email.message as string}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Options */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Additional Details</h2>
                        <p className="text-sm text-gray-600 mt-1">Tell us more about your requirements</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Bulk Pricing Toggle */}
                        {permissions.hasBulkPricing && (
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="bulk_pricing_requested"
                                    {...register("bulk_pricing_requested")}
                                    className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label htmlFor="bulk_pricing_requested" className="flex-1 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-900">Request Bulk Pricing</span>
                                    <p className="text-xs text-gray-600 mt-0.5">Get special rates for large orders</p>
                                </label>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Notes
                            </label>
                            <textarea
                                {...register("notes")}
                                rows={5}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Tell us more about your requirements, specifications, or any special requests..."
                            />
                            <div className="flex justify-between items-center mt-2">
                                {errors.notes && (
                                    <p className="text-red-500 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.notes.message as string}
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 ml-auto">
                                    Max {permissions.notesMaxLength} characters
                                </p>
                            </div>
                        </div>

                        {/* Attachments */}
                        {permissions.maxAttachments > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Attachments (Optional)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer bg-gray-50">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        PDF, JPG, PNG up to 10MB • Max {permissions.maxAttachments} files
                                    </p>
                                    <input type="file" multiple className="hidden" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {submitError && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-900">Submission Failed</p>
                            <p className="text-sm text-red-700 mt-1">{submitError}</p>
                        </div>
                    </div>
                )}

                {/* Submit Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                    {permissions.canSaveDraft && (
                        <button
                            type="button"
                            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all"
                        >
                            Save Draft
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Quote Request'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
