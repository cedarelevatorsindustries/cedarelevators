"use client"

import { Quote, QuoteStatus } from "@/types/b2b/quote" // Updated import
import { Check, Clock, FileText, CheckCircle, XCircle, ShoppingCart, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface QuoteStatusTimelineProps {
    status: QuoteStatus
    createdAt: string
    reviewingStartedAt?: string
    approvedAt?: string
    rejectedAt?: string
    rejectedBy?: string
    convertedAt?: string
    expiredAt?: string
}

interface TimelineStep {
    label: string
    status: "completed" | "current" | "pending" | "skipped"
    icon: React.ComponentType<{ className?: string }>
    timestamp?: string
    note?: string
}

export default function QuoteStatusTimeline({
    status,
    createdAt,
    reviewingStartedAt,
    approvedAt,
    rejectedAt,
    rejectedBy,
    convertedAt,
    expiredAt
}: QuoteStatusTimelineProps) {


    const getTimelineSteps = (): TimelineStep[] => {
        const steps: TimelineStep[] = [
            {
                label: "Quote Submitted",
                status: "completed",
                icon: FileText,
                timestamp: createdAt
            },
            {
                label: "Under Review",
                status: reviewingStartedAt ? "completed" : status === "reviewing" ? "current" : "pending",
                icon: Clock,
                timestamp: reviewingStartedAt || undefined
            }
        ]

        // Handle different terminal states
        if (status === "approved" || status === "converted") {
            steps.push({
                label: "Quote Approved",
                status: "completed",
                icon: CheckCircle,
                timestamp: approvedAt || undefined
            })

            if (status === "converted") {
                steps.push({
                    label: "Converted to Order",
                    status: "completed",
                    icon: ShoppingCart,
                    timestamp: convertedAt || undefined
                })
            } else {
                steps.push({
                    label: "Convert to Order",
                    status: "pending",
                    icon: ShoppingCart
                })
            }
        } else if (status === "rejected") {
            steps.push({
                label: "Quote Rejected",
                status: "completed",
                icon: XCircle,
                timestamp: rejectedAt || undefined,
                note: rejectedBy ? `Rejected by ${rejectedBy}` : undefined
            })
        } else if (status === "expired") {
            steps.push({
                label: "Quote Expired",
                status: "completed",
                icon: AlertCircle,
                timestamp: expiredAt || undefined
            })
        } else {
            // Still in progress
            steps.push({
                label: "Decision Pending",
                status: status === "reviewing" ? "current" : "pending",
                icon: CheckCircle
            })
        }

        return steps
    }

    const steps = getTimelineSteps()

    const getStepColor = (stepStatus: TimelineStep["status"]) => {
        switch (stepStatus) {
            case "completed":
                return "bg-green-500 border-green-500"
            case "current":
                return "bg-blue-500 border-blue-500 animate-pulse"
            case "pending":
                return "bg-gray-200 border-gray-300"
            case "skipped":
                return "bg-red-500 border-red-500"
        }
    }

    const getLineColor = (stepStatus: TimelineStep["status"]) => {
        return stepStatus === "completed" ? "bg-green-500" : "bg-gray-200"
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quote Progress</h2>

            <div className="relative">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isLast = index === steps.length - 1

                    return (
                        <div key={index} className="relative pb-8 last:pb-0">
                            {/* Connecting Line */}
                            {!isLast && (
                                <div
                                    className={`absolute left-4 top-8 w-0.5 h-full ${getLineColor(step.status)}`}
                                    style={{ transform: "translateX(-50%)" }}
                                />
                            )}

                            {/* Step Content */}
                            <div className="relative flex items-start gap-4">
                                {/* Icon Circle */}
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)}`}
                                >
                                    <Icon className={`w-4 h-4 ${step.status === "pending" ? "text-gray-400" : "text-white"}`} />
                                </div>

                                {/* Step Details */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className={`font-medium ${step.status === "pending" ? "text-gray-400" : "text-gray-900"}`}>
                                        {step.label}
                                    </p>
                                    {step.timestamp && (
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {format(new Date(step.timestamp), "MMM d, yyyy 'at' h:mm a")}
                                        </p>
                                    )}
                                    {step.note && (
                                        <p className="text-sm text-gray-600 mt-1 italic">
                                            {step.note}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
