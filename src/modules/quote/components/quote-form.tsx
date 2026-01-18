'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Upload, AlertCircle, Loader2, Info, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createQuote } from '@/lib/actions/quotes';
import {
    guestQuoteSchema,
    individualQuoteSchema,
    businessUnverifiedQuoteSchema,
    businessVerifiedQuoteSchema
} from '../forms/quote-schema';
import { QuoteItemsInput } from './quote-items-input';
import { getQuotePermissions } from '../utils/quote-permissions';
import { FileUpload } from '@/components/common/file-upload';
import { UserTierBadge } from './user-tier-badge';
import { VerificationAlert, VerifiedBadge } from './verification-alert';
import { UpgradeNudge } from './upgrade-nudge';
import { z } from 'zod';
import SuccessAnimation from '@/modules/checkout/components/success-animation';
import { toast } from 'sonner'; // Assuming toast is from sonner

interface QuoteFormProps {
    userType?: 'guest' | 'individual' | 'business' | 'verified';
    verificationStatus?: string | null;
    prefilledProduct?: {
        id: string;
        name: string;
        price?: number;
        quantity?: number;
    } | null;
    userProfile?: {
        name?: string;
        email?: string;
        phone?: string;
    } | null;
}

interface UploadedFile {
    name: string;
    url: string;
    size: number;
    publicId?: string;
}

type QuoteFormData = z.infer<typeof guestQuoteSchema> | z.infer<typeof individualQuoteSchema> | z.infer<typeof businessUnverifiedQuoteSchema> | z.infer<typeof businessVerifiedQuoteSchema>;

export function QuoteForm({ userType = 'guest', verificationStatus = null, prefilledProduct = null, userProfile = null }: QuoteFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null); // This will be replaced by toast
    const [attachments, setAttachments] = useState<UploadedFile[]>([]);
    const router = useRouter();

    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [successData, setSuccessData] = useState<{ id: string; quoteNumber: string } | null>(null);

    const getSchema = () => {
        switch (userType) {
            case 'individual': return individualQuoteSchema;
            case 'business': return businessUnverifiedQuoteSchema;
            case 'verified': return businessVerifiedQuoteSchema;
            default: return guestQuoteSchema;
        }
    };

    const quoteSchema = getSchema(); // Renamed to avoid conflict with 'schema' in useForm
    const permissions = getQuotePermissions(userType, verificationStatus);

    const form = useForm<any>({
        resolver: zodResolver(quoteSchema),
        defaultValues: userType === 'guest'
            ? {
                product_id: prefilledProduct?.id || "",
                variant_id: (prefilledProduct as any)?.variantId || "",
                quantity: prefilledProduct?.quantity || 1,
                name: "",
                email: "",
                phone: "",
                notes: ""
            }
            : {
                items: [{
                    product_id: prefilledProduct?.id || "",
                    variant_id: (prefilledProduct as any)?.variantId || "",
                    quantity: prefilledProduct?.quantity || 1
                }],
                bulk_pricing_requested: false,
                notes: "",
                // Pre-fill contact info from user profile for logged-in users
                name: userProfile?.name || "",
                email: userProfile?.email || "",
                phone: userProfile?.phone || ""
            }
    });

    const { register, control, handleSubmit, setValue, setError, clearErrors, watch, formState: { errors } } = form;

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setSubmitError(null); // This will be replaced by toast

        try {
            // Transform data to match createQuote input format
            const quoteData = userType === 'guest'
                ? {
                    items: [{ product_id: data.product_id, quantity: data.quantity, variant_id: data.variant_id }],
                    account_type: 'guest' as const,
                    notes: data.notes,
                    name: data.name,
                    email: data.email,
                    attachments: attachments.map(file => ({
                        file_name: file.name,
                        file_url: file.url,
                        file_size: file.size
                    }))
                }
                : {
                    items: data.items,
                    account_type: userType === 'verified' ? 'business' as const : userType as 'individual' | 'business',
                    notes: data.notes,
                    bulk_pricing_requested: data.bulk_pricing_requested,
                    // Include contact info for logged-in users
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    attachments: attachments.map(file => ({
                        file_name: file.name,
                        file_url: file.url,
                        file_size: file.size
                    }))
                };

            const result = await createQuote(quoteData);

            if (result.success) {
                setSuccessData({
                    id: result.id,
                    quoteNumber: result.quote_number || result.id
                });
                setShowSuccessAnimation(true);
            } else {
                toast.error(result.error || 'Failed to submit quote request');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnimationComplete = () => {
        if (!successData) return;

        // All users go to quote success/confirmation page
        router.push(`/quotes/success?quoteId=${successData.id}&quoteNumber=${encodeURIComponent(successData.quoteNumber)}`);
    };

    if (showSuccessAnimation) {
        return (
            <SuccessAnimation onAnimationComplete={handleAnimationComplete}>
                {/* We render nothing here as the redirect happens immediately after animation */}
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-500 animate-pulse">Redirecting...</p>
                </div>
            </SuccessAnimation>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {userType === 'guest' ? 'Get a Custom Quote' :
                                userType === 'verified' ? 'Create Bulk Quote' : 'Request New Quote'}
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            {userType === 'guest' ? 'Tell us what you need and we\'ll get back to you within 24 hours.' :
                                'Fill out the details below to receive a formal quotation.'}
                        </p>
                    </div>
                    {userType !== 'guest' && (
                        <UserTierBadge
                            userType={userType}
                            verificationStatus={verificationStatus}
                        />
                    )}
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Tier-Specific Alerts & Nudges */}
                {userType === 'verified' && <VerifiedBadge />}

                {userType === 'business' && (
                    <VerificationAlert verificationStatus={verificationStatus} />
                )}

                {userType === 'guest' && (
                    <UpgradeNudge currentTier="guest" variant="banner" />
                )}

                {userType === 'individual' && (
                    <UpgradeNudge currentTier="individual" variant="banner" dismissible />
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
                            prefilledProduct={prefilledProduct}
                            setValue={setValue}
                            setError={setError}
                            clearErrors={clearErrors}
                            watch={watch}
                            verificationStatus={verificationStatus}
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

                {/* Contact Information (Logged-in Users) */}
                {userType !== 'guest' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                            <p className="text-sm text-gray-600 mt-1">Your profile information (editable if needed)</p>
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
                                    placeholder="Your name"
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
                                    placeholder="your@email.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.email.message as string}
                                    </p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                                    placeholder="+91 1234567890"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.phone.message as string}
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
                                <FileUpload
                                    maxFiles={permissions.maxAttachments}
                                    maxSizeBytes={10 * 1024 * 1024}
                                    acceptedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
                                    onFilesChange={setAttachments}
                                    value={attachments}
                                />
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
