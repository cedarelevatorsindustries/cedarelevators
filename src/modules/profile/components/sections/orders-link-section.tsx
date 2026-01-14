'use client'

import Link from 'next/link'
import { Package, ChevronRight } from 'lucide-react'

export default function OrdersLinkSection() {
    return (
        <section className="border-t pt-8">
            <Link href="/profile/orders">
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                            <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg text-gray-900">Order History</h4>
                            <p className="text-sm text-gray-600">View and manage your past orders</p>
                        </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
            </Link>
        </section>
    )
}
