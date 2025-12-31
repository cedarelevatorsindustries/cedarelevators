"use client"

import { Inbox } from "lucide-react"
import Link from "next/link"

interface QuotesSidebarProps {
    activeQuotes?: number
    activeOrders?: number
}

export function QuotesSidebar({ activeQuotes = 0, activeOrders = 0 }: QuotesSidebarProps) {
    const hasActivity = activeQuotes > 0 || activeOrders > 0

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-slate-100 p-5">
                <h3 className="text-lg font-bold text-slate-900">Quotes & Orders</h3>
            </div>

            {!hasActivity ? (
                // Empty State
                <div className="p-6 flex flex-col items-center justify-center flex-1 min-h-[240px] text-center">
                    <div className="mb-4 rounded-full bg-slate-50 p-4 ring-1 ring-slate-100">
                        <Inbox className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-base font-semibold text-slate-900 mb-2">No Active Orders</h4>
                    <p className="text-sm text-slate-500 mb-6 max-w-[200px]">
                        You don't have any orders in progress. Start your first project today.
                    </p>
                    <Link
                        href="/request-quote"
                        className="w-full rounded-lg bg-[#F97316]/10 hover:bg-[#F97316]/20 text-[#F97316] py-2.5 text-sm font-bold transition-colors"
                    >
                        Create New Quote
                    </Link>
                </div>
            ) : (
                // Active State
                <>
                    <div className="flex flex-col">
                        <Link
                            href="/quotes"
                            className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-slate-700">Active Quotes</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">{activeQuotes}</span>
                        </Link>

                        <Link
                            href="/orders"
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-medium text-slate-700">Open Orders</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">{activeOrders}</span>
                        </Link>
                    </div>

                    <div className="bg-slate-50 p-4 text-center border-t border-slate-100 mt-auto">
                        <Link
                            href="/dashboard"
                            className="text-xs font-semibold text-slate-500 hover:text-[#F97316] transition-colors uppercase tracking-wider"
                        >
                            View All Activity
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
