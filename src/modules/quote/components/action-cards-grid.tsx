"use client"

import { MessageSquare, Package, RotateCcw, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function ActionCardsGrid() {
    const cards = [
        {
            icon: MessageSquare,
            title: "Quote Hub",
            description: "View and manage all your quotes in one place.",
            href: "/quotes",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            hoverColor: "hover:border-blue-300"
        },
        {
            icon: Package,
            title: "Browse Catalog",
            description: "Explore our extensive inventory of industrial parts.",
            href: "/catalog",
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
            hoverColor: "hover:border-emerald-300"
        },
        {
            icon: RotateCcw,
            title: "Quick Reorder",
            description: "Repeat past purchases in seconds with one click.",
            href: "/orders",
            bgColor: "bg-violet-50",
            iconColor: "text-violet-600",
            hoverColor: "hover:border-violet-300"
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((card) => (
                <Link
                    key={card.title}
                    href={card.href}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all ${card.hoverColor}`}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className={`rounded-lg ${card.bgColor} p-3 ${card.iconColor}`}>
                            <card.icon className="w-7 h-7" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{card.title}</h3>
                        <p className="text-slate-500 text-sm">{card.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}

