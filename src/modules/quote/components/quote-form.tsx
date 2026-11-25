'use client'

import React, { useState, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, Shield, Building2, Package, MessageSquareText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { unifiedQuoteSchema, type UnifiedQuoteValues } from '../forms/quote-schema'
import { QuoteItemsInput, type InitialQuoteItemMeta } from './quote-items-input'
import SuccessAnimation from '@/modules/checkout/components/success-animation'
import { toast } from 'sonner'

export type PrefilledQuoteItem = InitialQuoteItemMeta

interface QuoteFormProps {
  initialItems?: PrefilledQuoteItem[]
  fromQuoteList?: boolean
}

function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `idem_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function QuoteForm({ initialItems = [], fromQuoteList = false }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const router = useRouter()

  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey())
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [successData, setSuccessData] = useState<{
    id: string
    quoteNumber: string
    itemsCount: number
    requestType: string
  } | null>(null)

  const form = useForm<UnifiedQuoteValues>({
    resolver: zodResolver(unifiedQuoteSchema) as any,
    defaultValues: {
      items:
        initialItems.length > 0
          ? initialItems.map((i) => ({
              product_id: i.product_id,
              variant_id: i.variant_id || '',
              quantity: i.quantity || 1,
            }))
          : [],
      name: '',
      email: '',
      phone: '',
      company_name: '',
      gst_number: '',
      project_name: '',
      project_location: '',
      notes: '',
      hp_website: '',
      idempotency_key: idempotencyKeyRef.current,
    },
  })

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const watchedItems = watch('items') || []

  const distinctProductCount = useMemo(() => {
    const ids = new Set(
      watchedItems
        .map((i: any) => (typeof i?.product_id === 'string' ? i.product_id.trim() : ''))
        .filter(Boolean)
    )
    return ids.size
  }, [watchedItems])

  const requestMode: 'general' | 'single' | 'bulk' =
    distinctProductCount >= 2 ? 'bulk' : distinctProductCount === 1 ? 'single' : 'general'

  const isCompanyRequired = requestMode === 'bulk'

  const onSubmit = async (data: UnifiedQuoteValues) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const validItems = (data.items || [])
        .filter((item) => item && typeof item.product_id === 'string' && item.product_id.trim() !== '')
        .map((item) => ({
          product_id: item.product_id.trim(),
          variant_id: item.variant_id && item.variant_id.trim() !== '' ? item.variant_id.trim() : null,
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))

      const payload = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        company_name: data.company_name?.trim() || '',
        gst_number: data.gst_number?.trim() ? data.gst_number.trim().toUpperCase() : '',
        project_name: data.project_name?.trim() || '',
        project_location: data.project_location?.trim() || '',
        notes: data.notes?.trim() || '',
        items: validItems,
        hp_website: data.hp_website || '',
        idempotency_key: idempotencyKeyRef.current,
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Generate a fresh key on validation/server error so corrected resubmission succeeds cleanly
        idempotencyKeyRef.current = generateIdempotencyKey()
        const errorMsg =
          result.error ||
          (result.details ? Object.values(result.details).flat().join(', ') : null) ||
          'Failed to submit quotation request'
        setSubmitError(errorMsg)
        toast.error(errorMsg)
        return
      }

      setSuccessData({
        id: result.quoteId,
        quoteNumber: result.quoteNumber || result.quoteId,
        itemsCount: typeof result.itemsCount === 'number' ? result.itemsCount : validItems.length,
        requestType: result.requestType || requestMode,
      })
      setShowSuccessAnimation(true)
    } catch (error: any) {
      const msg = error?.message || 'Network error while submitting quotation. Please retry.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAnimationComplete = () => {
    if (!successData) return
    router.push(
      `/quotes/success?quoteId=${encodeURIComponent(successData.id)}&quoteNumber=${encodeURIComponent(
        successData.quoteNumber
      )}&itemsCount=${successData.itemsCount}&requestType=${encodeURIComponent(successData.requestType)}`
    )
  }

  if (showSuccessAnimation) {
    return (
      <SuccessAnimation onAnimationComplete={handleAnimationComplete}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">Preparing confirmation...</p>
        </div>
      </SuccessAnimation>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Request a Quotation</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Submit a general enquiry, single-component quote, or multi-product commercial request — no account required.
          </p>
        </div>
        <Link
          href="/quotes/track"
          className="text-sm font-medium text-orange-600 hover:text-orange-700 underline underline-offset-4 whitespace-nowrap"
        >
          Already requested a quote? Track status →
        </Link>
      </div>

      {/* Mode Indicator & Reassurance Banner */}
      <div className="mb-6 bg-orange-50/70 border border-orange-200/80 rounded-xl p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 mt-0.5">
          {requestMode === 'bulk' ? (
            <Building2 className="w-5 h-5" />
          ) : requestMode === 'single' ? (
            <Package className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-700 space-y-1">
          <p className="font-semibold text-gray-900">
            {requestMode === 'bulk'
              ? `Bulk Multi-Product Quotation (${distinctProductCount} distinct components)`
              : requestMode === 'single'
                ? 'Single-Product Commercial Quotation'
                : 'General Elevator / Project Enquiry'}
          </p>
          <p>
            {requestMode === 'bulk'
              ? 'Company or organization name is required for multi-product bulk quotations. GST number remains optional.'
              : 'No login required. Submit your contact details and our engineering sales desk will respond with formal pricing.'}
          </p>
          {fromQuoteList && initialItems.length > 0 && (
            <p className="text-orange-700 font-medium">
              Loaded {initialItems.length} {initialItems.length === 1 ? 'item' : 'items'} from your Quote List.
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Product Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Review selected items, adjust quantities, or add components
            </p>
          </div>
          <div className="p-6">
            <QuoteItemsInput
              control={control}
              register={register}
              errors={errors}
              initialItems={initialItems}
              setValue={setValue}
              watch={watch}
            />
          </div>
        </div>

        {/* 2. Contact & Company Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Contact &amp; Company Details</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Where should we send your quotation PDF and updates?
            </p>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-5">
            {/* Hidden Honeypot */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="hp_website">Website</label>
              <input id="hp_website" type="text" {...register('hp_website')} tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                placeholder="e.g. Rajesh Kumar"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                placeholder="rajesh@company.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                placeholder="+91 98765 43210"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Company / Organization{' '}
                {isCompanyRequired ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400 font-normal">(Optional)</span>
                )}
              </label>
              <input
                type="text"
                {...register('company_name')}
                className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  errors.company_name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. Apex Elevators Pvt Ltd"
              />
              {errors.company_name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.company_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                GST Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                {...register('gst_number')}
                maxLength={15}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none uppercase font-mono text-sm"
                placeholder="33ABCDE1234F1Z5"
              />
              {errors.gst_number && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.gst_number.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                {...register('project_name')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                placeholder="e.g. Green Park Tower Modernization"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project Location / City <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                {...register('project_location')}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                placeholder="e.g. Chennai, Tamil Nadu"
              />
            </div>
          </div>
        </div>

        {/* 3. Requirements & Notes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 rounded-t-xl flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Additional Requirements</h2>
            </div>
          </div>
          <div className="p-6">
            <textarea
              {...register('notes')}
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              placeholder="Share shaft specifications, floor count, voltage/speed requirements, delivery timeline, or general questions..."
            />
            {errors.notes && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Unable to Submit Request</p>
              <p className="text-sm text-red-700 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-500">
            By submitting, you will receive a confirmation email with a secure link to track this quotation.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Quote Request'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
