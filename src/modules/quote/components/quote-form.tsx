'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { unifiedQuoteSchema, type UnifiedQuoteValues } from '../forms/quote-schema'
import { QuoteItemsInput, type InitialQuoteItemMeta } from './quote-items-input'
import { QuotationPageShell, QuotationPageHeader } from './shared/quotation-page-shell'
import { QuotationSection } from './shared/quotation-section'
import { saveLastQuoteSuccess } from './shared/quote-confirmation-storage'

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

  const form = useForm<UnifiedQuoteValues>({
    resolver: zodResolver(unifiedQuoteSchema) as any,
    shouldFocusError: true,
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
    setError,
    clearErrors,
    setFocus,
    watch,
    formState: { errors },
  } = form

  const watchedItems = watch('items') || []
  const watchedNotes = watch('notes') || ''

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

  // Clear stale company validation error immediately if items drop below 2 distinct products
  useEffect(() => {
    if (!isCompanyRequired && errors.company_name) {
      clearErrors('company_name')
    }
  }, [isCompanyRequired, errors.company_name, clearErrors])

  const onInvalidSubmit = (fieldErrors: FieldErrors<UnifiedQuoteValues>) => {
    const firstKey = Object.keys(fieldErrors)[0] as keyof UnifiedQuoteValues | undefined
    if (firstKey && firstKey !== 'items') {
      try {
        setFocus(firstKey)
      } catch {
        // Ignore if non-focusable
      }
    }
  }

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

      const controller = new AbortController()
      const timeoutHandle = setTimeout(() => controller.abort(), 25000)

      let response: Response
      try {
        response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutHandle)
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        idempotencyKeyRef.current = generateIdempotencyKey()
        const unexpectedMsg =
          response.status >= 500
            ? 'Our quotation server encountered a temporary error. Please retry in a moment.'
            : `Unexpected server response (HTTP ${response.status}). Please retry.`
        setSubmitError(unexpectedMsg)
        toast.error(unexpectedMsg)
        return
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        idempotencyKeyRef.current = generateIdempotencyKey()

        // Map returned field validation errors back to inline inputs cleanly
        if (result.details && typeof result.details === 'object') {
          const entries = Object.entries(result.details)
          for (const [field, messages] of entries) {
            const firstMsg = Array.isArray(messages) ? messages[0] : String(messages)
            if (firstMsg && field in payload) {
              setError(field as keyof UnifiedQuoteValues, { message: firstMsg })
            }
          }
          const firstField = entries[0]?.[0] as keyof UnifiedQuoteValues | undefined
          if (firstField && firstField !== 'items') {
            try {
              setFocus(firstField)
            } catch {
              // Ignore focus failures
            }
          }
        }

        const safeErrorMsg =
          result.error || 'Please check the highlighted details and submit again.'
        setSubmitError(safeErrorMsg)
        toast.error(safeErrorMsg)
        return
      }

      const quoteNumber = result.quoteNumber || result.quoteId
      const resolvedItemsCount =
        typeof result.itemsCount === 'number' ? result.itemsCount : validItems.length
      const resolvedRequestType = (result.requestType || requestMode) as
        | 'general'
        | 'single'
        | 'bulk'
      const emailStatus = result.emailStatus === 'failed' ? 'failed' : 'sent'
      const submittedAt = result.submittedAt || new Date().toISOString()

      saveLastQuoteSuccess({
        quoteNumber,
        itemsCount: resolvedItemsCount,
        requestType: resolvedRequestType,
        customerEmail: payload.email,
        customerName: payload.name,
        companyName: payload.company_name || null,
        submittedAt,
        emailStatus,
      })

      router.push(
        `/quotes/success?quoteNumber=${encodeURIComponent(
          quoteNumber
        )}&itemsCount=${resolvedItemsCount}&requestType=${encodeURIComponent(
          resolvedRequestType
        )}&emailStatus=${emailStatus}`
      )
    } catch (err: any) {
      const msg =
        err?.name === 'AbortError'
          ? 'Request timed out while waiting for the server. Your details are preserved — please retry.'
          : 'Network connectivity problem — unable to reach the server. Your details are preserved — please retry.'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const productSectionSummary =
    distinctProductCount === 0
      ? 'General Enquiry'
      : distinctProductCount === 1
        ? '1 Product'
        : `${distinctProductCount} Products`

  return (
    <QuotationPageShell>
      <QuotationPageHeader
        eyebrow="Cedar Quotation Desk"
        title="Request a Quotation"
        description="Tell us what you need and our team will prepare a formal quotation."
        actions={
          <Link
            href="/quotes/track"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span>Track Existing Quotes</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        }
        reassurance={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200/80 bg-white px-4 py-2.5 text-xs sm:text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 text-gray-800">
              <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span>No registration required</span>
            </span>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <span>
              Submit specific products or leave items empty for a general elevator project enquiry.
            </span>
            {fromQuoteList && initialItems.length > 0 && (
              <>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <span className="text-orange-700">
                  Loaded {initialItems.length}{' '}
                  {initialItems.length === 1 ? 'item' : 'items'} from Quote List
                </span>
              </>
            )}
          </div>
        }
      />

      <form
        id="cedar-quote-form"
        onSubmit={handleSubmit(onSubmit, onInvalidSubmit)}
        noValidate
        className="space-y-6"
      >
        {/* Hidden Honeypot */}
        <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
          <label htmlFor="hp_website">Website</label>
          <input
            id="hp_website"
            type="text"
            {...register('hp_website')}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Section 1: Products */}
        <QuotationSection
          stepNumber="01"
          title="Products"
          description="Optional — add components from our catalog or proceed directly to a general enquiry."
          rightSlot={
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
              {productSectionSummary}
            </span>
          }
        >
          <QuoteItemsInput
            control={control}
            errors={errors}
            initialItems={initialItems}
            setValue={setValue}
            watch={watch}
          />
        </QuotationSection>

        {/* Section 2: Your Information */}
        <QuotationSection
          stepNumber="02"
          title="Your Information"
          description="We will send confirmation and quotation updates to this contact email."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="quote-name" className="block text-sm text-gray-800 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-name"
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'quote-name-error' : undefined}
                {...register('name')}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. Rajesh Kumar"
              />
              {errors.name && (
                <p id="quote-name-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="quote-phone" className="block text-sm text-gray-800 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'quote-phone-error' : 'quote-phone-hint'}
                {...register('phone')}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                  errors.phone ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="+91 98765 43210"
              />
              {errors.phone ? (
                <p id="quote-phone-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone.message}</span>
                </p>
              ) : (
                <p id="quote-phone-hint" className="text-xs text-gray-500 mt-1">
                  Include country code (e.g. +91 for India or international).
                </p>
              )}
            </div>

            <div>
              <label htmlFor="quote-email" className="block text-sm text-gray-800 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="quote-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'quote-email-error' : undefined}
                {...register('email')}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                  errors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p id="quote-email-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="quote-company" className="block text-sm text-gray-800 mb-1.5">
                Company / Organization{' '}
                {isCompanyRequired ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400 text-xs">(Optional)</span>
                )}
              </label>
              <input
                id="quote-company"
                type="text"
                autoComplete="organization"
                aria-required={isCompanyRequired}
                aria-invalid={Boolean(errors.company_name)}
                aria-describedby={
                  errors.company_name
                    ? 'quote-company-error'
                    : isCompanyRequired
                      ? 'quote-company-hint'
                      : undefined
                }
                {...register('company_name')}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                  errors.company_name ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. Apex Elevators Pvt Ltd"
              />
              {errors.company_name ? (
                <p id="quote-company-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.company_name.message}</span>
                </p>
              ) : isCompanyRequired ? (
                <p id="quote-company-hint" className="text-xs text-orange-700 mt-1">
                  Required when requesting 2 or more products.
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="quote-gstin" className="block text-sm text-gray-800 mb-1.5">
                GSTIN <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                id="quote-gstin"
                type="text"
                maxLength={15}
                aria-invalid={Boolean(errors.gst_number)}
                aria-describedby={errors.gst_number ? 'quote-gstin-error' : 'quote-gstin-hint'}
                {...register('gst_number')}
                className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 uppercase font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors ${
                  errors.gst_number ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="33ABCDE1234F1Z5"
              />
              {errors.gst_number ? (
                <p id="quote-gstin-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.gst_number.message}</span>
                </p>
              ) : (
                <p id="quote-gstin-hint" className="text-xs text-gray-500 mt-1">
                  Optional 15-character tax registration number.
                </p>
              )}
            </div>
          </div>
        </QuotationSection>

        {/* Section 3: Project Information */}
        <QuotationSection
          stepNumber="03"
          title="Project Information"
          description="Optional project context helps us tailor technical compatibility and dispatch details."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="quote-project-name" className="block text-sm text-gray-800 mb-1.5">
                Project Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                id="quote-project-name"
                type="text"
                {...register('project_name')}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors"
                placeholder="e.g. Green Park Tower Modernization"
              />
            </div>

            <div>
              <label htmlFor="quote-project-location" className="block text-sm text-gray-800 mb-1.5">
                Project Location <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                id="quote-project-location"
                type="text"
                {...register('project_location')}
                className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-colors"
                placeholder="e.g. Chennai, Tamil Nadu"
              />
            </div>
          </div>
        </QuotationSection>

        {/* Section 4: Additional Requirements */}
        <QuotationSection
          stepNumber="04"
          title="Additional Requirements"
          description="Share technical parameters, floor count, shaft dimensions, delivery schedule, or any questions."
          rightSlot={
            <span className="text-xs text-gray-500 tabular-nums">
              {watchedNotes.length} / 1,000
            </span>
          }
        >
          <textarea
            id="quote-notes"
            aria-label="Additional Notes"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'quote-notes-error' : undefined}
            {...register('notes')}
            rows={4}
            maxLength={1000}
            className={`w-full px-3.5 py-3 bg-white border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-y transition-colors ${
              errors.notes ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="Share shaft specifications, floor count, capacity/speed requirements, delivery schedule, or general questions..."
          />
          {errors.notes && (
            <p id="quote-notes-error" role="alert" className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.notes.message}</span>
            </p>
          )}
        </QuotationSection>

        {submitError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-900">Unable to Submit Request</p>
              <p className="text-sm text-red-700 mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Desktop Submit Bar */}
        <div className="hidden md:flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-gray-500 max-w-md">
            You will receive an email confirmation with your quotation reference number and a link to check status anytime.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <span>Submit Quote Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Mobile Sticky Submit Bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-5 bg-[#FF5A1F] hover:bg-[#e54e18] text-white rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <>
                <span>Submit Quote Request</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </QuotationPageShell>
  )
}
