'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

    // Select schema based on userType
    const getSchema = () => {
        switch (userType) {
            case 'individual': return individualQuoteSchema;
            case 'business': return businessUnverifiedQuoteSchema; // unverified by default unless specified
            case 'verified': return businessVerifiedQuoteSchema;
            default: return guestQuoteSchema;
        }
    };

    // If 'business' but valid, maybe we should check status? 
    // The prop userType should already be resolved or we use verificationStatus.
    // For simplicity, assuming userType prop is accurate to the Role Variant we want.

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
        console.log("Submitting quote:", data);
        // await createQuoteAction(data);
        setTimeout(() => setIsSubmitting(false), 1000); // Mock
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-sm border border-neutral-200">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-industrial-blue mb-2">
                    {userType === 'guest' ? 'Get a Custom Quote' :
                        userType === 'verified' ? 'Create Bulk Quote' : 'Request New Quote'}
                </h2>
                <p className="text-neutral-500 text-sm">
                    {userType === 'guest' ? 'Tell us what you need and we will get back to you.' :
                        'Fill out the details below to receive a formal quotation.'}
                </p>
            </div>

            {/* Verification Banner */}
            {userType === 'business' && verificationStatus !== 'verified' && (
                <div className="bg-orange-50 border-l-4 border-cedar-orange p-4">
                    <p className="text-sm text-orange-800">
                        <strong>Note:</strong> Your business verification is pending. You can request quotes, but checkout will be disabled until verified.
                    </p>
                </div>
            )}

            {/* Items Input */}
            <QuoteItemsInput
                control={control}
                register={register}
                errors={errors}
                userType={userType}
            />

            {/* Additional Options (Business) */}
            {permissions.hasBulkPricing && (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="bulk_pricing_requested"
                        {...register("bulk_pricing_requested")}
                        className="rounded border-neutral-300 text-cedar-orange focus:ring-cedar-orange"
                    />
                    <label htmlFor="bulk_pricing_requested" className="text-sm font-medium text-neutral-700">Request Bulk Pricing</label>
                </div>
            )}

            {/* Contact Info (Guest Only) */}
            {userType === 'guest' && (
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Name</label>
                        <input
                            type="text"
                            {...register("name")}
                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Email</label>
                        <input
                            type="email"
                            {...register("email")}
                            className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-neutral-700">Additional Notes</label>
                <textarea
                    {...register("notes")}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-cedar-orange focus:ring-cedar-orange"
                    placeholder="Tell us more about your requirements..."
                />
                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message as string}</p>}
                <p className="text-xs text-neutral-400 mt-1 text-right">Max {permissions.notesMaxLength} characters</p>
            </div>

            {/* Attachments (Placeholder) */}
            {permissions.maxAttachments > 0 && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700">Attachments</label>
                    <div className="mt-1 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-cedar-orange transition-colors">
                        <p className="text-sm text-neutral-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-neutral-400 mt-1">Max {permissions.maxAttachments} files (PDF, JPG, PNG)</p>
                        <input type="file" multiple className="hidden" />
                    </div>
                </div>
            )}

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                {permissions.canSaveDraft && (
                    <button
                        type="button"
                        className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Save Draft
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-cedar-orange text-white rounded-md font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </form>
    );
}
