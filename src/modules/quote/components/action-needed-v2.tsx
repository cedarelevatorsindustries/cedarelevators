"use client"

import { AlertTriangle, Receipt, Clock } from "lucide-react"
import Link from "next/link"

interface ActionItem {
    type: "approval" | "expiring"
    title: string
    subtitle: string
    href: string
    ctaText: string
}

interface ActionNeededV2Props {
    actions?: ActionItem[]
}

export function ActionNeededV2({ actions = [] }: ActionNeededV2Props) {
    if (!actions || actions.length === 0) {
        return null
    }

    return (
        <section className="mb-8">
            <div className="flex items-center gap-2 mb-4 px-1">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Action Needed</h2>
            </div>

            <div className="flex flex-col gap-3">
                {actions.slice(0, 2).map((action, index) => {
                    const isApproval = action.type === "approval"
                    return (
                        <div
                            key={index}
                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4 transition-all ${isApproval
                                    ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                                    : "border-slate-200 bg-white hover:shadow-sm"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isApproval ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                                    }`}>
                                    {isApproval ? <Receipt className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{action.title}</p>
                                    <p className="text-sm text-slate-500">{action.subtitle}</p>
                                </div>
                            </div>
                            <Link
                                href={action.href}
                                className="w-full sm:w-auto shrink-0 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center"
                            >
                                {action.ctaText}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

