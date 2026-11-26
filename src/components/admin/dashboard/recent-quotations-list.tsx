"use client"

import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  FileText,
  ArrowRight,
  Building2,
  AlertCircle,
} from "lucide-react"
import type { DashboardRecentQuote } from "@/lib/actions/admin-dashboard"
import { ChartEmptyState } from "./chart-empty-state"

interface RecentQuotationsListProps {
  quotations: DashboardRecentQuote[]
  isLoading?: boolean
  error?: string | null
}

function getMinimalQuoteStatus(status: string): {
  label: string
  dotColor: string
  textColor: string
} {
  switch (status) {
    case "submitted":
    case "pending":
      return { label: "Submitted", dotColor: "#E85A24", textColor: "#B94A1E" }
    case "reviewing":
      return { label: "Under Review", dotColor: "#4D6F8F", textColor: "#3D5B77" }
    case "quoted":
    case "approved":
      return { label: "Quoted", dotColor: "#238A62", textColor: "#1E7553" }
    case "rejected":
      return { label: "Rejected", dotColor: "#C84B42", textColor: "#B13C34" }
    case "expired":
      return { label: "Expired", dotColor: "#A09B94", textColor: "#77736D" }
    case "converted":
      return { label: "Converted", dotColor: "#238A62", textColor: "#1E7553" }
    default:
      return { label: status || "Unknown", dotColor: "#A09B94", textColor: "#77736D" }
  }
}

export function RecentQuotationsList({
  quotations,
  isLoading = false,
  error = null,
}: RecentQuotationsListProps) {
  return (
    <section className="cedar-admin-card flex h-full flex-col">
      <div className="cedar-admin-card-header flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h3
            className="text-[17px] font-semibold tracking-tight"
            style={{ color: "#171717" }}
          >
            Recent Quotations
          </h3>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "#77736D" }}>
            Latest incoming B2B and customer quotation enquiries.
          </p>
        </div>
        <Link href="/admin/quotes" className="cedar-admin-btn-subtle shrink-0">
          <span>View All Quotations</span>
          <ArrowRight className="h-3.5 w-3.5" style={{ color: "#77736D" }} />
        </Link>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="cedar-admin-divided px-5 sm:px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="h-8 w-8 animate-pulse rounded-lg shrink-0"
                    style={{ backgroundColor: "#F3F2EE" }}
                  />
                  <div className="space-y-1.5 flex-1">
                    <div
                      className="h-3.5 w-40 animate-pulse rounded"
                      style={{ backgroundColor: "#F3F2EE" }}
                    />
                    <div
                      className="h-3 w-56 animate-pulse rounded"
                      style={{ backgroundColor: "#F7F6F3" }}
                    />
                  </div>
                </div>
                <div
                  className="h-4 w-20 animate-pulse rounded"
                  style={{ backgroundColor: "#F3F2EE" }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <ChartEmptyState
            icon={AlertCircle}
            title="Unable to Load Quotations"
            description={error}
          />
        ) : quotations.length === 0 ? (
          <ChartEmptyState
            icon={FileText}
            title="No Quotations Yet"
            description="When customers submit quotation requests, they will appear here for review."
          />
        ) : (
          <div className="cedar-admin-divided">
            {quotations.map((quote) => {
              const statusInfo = getMinimalQuoteStatus(quote.status)
              const submittedDate = new Date(quote.createdAt)
              const itemSummary =
                quote.itemCount > 0
                  ? `${quote.itemCount} ${quote.itemCount === 1 ? "product" : "products"}`
                  : "General enquiry"

              return (
                <Link
                  key={quote.id}
                  href={`/admin/quotes/${quote.id}`}
                  className="group flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-[#F9F8F5] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1 sm:items-center">
                    <div
                      className="cedar-admin-icon-well mt-0.5 sm:mt-0"
                      style={{ width: 32, height: 32 }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className="text-[13.5px] font-medium truncate"
                          style={{ color: "#171717" }}
                        >
                          {quote.customerName}
                        </span>
                        <span
                          className="font-mono text-[11.5px]"
                          style={{ color: "#77736D" }}
                        >
                          {quote.quoteNumber}
                        </span>
                      </div>
                      <div
                        className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[12px]"
                        style={{ color: "#77736D" }}
                      >
                        {quote.companyName && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[180px]">
                            <Building2
                              className="h-3 w-3 shrink-0"
                              style={{ color: "#A09B94" }}
                            />
                            <span className="truncate">{quote.companyName}</span>
                          </span>
                        )}
                        <span>{itemSummary}</span>
                        <span style={{ color: "#DCD8CE" }}>·</span>
                        <span title={format(submittedDate, "PPp")}>
                          {formatDistanceToNow(submittedDate, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pl-11 sm:pl-0 sm:justify-end shrink-0">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: statusInfo.textColor }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: statusInfo.dotColor }}
                      />
                      {statusInfo.label}
                    </span>

                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: "#77736D" }}
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
