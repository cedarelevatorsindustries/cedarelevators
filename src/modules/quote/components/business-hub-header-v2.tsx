"use client"

import { Search, Building2 } from "lucide-react"

interface BusinessHubHeaderV2Props {
    companyName?: string
}

export function BusinessHubHeaderV2({ companyName }: BusinessHubHeaderV2Props) {
    return (
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10 py-4 shadow-sm">
            <div className="flex items-center gap-8">
                {/* Logo & Title */}
                <div className="flex items-center gap-3">
                    <div className="size-8 text-[#F97316] flex items-center justify-center">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {companyName || "Business Hub"}
                    </h2>
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex w-[400px]">
                    <div className="relative flex w-full items-center rounded-lg bg-slate-100 focus-within:ring-2 focus-within:ring-[#F97316]/50 transition-all">
                        <div className="flex items-center justify-center pl-4 text-slate-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none py-2.5 pl-3 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                            placeholder="Search by part number, order ID..."
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Navigation & CTA */}
            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-6">
                    <a href="/dashboard" className="text-slate-600 text-sm font-medium hover:text-[#F97316] transition-colors">
                        Dashboard
                    </a>
                    <a href="/catalog" className="text-slate-600 text-sm font-medium hover:text-[#F97316] transition-colors">
                        Catalog
                    </a>
                    <a href="/orders" className="text-slate-600 text-sm font-medium hover:text-[#F97316] transition-colors">
                        Orders
                    </a>
                </div>

                <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

                <button className="hidden sm:flex items-center justify-center rounded-lg bg-[#F97316] px-5 py-2.5 text-white shadow-md hover:bg-[#ea580c] transition-all text-sm font-bold">
                    Request Quote
                </button>
            </div>
        </header>
    )
}

