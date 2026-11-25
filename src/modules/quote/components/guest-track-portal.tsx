'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Mail,
  ShieldCheck,
  Loader2,
  FileText,
  Download,
  LogOut,
  ArrowRight,
  Building2,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatINR } from '@/lib/utils/quote-pricing'

interface HistoryQuoteItem {
  id: string
  quote_number: string
  submitted_at: string
  company_name: string | null
  items_count: number
  summary: string
  request_type: string
  status: string
  customer_status: { label: string; tone: string }
  is_issued: boolean
  quoted_total: number | null
  currency: string
  valid_until: string | null
  can_download_pdf: boolean
}

interface GuestTrackPortalProps {
  initialVerifiedEmail: string | null
}

export function GuestTrackPortal({ initialVerifiedEmail }: GuestTrackPortalProps) {
  const router = useRouter()
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(initialVerifiedEmail)

  // Step 1: Email entry
  const [emailInput, setEmailInput] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)

  // Step 2: Authenticated history state
  const [quotes, setQuotes] = useState<HistoryQuoteItem[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoadingHistory, setIsLoadingHistory] = useState(Boolean(initialVerifiedEmail))
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`/api/quotes/track/history?status=${encodeURIComponent(statusFilter)}`)
      if (res.status === 401) {
        setVerifiedEmail(null)
        return
      }
      const data = await res.json()
      if (data.success) {
        setQuotes(data.quotes || [])
      }
    } catch (err) {
      console.error('Failed to load quotation history:', err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (verifiedEmail) {
      loadHistory()
    }
  }, [verifiedEmail, loadHistory])

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = emailInput.trim().toLowerCase()
    if (!cleanEmail) {
      toast.error('Please enter your email address')
      return
    }

    setIsSendingCode(true)
    try {
      const res = await fetch('/api/quotes/track/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Unable to send verification code')
        return
      }
      toast.success('Verification code sent! Check your email inbox.')
      router.push(`/quotes/track/verify?email=${encodeURIComponent(cleanEmail)}`)
    } catch {
      toast.error('Network error while sending verification code')
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/quotes/track/logout', { method: 'POST' })
      setVerifiedEmail(null)
      setQuotes([])
      toast.success('Session ended')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!verifiedEmail) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-16 px-4 flex justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 shadow-sm h-fit space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-orange-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Track Your Quotations</h1>
            <p className="text-sm text-gray-600">
              Enter your email address to securely access your Cedar Elevators quotation history.
            </p>
          </div>

          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label htmlFor="track-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="track-email"
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSendingCode}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5"
            >
              {isSendingCode ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-500 pt-2 border-t border-gray-100">
            No password or account needed. Need a new quotation?{' '}
            <Link href="/quotes/new" className="text-orange-600 hover:underline font-medium">
              Submit request
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const toneBadge: Record<string, string> = {
    info: 'bg-orange-50 text-orange-700 border-orange-200',
    warning: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Quotations</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and track all quotation requests associated with{' '}
              <span className="font-semibold text-gray-900">{verifiedEmail}</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/quotes/new">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm">
                New Quote Request
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-sm border-gray-300"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              End Session
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            {quotes.length} {quotes.length === 1 ? 'quotation' : 'quotations'} found
          </p>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Received</option>
            <option value="reviewing">Under Review</option>
            <option value="quoted">Quoted</option>
            <option value="rejected">Unable to Proceed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* List */}
        {isLoadingHistory ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <h2 className="text-lg font-semibold text-gray-900">No quotations found</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your quotation requests will appear here once you submit them using this email address.
            </p>
            <div className="pt-2">
              <Link href="/quotes/new">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Request a Quotation
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-orange-200 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-gray-900 text-base">
                      #{q.quote_number}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        toneBadge[q.customer_status.tone] || toneBadge.neutral
                      }`}
                    >
                      {q.customer_status.label}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 line-clamp-1">{q.summary}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted{' '}
                      {new Date(q.submitted_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {q.company_name && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {q.company_name}
                      </span>
                    )}
                    <span>
                      {q.items_count === 0 ? 'General Enquiry' : `${q.items_count} Product(s)`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:text-right">
                  {q.is_issued && q.quoted_total !== null && (
                    <div className="sm:mr-2">
                      <p className="text-xs text-gray-500">Quoted Amount</p>
                      <p className="text-lg font-bold text-orange-600">
                        {formatINR(q.quoted_total)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Link href={`/quotes/track/${q.id}`}>
                      <Button variant="outline" size="sm" className="border-gray-300">
                        <span>View Quotation</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>

                    {q.can_download_pdf && (
                      <a href={`/api/quotes/track/${q.id}/pdf`}>
                        <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          PDF
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
