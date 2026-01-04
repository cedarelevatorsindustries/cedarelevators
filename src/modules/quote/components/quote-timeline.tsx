"use client"

import { MessageCircle, Check, X, Truck, ChevronRight } from "lucide-react"
import Link from "next/link"

export interface QuoteItem {
    id: string
    title: string
    amount: string
    status: "pending" | "accepted" | "dispatched" | "rejected" | "completed"
    expiry?: string
    date?: string
}

interface QuoteTimelineProps {
    quotes?: QuoteItem[]
}

export const QuoteTimeline = ({ quotes }: QuoteTimelineProps) => {
    const defaultQuotes: QuoteItem[] = [
        {
            id: "4343",
            title: "Hospital Lift",
            amount: "₹22 L",
            status: "pending",
            expiry: "Expires 6h"
        },
        {
            id: "4312",
            title: "House Lift",
            amount: "₹18.4 L",
            status: "accepted"
        },
        {
            id: "5678",
            title: "Order #5678",
            amount: "₹5.2 L",
            status: "dispatched",
            date: "Today, 10:00 AM"
        }
    ]

    const displayQuotes = quotes || defaultQuotes

    return (
        <div className="px-4 pb-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
                {displayQuotes.map((item, index) => (
                    <div key={index} className="relative pl-4 border-l-2 border-gray-100 last:border-0">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${item.status === 'pending' ? 'bg-orange-500' :
                                item.status === 'accepted' ? 'bg-green-500' :
                                    item.status === 'dispatched' ? 'bg-blue-500' : 'bg-gray-400'
                            }`} />

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500">
                                            {item.status === 'dispatched' ? 'ORDER' : 'QUOTE'} #{item.id}
                                        </span>
                                        {item.expiry && (
                                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                                {item.expiry}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg mt-0.5">{item.title}</h3>
                                </div>
                                <span className="font-bold text-gray-900">{item.amount}</span>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex items-center gap-2">
                                {item.status === 'pending' && (
                                    <>
                                        <button className="flex-1 bg-black text-white text-sm font-bold py-2.5 rounded-lg shadow-lg shadow-gray-200 active:scale-95 transition-transform">
                                            Accept
                                        </button>
                                        <button className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg active:scale-95 transition-transform">
                                            Counter
                                        </button>
                                        <button className="p-2.5 bg-green-50 text-green-600 rounded-lg active:scale-95 transition-transform">
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {item.status === 'accepted' && (
                                    <button className="w-full bg-green-600 text-white text-sm font-bold py-2.5 rounded-lg shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                        Convert to Order <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}

                                {item.status === 'dispatched' && (
                                    <button className="w-full bg-blue-50 text-blue-700 text-sm font-bold py-2.5 rounded-lg border border-blue-100 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                        <Truck className="w-4 h-4" /> Track Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

